-- Set default owner role for amelien.delahaie@canal-plus.com
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the user ID for amelien.delahaie@canal-plus.com
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'amelien.delahaie@canal-plus.com'
  LIMIT 1;

  -- If user exists, ensure they have the owner role
  IF user_uuid IS NOT NULL THEN
    -- Insert owner role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'owner'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;