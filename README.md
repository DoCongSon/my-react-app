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
