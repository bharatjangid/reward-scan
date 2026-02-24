
-- Delete ghost auth users that have no profile (prevents login without signup)
DELETE FROM auth.users WHERE id IN (
  'e2971196-98d7-4140-afe3-776cdae9f2d9',
  '12bfd470-3f89-4589-bd3f-b050e04bd584'
);
