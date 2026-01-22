-- Populate profiles for existing users who don't have one yet
-- This is a one-time migration to backfill profiles for users created before the profiles table existed

-- Insert profiles for all users that don't already have a profile
INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
SELECT
  u.id as user_id,
  -- Try to extract full_name from user metadata (works for OAuth users like Google)
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.email -- Fallback to email if no name in metadata
  ) as full_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE NOT EXISTS (
  -- Only insert if profile doesn't already exist
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
AND u.deleted_at IS NULL  -- Skip deleted users
AND u.is_anonymous = false;  -- Skip anonymous users

-- Show results
SELECT
  COUNT(*) as profiles_created,
  'Profiles have been created for existing users' as message
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '1 minute';
