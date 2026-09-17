# Auth0 Portal Setup Guide (Writex)

Do these steps in the [Auth0 Dashboard](https://manage.auth0.com/) **before** we wire Auth0 into the Writex code.

Goal for Writex:

- Login with **email/password** and **Google**
- **Forgot password** via Auth0
- Same person = **one MongoDB user** (blogs/followers stay linked) whether they use password or Google

Local URLs used in this guide:

| App | URL |
|-----|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5000` |

Replace with your production URLs when you deploy.

---

## Checklist (do in order)

1. [ ] Create / open Auth0 tenant
2. [ ] Create API (backend audience)
3. [ ] Create SPA Application (frontend)
4. [ ] Enable Database connection (email/password)
5. [ ] Enable Google connection
6. [ ] Turn on Account Linking (same email → one Auth0 user)
7. [ ] Configure Forgot Password / email templates
8. [ ] Copy env values into `.env` files
9. [ ] (Later) Import existing Writex users into Auth0

---

## 1. Create or open a tenant

1. Go to [https://manage.auth0.com/](https://manage.auth0.com/) and sign in.
2. If you have no tenant yet: **Create tenant**.
3. Pick a name (e.g. `writex`), region close to you, and environment (`Development` is fine for now).
4. Note your **Domain** (looks like `writex.us.auth0.com`). You will need it as `AUTH0_DOMAIN` / `VITE_AUTH0_DOMAIN`.

---

## 2. Create an API (for the backend)

Auth0 needs an **API** so the frontend can request an access token your backend can verify.

1. Left sidebar → **Applications** → **APIs** → **Create API**.
2. Fill in:
   - **Name:** `Writex API`
   - **Identifier (Audience):** `https://api.writex`  
     (any stable URI string is fine; it does **not** have to be a real URL. Do not change it later without updating env.)
   - **Signing Algorithm:** `RS256`
3. Click **Create**.
4. Open the API → **Settings**:
   - Leave **Allow Offline Access** on if you want refresh tokens (recommended).
5. Copy for later:
   - **Identifier** → `AUTH0_AUDIENCE` / `VITE_AUTH0_AUDIENCE`

Optional (Permissions tab): you can skip scopes for v1; Writex will sync the user then issue its own app JWT.

---

## 3. Create a Single Page Application

1. Left sidebar → **Applications** → **Applications** → **Create Application**.
2. Name: `Writex Web`
3. Choose **Single Page Web Applications** → **Create**.
4. Open the app → **Settings**.

### 3a. Basic settings — copy these

| Auth0 field | Env name |
|-------------|----------|
| Domain | `VITE_AUTH0_DOMAIN` / `AUTH0_DOMAIN` |
| Client ID | `VITE_AUTH0_CLIENT_ID` |
| Client Secret | **Do not put in frontend.** Only needed later for Management API / linking (backend). |

### 3b. Application URIs (critical)

Scroll to **Application URIs** and set:

**Allowed Callback URLs**

```text
http://localhost:5173
```

(Add production later, comma-separated, e.g. `http://localhost:5173https://yourdomain.com`)

**Allowed Logout URLs**

```text
http://localhost:5173
```

**Allowed Web Origins**

```text
http://localhost:5173
```

**Allowed Origins (CORS)**

```text
http://localhost:5173
```

Click **Save Changes**.

### 3c. Advanced settings

1. Still on the app → **Settings** → scroll to **Advanced Settings** → **Grant Types**.
2. Ensure these are checked:
   - Authorization Code
   - Refresh Token
   - (Implicit is not required for modern SPA SDK)
3. **Save Changes**.

### 3d. Connect the API to this app

1. App → **APIs** tab (or authorize via API → Machine to Machine / SPA access).
2. For SPA: under **APIs**, find **Writex API** and ensure the app can request tokens for that audience.
3. In code you will pass `audience: https://api.writex.local` (your Identifier).

---

## 4. Enable Database connection (email + password)

1. Left sidebar → **Authentication** → **Database**.
2. Open **Username-Password-Authentication** (default), or create one named `Writex-Database`.
3. **Settings**:
   - Disable **Requires Username** (Writex uses email).
   - Password policy: at least **Good** (or Fair for early testing).
4. **Applications** tab on that connection: enable **Writex Web**.
5. **Save**.

This connection powers:

- Email/password signup & login
- Forgot password emails

---

## 5. Enable Google social login

1. Left sidebar → **Authentication** → **Social**.
2. Click **Google** → **Create Connection** (or toggle it on).
3. You need Google OAuth credentials:

### 5a. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project → **APIs & Services** → **Credentials**.
3. **Configure OAuth consent screen** (External is fine for testing).
4. **Create Credentials** → **OAuth client ID** → Application type **Web application**.
5. Authorized redirect URIs — Auth0 shows the exact URI on the Google connection page. It looks like:

```text
https://YOUR_TENANT_DOMAIN/login/callback
```

Example: `https://writex.us.auth0.com/login/callback`

6. Copy **Client ID** and **Client Secret** into the Auth0 Google connection form.
7. In Auth0 Google connection → **Applications**: enable **Writex Web**.
8. **Save**.

### 5b. Attributes

On the Google connection, keep at least:

- Email
- Profile (name / picture if you want)

Email must be available for linking to existing Writex users.

---

## 6. Account linking (same email = same person)

So a password user and Google user with the **same verified email** become one Auth0 identity (and later one Mongo user).

### 6a. Enable “Users with the same email”

1. Go to **Actions** → **Library** (or **Flows**).
2. Open the **Login** flow.
3. Add Auth0’s **Account Link** / use the recommended **“Link Accounts with Same Email Address”** approach:

**Recommended for v1 — Post-Login Action (email match):**

1. **Actions** → **Flows** → **Login**.
2. **Custom** → **Create Action**:
   - Name: `Link accounts by verified email`
   - Trigger: Login / Post Login
3. Use Auth0’s documented “Link User Accounts” pattern (Management API) **or** install Auth0’s marketplace action **“Account Link”** if available in your tenant.
4. Drag the action into the Login flow **between** Start and Complete.
5. **Deploy**.

> If Actions UI differs: search Auth0 docs for **“Automatic Account Linking”** / **“Link accounts with the same email address”** and follow the current marketplace Action. Goal is: Database user + Google user with the same verified email get linked into one Auth0 `user_id` / identity list.

### 6b. What Writex backend will still do

Even with Auth0 linking, the backend will:

1. Verify the Auth0 token
2. Read `sub` + verified `email`
3. Find Mongo user by `auth0Sub`, else by **email**, else create
4. Never create a second Mongo user for the same email

That keeps blogs (`author`) and followers on the same `_id`.

---

## 7. Forgot password

Auth0 handles this; you do not build custom reset tokens for v1.

1. **Branding** → **Email Templates** (or **Authentication** → **Database** → Password Reset).
2. Open **Change Password** / **Password Reset** template → set **Status: On**.
3. Customize From / Subject if you want (optional).
4. **Branding** → **Universal Login**:
   - New Universal Login should be **ON**
   - Login page will show email/password, Google, and “Forgot password?”

Frontend will either:

- Use Universal Login (Auth0 Hosted Login) — Forgot password is built in, or
- Call Auth0’s change-password endpoint / redirect for reset

No extra Auth0 “Forgot Password app” is required beyond enabling the template and Database connection.

### Test forgot password

1. Create a test Database user in **User Management** → **Users** → **Create User**.
2. Open Universal Login → **Forgot password** → enter that email.
3. Check inbox (and Auth0 **Monitoring** → **Logs** if email does not arrive).

For production, configure a custom email provider under **Branding** → **Email Provider** (SendGrid, etc.). Auth0’s built-in email is rate-limited and for development only.

---

## 8. Environment variables to save

Create / update env files after the portal steps (values from Sections 2–3).

### Frontend — `writex/.env`

```env
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
VITE_AUTH0_AUDIENCE=https://api.writex.local
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000
```

### Backend — `Backend/.env`

```env
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_spa_client_id
AUTH0_AUDIENCE=https://api.writex.local
```

`AUTH0_CLIENT_ID` must match the SPA Client ID (`VITE_AUTH0_CLIENT_ID`). The backend verifies Auth0 **ID tokens** with this as the token audience.

Do **not** commit real secrets to git.

---

## 9. Import existing Writex users (so passwords still work)

Do this **after** the Database connection exists, when you are ready to cut over.

Existing Mongo users have **bcrypt** passwords. Auth0 can import them so the same email/password still logs in, then Google can be connected to that same account.

### High-level steps

1. Export from Mongo (email + bcrypt hash + optional name). Format Auth0 expects is documented as **Bulk User Import**.
2. Auth0 Dashboard → **User Management** → **Users** → **Import / Export** (or use Management API `jobs/users-imports`).
3. Choose connection: **Username-Password-Authentication**.
4. Upsert / import with `email_verified: true` if you trust existing emails.
5. After import, test login with an old account password via Universal Login.
6. Then test Google with the **same email** — Account Linking + backend email match should attach to the same Mongo user once code is live.

Auth0 bcrypt import notes:

- Hash must match Auth0’s supported bcrypt format
- If a user’s hash cannot import, that user uses **Forgot password** once

Exact JSON schema: follow Auth0 docs → **Import Users** / **Bulk User Imports**.

---

## 10. Management API app (optional now, needed for “Connect Google” later)

When a logged-in email user clicks **Connect Google** from Profile, the backend may call Auth0 Management API to link identities.

1. **Applications** → **Create Application** → **Machine to Machine**.
2. Name: `Writex Management`
3. Authorize it for **Auth0 Management API**.
4. Grant scopes (minimum for linking):
   - `read:users`
   - `update:users`
   - `create:user_tickets` (if using tickets)
5. Copy Client ID / Secret into backend env (`AUTH0_MGMT_*`).

You can skip this until the Connect Google feature is implemented.

---

## 11. Quick verification in Auth0 (no Writex code yet)

| Test | How |
|------|-----|
| Database signup | Universal Login → Sign up with email |
| Database login | Universal Login → Log in |
| Forgot password | Universal Login → Forgot password → email arrives |
| Google login | Universal Login → Continue with Google |
| Same email link | Create DB user `you@gmail.com`, then Google login with same Gmail — Auth0 should link or show linked identities under the user |

Check **User Management** → **Users** → open a user → **Identities** / Connections to confirm Database + google-oauth2 both appear when linked.

---

## 12. What you do vs what we code later

| You (Auth0 portal) | We (Writex code later) |
|--------------------|-------------------------|
| Tenant, SPA, API, Google, Database | `@auth0/auth0-react` on login/signup |
| Account Linking Action | `POST /users/auth0/sync` + Mongo `auth0Sub` |
| Password reset template | Forgot password button → Auth0 |
| User import job | Keep same Mongo `_id` by email |
| Callback / logout URLs | Auth0Provider + redirect handling |

---

## Common mistakes

- **Callback URL mismatch** → login fails with `redirect_uri` / callback error. Must exactly match `http://localhost:5173` (or your path if you use one).
- **Wrong audience** → API token missing or `Unauthorized`. Audience string must match API Identifier exactly.
- **Google redirect URI** must be Auth0’s `/login/callback`, not your Vite URL.
- **Database connection not enabled** for the SPA → email login missing on Universal Login.
- **Two Mongo users** — prevented in our sync endpoint by email uniqueness; still enable Auth0 linking so Auth0 tokens stay clean.

---

## When you are done

1. Copy env templates:
   - `Backend/.env.example` → `Backend/.env`
   - `writex/.env.example` → `writex/.env`
2. Fill Domain, Client ID, and Audience from this guide.
3. Restart backend + `npm run dev` for the frontend.
4. Open `/login` — you should see **Continue with Google**, **Continue with email (Auth0)**, and **Forgot password?**
5. After Auth0 redirect, Writex calls `POST /users/auth0/sync` and links/creates the Mongo user by **verified email** (same `_id` as an existing password account).

Reply when the portal checklist above is complete if anything fails (callback URL, audience, or email_verified).

Then we can implement the Writex sync endpoint and frontend Auth0 login without touching your existing blogs data model.
