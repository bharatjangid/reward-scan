
-- 1. Create validate_agent_code function to prevent enumeration
CREATE OR REPLACE FUNCTION public.validate_agent_code(code_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.agent_codes
    WHERE code = UPPER(code_input) AND used = false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_agent_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_agent_code(TEXT) TO authenticated;

-- Remove the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read agent codes for signup" ON public.agent_codes;

-- 2. Create atomic redeem_qr_code function to prevent race conditions
CREATE OR REPLACE FUNCTION public.redeem_qr_code(
  p_code TEXT,
  p_user_id UUID,
  p_user_name TEXT
)
RETURNS TABLE(success BOOLEAN, points INTEGER, product_name TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qr_record RECORD;
BEGIN
  -- Atomically update QR code status (prevents race condition)
  UPDATE qr_codes
  SET status = 'redeemed',
      redeemed_by = p_user_id,
      redeemed_by_name = p_user_name,
      redeemed_at = NOW()
  WHERE code = UPPER(p_code) AND status = 'pending'
  RETURNING * INTO v_qr_record;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, ''::TEXT, 'Code invalid or already used'::TEXT;
    RETURN;
  END IF;

  -- Update batch count
  UPDATE qr_batches
  SET redeemed_count = redeemed_count + 1
  WHERE id = v_qr_record.batch_id;

  -- Update user points
  UPDATE profiles
  SET points = points + v_qr_record.points,
      total_earned = total_earned + v_qr_record.points
  WHERE user_id = p_user_id;

  -- Log activity
  INSERT INTO activity_logs (user_id, type, description, points)
  VALUES (p_user_id, 'scan', 'Scanned QR from ' || v_qr_record.product_name, v_qr_record.points);

  RETURN QUERY SELECT TRUE, v_qr_record.points, v_qr_record.product_name, 'Success'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_qr_code(TEXT, UUID, TEXT) TO authenticated;
