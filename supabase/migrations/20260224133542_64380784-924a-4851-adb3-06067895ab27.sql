
-- Fix QR redemption: use case-insensitive match on BOTH sides
CREATE OR REPLACE FUNCTION public.redeem_qr_code(p_code text, p_user_id uuid, p_user_name text)
 RETURNS TABLE(success boolean, points integer, product_name text, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_qr_record RECORD;
BEGIN
  -- Case-insensitive match using UPPER on both sides
  UPDATE qr_codes
  SET status = 'redeemed',
      redeemed_by = p_user_id,
      redeemed_by_name = p_user_name,
      redeemed_at = NOW()
  WHERE UPPER(code) = UPPER(p_code) AND status = 'pending'
  RETURNING * INTO v_qr_record;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, ''::TEXT, 'Code invalid or already used'::TEXT;
    RETURN;
  END IF;

  UPDATE qr_batches
  SET redeemed_count = redeemed_count + 1
  WHERE id = v_qr_record.batch_id;

  UPDATE profiles
  SET points = points + v_qr_record.points,
      total_earned = total_earned + v_qr_record.points
  WHERE user_id = p_user_id;

  INSERT INTO activity_logs (user_id, type, description, points)
  VALUES (p_user_id, 'scan', 'Scanned QR from ' || v_qr_record.product_name, v_qr_record.points);

  RETURN QUERY SELECT TRUE, v_qr_record.points, v_qr_record.product_name, 'Success'::TEXT;
END;
$function$;
