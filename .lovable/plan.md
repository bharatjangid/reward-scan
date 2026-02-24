

# Admin User Management Tools

## What's Missing

Currently the admin user management page only has:
- View user details
- Add/deduct points

It's missing critical admin tools for account management.

## What Will Be Added

### 1. Suspend / Activate Toggle
- A toggle button in the user detail dialog and in the table actions
- Updates the `status` field on the `profiles` table between `active` and `suspended`
- Suspended users should be blocked from logging in (enforce in the login/auth flow)

### 2. Delete User Account
- A delete button with a confirmation dialog (type user's name to confirm)
- Calls the existing `admin-delete-user` edge function which removes all related data and the auth account
- The edge function already exists and handles cascading deletion

### 3. Reset Points to Zero
- Quick action to reset a user's points balance to 0
- Logs the action in activity_logs

### 4. Suspended User Login Block
- Update the Login page to check the user's profile status after OTP verification
- If status is `suspended`, sign them out immediately and show an error message

---

## Technical Details

### Files to modify:

**`src/pages/admin/AdminUsers.tsx`**
- Add Suspend/Activate button in table row actions and user detail dialog
- Add Delete button with confirmation dialog (AlertDialog with name-typing confirmation)
- Add Reset Points button in user detail dialog
- Wire up: suspend toggles `profiles.status`, delete calls edge function via `supabase.functions.invoke('admin-delete-user', { body: { user_id } })`, reset updates points to 0

**`src/pages/Login.tsx`**
- After successful OTP verification, query `profiles` table for user's status
- If `status !== 'active'`, call `supabase.auth.signOut()` and show "Account suspended" error

**`supabase/config.toml`**
- Add `[functions.admin-delete-user]` with `verify_jwt = false` (auth is validated manually inside the function)

### No database changes needed
- The `profiles.status` column already exists with `user_status` enum
- The `admin-delete-user` edge function already exists
- Activity logs table already supports logging these actions

