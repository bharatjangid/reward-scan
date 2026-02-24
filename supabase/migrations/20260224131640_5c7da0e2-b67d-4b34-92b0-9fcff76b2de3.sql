DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND COALESCE(agent_code, '') <> ''
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can insert own user role'
  ) THEN
    CREATE POLICY "Users can insert own user role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND role = 'user'::public.app_role
    );
  END IF;
END
$$;