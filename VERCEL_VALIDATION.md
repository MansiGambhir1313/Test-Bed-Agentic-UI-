# Vercel deployment validation

## Result: deployment is working

The URLs you shared return a **200** response and serve content. The app is deployed and reachable.

- **Root:** `https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/`
- **/new:** `https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/new`

Both URLs hit **Vercel Deployment Protection** (login/SSO) before showing your app. That is expected for **preview** deployments.

---

## How to test in a browser

1. **While logged into Vercel** (same account that owns the project):  
   Open the URL in your browser. You may be auto-redirected through Vercel SSO, then see your app (Deep Agents UI).

2. **Production domain (no protection):**  
   If you have a **production** domain (e.g. `test-bed-agentic.vercel.app` or a custom domain), open that. Production can be set to “Public” so anyone can open it without logging in.

3. **Turn off protection for previews (optional):**  
   In Vercel: **Project → Settings → Deployment Protection**.  
   You can set **Preview deployments** to “Only Standard Protection” or “Vercel Authentication” off so preview URLs are publicly viewable (less secure).

---

## Checklist

- [x] Deployment responds (no 404)
- [x] `/` and `/new` both hit the same protection/app (SPA routing works)
- [ ] You opened the URL in a browser **while logged into Vercel** and saw the app
- [ ] You set **VITE_API_URL** in Vercel env to your agent URL so the UI can call the backend

---

## If the app loads but “can’t reach API”

In **Vercel → Project → Settings → Environment Variables**, add:

- **Name:** `VITE_API_URL`  
- **Value:** your agent backend URL (e.g. Railway agent URL: `https://xxx.up.railway.app`)  
- **Environments:** Production (and Preview if you use it)

Then **redeploy** so the new value is baked into the build.
