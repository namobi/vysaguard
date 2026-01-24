import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const countryId = url.searchParams.get("country_id");
    const visaTypeId = url.searchParams.get("visa_type_id");
    const providerType = url.searchParams.get("provider_type");

    const admin = getSupabaseAdmin();

    // Build query for verified providers
    let query = admin
      .from("providers")
      .select(`
        id,
        business_name,
        bio,
        provider_type,
        years_experience,
        languages,
        logo_url,
        verified_at,
        provider_service_areas(
          country_id,
          visa_type_id,
          countries(name),
          visa_types(name)
        ),
        provider_reviews(rating)
      `)
      .eq("status", "verified")
      .order("verified_at", { ascending: false });

    if (providerType) {
      query = query.eq("provider_type", providerType);
    }

    const { data: providers, error } = await query;

    if (error) {
      console.error("Provider list error:", error);
      return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
    }

    // Filter by service area if country/visa specified
    let filtered = providers ?? [];
    if (countryId) {
      filtered = filtered.filter((p: any) =>
        p.provider_service_areas?.some((a: any) => a.country_id === countryId)
      );
    }
    if (visaTypeId) {
      filtered = filtered.filter((p: any) =>
        p.provider_service_areas?.some((a: any) => a.visa_type_id === visaTypeId)
      );
    }

    // Compute average rating
    const result = filtered.map((p: any) => {
      const reviews = p.provider_reviews ?? [];
      const avgRating = reviews.length
        ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

      return {
        id: p.id,
        business_name: p.business_name,
        bio: p.bio,
        provider_type: p.provider_type,
        years_experience: p.years_experience,
        languages: p.languages,
        logo_url: p.logo_url,
        verified_at: p.verified_at,
        avg_rating: avgRating,
        review_count: reviews.length,
        service_areas: (p.provider_service_areas ?? []).map((a: any) => ({
          country_name: a.countries?.name ?? null,
          visa_type_name: a.visa_types?.name ?? null,
        })),
      };
    });

    return NextResponse.json({ providers: result });
  } catch (err) {
    console.error("Provider list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
