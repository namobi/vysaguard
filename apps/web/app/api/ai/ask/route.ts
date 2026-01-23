import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface AskRequestBody {
  question_text: string;
  session_id: string;
  origin_country_id?: string | null;
  destination_country_id?: string | null;
  visa_category_id?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequestBody = await request.json();

    if (!body.question_text || !body.session_id) {
      return NextResponse.json(
        { error: "question_text and session_id are required" },
        { status: 400 }
      );
    }

    // Try to get authenticated user from Authorization header
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabaseAuth.auth.getUser(token);
      if (data.user) {
        userId = data.user.id;
      }
    }

    // Generate AI response (placeholder for now - returns contextual mock)
    const answerText = generateMockResponse(body.question_text);

    // Insert into ai_questions using service role (bypasses RLS)
    const { error: insertError } = await getSupabaseAdmin()
      .from("ai_questions")
      .insert({
        user_id: userId,
        session_id: body.session_id,
        question_text: body.question_text,
        answer_text: answerText,
        origin_country_id: body.origin_country_id || null,
        destination_country_id: body.destination_country_id || null,
        visa_category_id: body.visa_category_id || null,
        metadata: {
          model: "mock-v1",
          timestamp: new Date().toISOString(),
        },
      });

    if (insertError) {
      console.error("Failed to insert ai_question:", insertError);
      return NextResponse.json(
        { error: "Failed to store question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer: answerText });
  } catch (err) {
    console.error("AI ask endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateMockResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("document") || q.includes("requirement")) {
    return "For most visa applications, you'll typically need: a valid passport (6+ months validity), completed application form, passport-sized photos, proof of financial means (bank statements), travel itinerary, and supporting documents specific to your visa category. Use our checklist feature to get a tailored list for your specific route.";
  }

  if (q.includes("how long") || q.includes("timeline") || q.includes("processing")) {
    return "Processing times vary significantly by country and visa type. Tourist visas typically take 2-4 weeks, work visas 1-3 months, and permanent residency applications 6-12 months. Check the specific playbook for your destination to get accurate, up-to-date timelines.";
  }

  if (q.includes("cost") || q.includes("fee") || q.includes("price")) {
    return "Visa fees depend on the destination country and visa category. Government fees range from $50-500 for most categories. Additional costs may include biometrics ($50-100), medical exams ($100-300), and document translation/notarization. Our playbooks include detailed cost breakdowns for each route.";
  }

  if (q.includes("interview") || q.includes("embassy") || q.includes("consulate")) {
    return "Embassy interviews are common for work and immigrant visas. Key tips: arrive early, bring all original documents, be concise and honest in answers, demonstrate ties to your home country (for non-immigrant visas), and have clear knowledge of your travel/work plans. Dress professionally.";
  }

  if (q.includes("reject") || q.includes("denied") || q.includes("refuse")) {
    return "Common visa refusal reasons include: insufficient financial evidence, incomplete documentation, failure to demonstrate ties to home country, prior immigration violations, and inconsistencies in application. If refused, you can usually reapply with stronger documentation. Our platform helps you avoid these pitfalls.";
  }

  return "That's a great question about immigration! While I'm building up my knowledge base, I recommend checking our country-specific playbooks for detailed guidance. You can also use the checklist feature to track your specific requirements. For complex cases, consider connecting with one of our verified immigration professionals.";
}
