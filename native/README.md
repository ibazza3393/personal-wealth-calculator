# Native shell

Web app on Vercel. Native is a Capacitor WebView of that URL — not a static `out/` export (quotes API needs Node).

```bash
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios
npx cap add ios
npx cap open ios
```

Set `WEALTH_NATIVE_URL` if the Vercel host changes. Single user: no Auth0. Akahu OAuth later uses a custom URL scheme (`nz.wealth.os://akahu`) plus `native=true` on the authorize URL so iOS resumes the app.

PWA path without Xcode: install the site to the home screen (manifest already linked).
