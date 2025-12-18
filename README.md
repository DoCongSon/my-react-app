# Hybrid Auth React App

Frontend for a hybrid authentication flow that combines Firebase client auth with a Node.js Express backend session. The React app signs users in with Google, exchanges the Firebase ID token for an HTTP-only session cookie, and then talks to the backend using that session.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Firebase project with Google sign-in enabled
- Backend API deployed and reachable (e.g. `http://20.247.229.54` via Kubernetes Ingress)

## Environment Variables

Copy the example file and fill in your Firebase project settings:

```bash
cp .env.example .env.local
```

Required keys:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

You may also maintain a `.env` for shared defaults, but Vite automatically picks up `.env.local` for local development.

## Install & Run

```bash
npm install
npm run dev
```

The dev server listens on `http://localhost:5173`. Vite is configured to proxy `/api/*` requests to the backend (`http://20.247.229.54`) with `changeOrigin` enabled, so cookie-authenticated calls work without extra CORS configuration while running locally.

## Authentication Flow

1. User clicks **Sign in with Google**.
2. Firebase SDK handles the popup and returns an ID token.
3. Frontend exchanges the ID token via `POST /api/auth/session` and stores the backend session cookie (HTTP-only).
4. Protected routes run only after Firebase has reported the signed-in user and the session exchange completes.
5. Subsequent `fetch` calls include `credentials: 'include'` so the backend session cookie is sent automatically.

Use the `AuthProvider` context (`src/context/AuthContext.tsx`) to access `user`, `loading`, `loginWithGoogle`, and `logout` in components.

## Linting & Build

```bash
npm run lint
npm run build
```

The project uses React 19 with the React Compiler (via `babel-plugin-react-compiler`) and TypeScript strict mode through Vite.

## Containerization

The repository already includes a multi-stage `Dockerfile` that builds the Vite app and serves the static assets with Nginx:

1. Build image stage (`node:20-alpine`) installs dependencies and runs `npm run build`.
2. Runtime stage (`nginx:alpine`) copies the compiled `dist/` folder and uses `nginx.conf` to support SPA routing.

To build the image locally:

```bash
docker build -t <registry>.azurecr.io/<image-name>:<tag> .
```

## Push to Azure Container Registry (ACR)

1. Log in to Azure CLI and ACR:

   ```bash
   az login
   az acr login --name <registry>
   ```

2. Tag the image for ACR:

   ```bash
   docker tag <local-image> <registry>.azurecr.io/<image-name>:<tag>
   ```

3. Push the image:

   ```bash
   docker push <registry>.azurecr.io/<image-name>:<tag>
   ```

Helpful shortcut using `az acr build` (build & push in Azure without local Docker):

```bash
az acr build --registry <registry> --image <image-name>:<tag> .
```

## Deploy to AKS from ACR

1. Ensure your AKS cluster can pull from ACR:

   ```bash
   az aks update -n <aks-name> -g <resource-group> --attach-acr <registry>
   ```

   or create a Kubernetes secret (`acr-secret`) with `kubectl create secret docker-registry`.

2. Update `frontend.yaml` to point to the pushed image (e.g. `image: <registry>.azurecr.io/<image-name>:<tag>`).

3. Apply the manifest:

   ```bash
   kubectl apply -f frontend.yaml
   ```

   The manifest defines:

   - Deployment running the Nginx container
   - `imagePullSecrets` referencing `acr-secret` (if used)
   - ClusterIP Service exposing port 80 within the cluster

4. Expose externally:

   - Create/verify an Ingress pointing to `frontend-service`
   - Or, change the service type to `LoadBalancer` for direct exposure (not recommended for production without Ingress)

5. Verify rollout:

   ```bash
   kubectl get pods
   kubectl describe deployment frontend-deployment
   kubectl logs deployment/frontend-deployment
   ```

After deployment, requests routed through your Ingress IP (e.g. `http://20.247.229.54`) will serve the built React app. Ensure the backend API URL matches the AKS-accessible endpoint; the Vite proxy is only used during local development.

## Google Analytics (GA4)

The app integrates GA4 via `src/utils/analytics.ts`. Events only send when the app runs outside `localhost` and `VITE_GA_ID` is configured.

### Access the Property

1. Go to [https://analytics.google.com](https://analytics.google.com) and sign in with the Firebase project account.
2. Select the GA4 property whose Measurement ID matches `VITE_GA_ID`.
3. Use “Admin → Data Streams” if you need to confirm the Measurement ID or stream settings.

### Validate in Realtime

- Navigate to **Reports → Realtime**.
- Trigger events from the deployed site (e.g. the pricing CTAs on `/analytics-test`).
- Look for event names such as `page_view` and custom events (e.g. `Pricing CTA` category) in the realtime dashboard.

### Explore Logged Events

1. Open **Reports → Engagement → Events** to view aggregated counts of events sent by the app.
2. Click an event to see parameters such as `event_category`, `event_action`, and `event_label` recorded by `logEvent`.
3. Use **Reports → Engagement → Pages and screens** for page-view metrics emitted by `logPageView`.

### Build Explorations (Optional)

- In **Explore**, create a “Free form” exploration.
- Add dimensions like `eventName` and metrics like `Event count` to analyze specific CTAs or flows.
- Apply filters for `eventCategory = Pricing CTA` or other labels you pass to `logEvent`.

### Troubleshooting Tips

- Confirm `VITE_GA_ID` is present in the deployed environment (`view-source` should show the GA4 script with the Measurement ID when analytics initialize).
- If events aren’t appearing, ensure the site isn’t running on `localhost` (events are skipped in development) and that ad blockers aren’t blocking GA requests.
- Use the GA DebugView (Enable Chrome’s `ga_debug=1` query param) for step-by-step verification while testing.
