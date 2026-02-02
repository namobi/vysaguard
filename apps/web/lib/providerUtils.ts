import { supabase } from "./supabase";

/**
 * Creates or ensures a provider record exists for the current authenticated user
 * Sets profiles.is_provider = true
 * Creates providers record with status='pending' if it doesn't exist
 * @returns { success: boolean, providerId?: string, error?: string }
 */
export async function createOrEnsureProviderProfile(): Promise<{
  success: boolean;
  providerId?: string;
  error?: string;
}> {
  try {
    // 1. Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // 2. Update profiles.is_provider = true (create profile if missing)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          is_provider: true
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false
        }
      );

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { success: false, error: profileError.message };
    }

    // 3. Check if provider record already exists
    const { data: existingProvider, error: fetchError } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching provider:", fetchError);
      return { success: false, error: fetchError.message };
    }

    // 4. If provider exists, return success
    if (existingProvider) {
      return { success: true, providerId: existingProvider.id };
    }

    // 5. Create new provider record with minimal required fields
    const { data: newProvider, error: createError } = await supabase
      .from("providers")
      .insert({
        user_id: user.id,
        business_name: "", // Will be filled in onboarding
        contact_email: user.email || "",
        status: "pending",
        countries_served: [],
        visa_types_served: [],
        languages_spoken: [],
        provider_types: []
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating provider:", createError);
      return { success: false, error: createError.message };
    }

    return { success: true, providerId: newProvider.id };
  } catch (error: any) {
    console.error("Unexpected error in createOrEnsureProviderProfile:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Checks if the current user is authenticated
 * @returns { isAuthenticated: boolean, user?: any }
 */
export async function checkAuth(): Promise<{
  isAuthenticated: boolean;
  user?: any;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, user };
  } catch (error) {
    console.error("Error checking auth:", error);
    return { isAuthenticated: false };
  }
}

/**
 * Checks the provider status for the current user
 * @returns { isProvider: boolean, isComplete: boolean, providerId?: string }
 */
export async function checkProviderStatus(): Promise<{
  isProvider: boolean;
  isComplete: boolean;
  providerId?: string;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { isProvider: false, isComplete: false };
    }

    // Check profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_provider")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.is_provider) {
      return { isProvider: false, isComplete: false };
    }

    // Check providers table for completeness
    const { data: provider } = await supabase
      .from("providers")
      .select("id, business_name, contact_email, contact_phone, years_experience")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!provider) {
      return { isProvider: true, isComplete: false };
    }

    // Check if provider profile is complete (has required fields filled)
    const isComplete = !!(
      provider.business_name &&
      provider.business_name.trim() !== "" &&
      provider.contact_email &&
      provider.contact_phone &&
      provider.years_experience !== null &&
      provider.years_experience !== undefined
    );

    return {
      isProvider: true,
      isComplete,
      providerId: provider.id
    };
  } catch (error) {
    console.error("Error checking provider status:", error);
    return { isProvider: false, isComplete: false };
  }
}
