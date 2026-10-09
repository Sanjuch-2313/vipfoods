# Google and Facebook login setup

The Login and Register buttons now share a backend authorization-code flow. Provider secrets stay on the server. No plugins or new packages are required.

## 1. Google
1. Open https://console.cloud.google.com/ and select/create your project.
2. Open Google Auth Platform. Configure Branding (VIP Foods, support email), Audience and Data Access for openid, email and profile. Add your test account while the app is in testing.
3. In Clients, create an OAuth client with application type **Web application**.
4. Add these **Authorized redirect URIs** for the environments you use:
   - Local: http://localhost:5001/api/auth/social/google/callback
   - Live: https://api.vipfood.in/api/auth/social/google/callback
5. Copy Client ID and Client Secret into the backend environment variables below. This implementation uses server redirects, not the browser SDK.
6. Complete Google's publishing requirements before making the app available to customers.

Official instructions: https://developers.google.com/identity/protocols/oauth2/web-server

## 2. Facebook / Meta
1. Open https://developers.facebook.com/apps/ and create/select your app with the Facebook Login authentication use case.
2. Configure Facebook Login for Web. Enable Client OAuth Login and Web OAuth Login in its settings.
3. Add **Valid OAuth Redirect URI**:
   https://api.vipfood.in/api/auth/social/facebook/callback
4. Configure the website URL https://vipfood.in and app domain vipfood.in. Supply your actual published privacy policy and user-data deletion instructions URLs.
5. Enable/request email and public_profile access. Complete whichever testing, access, verification and publishing requirements your Meta dashboard shows before allowing public users. Development apps should first be tested with an app-role account.
6. Copy App ID, App Secret and a supported Graph API version from your Meta dashboard into the backend environment. The version must look like vXX.X, with actual numbers.
7. For local Facebook tests, use a development app and an HTTPS callback hostname/tunnel pointing to port 5001. Set OAUTH_API_URL to that HTTPS hostname plus /api and register its exact callback URI. Keep OAUTH_FRONTEND_URL at your actual local frontend origin.

Meta documentation: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
Meta documentation was rate-limited during implementation; dashboard labels and publishing requirements may vary. Follow the requirements displayed for your app.

## 3. Backend environment
Add these values to **vipfoods backend/.env** locally and your backend host's environment settings in production. Do not overwrite existing JWT_SECRET, database or payment settings.

Production example (replace placeholders):
```dotenv
OAUTH_API_URL=https://api.vipfood.in/api
OAUTH_FRONTEND_URL=https://vipfood.in
GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID=YOUR_META_APP_ID
FACEBOOK_CLIENT_SECRET=YOUR_META_APP_SECRET
FACEBOOK_GRAPH_VERSION=YOUR_SUPPORTED_VERSION
```

For local Google testing, use:
```dotenv
OAUTH_API_URL=http://localhost:5001/api
OAUTH_FRONTEND_URL=http://localhost:5173
```

Use the frontend port actually shown by Vite. Its VITE_API_URL must target the same backend (locally http://localhost:5001/api). Start and finish login on exactly the configured frontend origin: localhost vs 127.0.0.1 and www vs non-www are different origins. The browser keeps a one-time login proof in session storage.

Keep secrets only in backend environment settings, never VITE_ variables, git or chat. You may share the public client/app IDs and intended frontend/backend URLs; enter secrets directly in the server configuration.

## 4. Run and check
1. Restart the backend after setting credentials. It needs MongoDB and a Node version supporting fetch (Node 18+; use a supported Node release).
2. Build/deploy the updated frontend and backend together. Frontend hosting must serve the SPA at /social-callback (the existing SPA rewrite should cover it).
3. Test each provider on Login and Register with a new account, then sign out and log in again.
4. Test cancelling consent and an existing email/password account. Existing accounts require their VIP Foods password once before linking. Their wallet, orders and identity remain on the same account.
5. Social accounts don't receive a fabricated phone number; customers still need to supply delivery contact details at checkout.
6. An account first created through one social provider should continue using that provider. Cross-provider linking requires the existing account password; this flow does not silently merge accounts by email.
7. No credentials were supplied during implementation, so live provider sign-in remains unverified. Until configured, the buttons show a clear configuration message and normal password login remains available.

Automated checks:
- Frontend: npm run build
- Backend: node --experimental-vm-modules --test tests/auth.test.js tests/socialAuth.test.js
