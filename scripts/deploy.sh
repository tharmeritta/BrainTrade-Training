#!/bin/bash
set -e

PROJECT_ID="braintrade-training"
REGION="asia-southeast1"
SERVICE="brainstrade-app"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

echo "🚀 Deploying $SERVICE to Cloud Run..."

# ── 1. Build & push image ─────────────────────────────────────────────────────
echo ""
echo "📦 Building Docker image..."
gcloud builds submit --tag "$IMAGE" --project "$PROJECT_ID"

# ── 2. Ensure secrets exist in Secret Manager ─────────────────────────────────
echo ""
echo "🔐 Syncing secrets..."

create_secret_if_missing() {
  local name=$1
  local value=$2
  if ! gcloud secrets describe "$name" --project "$PROJECT_ID" &>/dev/null; then
    echo "  Creating secret: $name"
    echo -n "$value" | gcloud secrets create "$name" \
      --data-file=- \
      --project "$PROJECT_ID" \
      --replication-policy="automatic"
  else
    echo "  Updating secret: $name"
    echo -n "$value" | gcloud secrets versions add "$name" \
      --data-file=- \
      --project "$PROJECT_ID"
  fi
}

# Load values from .env.local
ENV_FILE="$(dirname "$0")/../.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.local not found at $ENV_FILE"
  exit 1
fi

get_env() {
  grep "^$1=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^"//;s/"$//'
}

create_secret_if_missing "firebase-project-id"    "$(get_env FIREBASE_PROJECT_ID)"
create_secret_if_missing "firebase-client-email"  "$(get_env FIREBASE_CLIENT_EMAIL)"
create_secret_if_missing "firebase-private-key"   "$(get_env FIREBASE_PRIVATE_KEY)"
create_secret_if_missing "openai-api-key"         "$(get_env OPENAI_API_KEY)"
create_secret_if_missing "gemini-api-key"         "$(get_env GEMINI_API_KEY)"

# ── 3. Deploy to Cloud Run ────────────────────────────────────────────────────
echo ""
echo "☁️  Deploying to Cloud Run ($REGION)..."

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --set-env-vars "\
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDc-uPYe3Jm_IU1wv3ZZWqszcMhPLr4oLM,\
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=braintrade-training.firebaseapp.com,\
NEXT_PUBLIC_FIREBASE_PROJECT_ID=braintrade-training,\
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=braintrade-training.firebasestorage.app,\
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=202974490745,\
NEXT_PUBLIC_FIREBASE_APP_ID=1:202974490745:web:91d94234cc44c1c2ffa4a8" \
  --update-secrets "\
FIREBASE_PROJECT_ID=firebase-project-id:latest,\
FIREBASE_CLIENT_EMAIL=firebase-client-email:latest,\
FIREBASE_PRIVATE_KEY=firebase-private-key:latest,\
OPENAI_API_KEY=openai-api-key:latest,\
GEMINI_API_KEY=gemini-api-key:latest"

# ── 4. Print URL ──────────────────────────────────────────────────────────────
echo ""
URL=$(gcloud run services describe "$SERVICE" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format "value(status.url)")

echo "✅ Deployed successfully!"
echo "🌐 URL: $URL"
echo ""
echo "⚠️  Remember to add $URL to Firebase authorized domains:"
echo "   Firebase Console → Authentication → Settings → Authorized domains"
