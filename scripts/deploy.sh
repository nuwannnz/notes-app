#!/usr/bin/env bash
# deploy.sh — Full deploy pipeline for notes-app
# Usage: bash scripts/deploy.sh [--env dev|prod]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$ROOT_DIR/infrastructure"
FRONTEND_DIR="$ROOT_DIR/apps/frontend"

# ── Argument parsing ──────────────────────────────────────────────────────────
ENV="dev"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; echo "Usage: $0 [--env dev|prod]"; exit 1 ;;
  esac
done

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Error: --env must be 'dev' or 'prod' (got '$ENV')"
  exit 1
fi

ENV_CAP="${ENV^}"   # 'Dev' or 'Prod'
STACK_PREFIX="NotesApp-${ENV_CAP}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "======================================"
echo "  Notes App Deployment — $ENV"
echo "======================================"

# ── Step 1: Build TypeScript backend ─────────────────────────────────────────
echo ""
echo "[1/6] Building TypeScript backend..."
cd "$ROOT_DIR/apps/backend" && npm install --silent && npm run build
echo "      ✓ TypeScript backend built → apps/backend/dist/"

# ── Step 2: Build CDK (TypeScript) ───────────────────────────────────────────
echo ""
echo "[2/6] Building CDK infrastructure..."
cd "$INFRA_DIR"
npm install --silent
npm run build
echo "      ✓ CDK build complete"

# ── Step 2b: Ensure frontend dist exists for CDK synth ────────────────────────
# CDK synthesizes all stacks at once; BucketDeployment needs dist/ to exist.
# We create a placeholder so synth succeeds, then build the real frontend later.
if [[ ! -f "$FRONTEND_DIR/dist/index.html" ]]; then
  echo ""
  echo "      Creating placeholder dist/ for CDK synth..."
  mkdir -p "$FRONTEND_DIR/dist"
  echo '<html><body>Deploying...</body></html>' > "$FRONTEND_DIR/dist/index.html"
fi

# ── Step 3: Deploy Database + Auth + API stacks ───────────────────────────────
echo ""
echo "[3/6] Deploying backend stacks (Database, Auth, Api)..."
cd "$INFRA_DIR"
npx cdk deploy \
  "${STACK_PREFIX}-Database" \
  "${STACK_PREFIX}-Auth" \
  "${STACK_PREFIX}-Api" \
  --context "env=${ENV}" \
  --require-approval never
echo "      ✓ Backend stacks deployed"

# ── Step 4: Capture CDK outputs ──────────────────────────────────────────────
echo ""
echo "[4/6] Capturing stack outputs..."

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-Api" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text \
  --region "$AWS_REGION")

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-Auth" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text \
  --region "$AWS_REGION")

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-Auth" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
  --output text \
  --region "$AWS_REGION")

echo "      API URL:           $API_URL"
echo "      User Pool ID:      $USER_POOL_ID"
echo "      User Pool Client:  $USER_POOL_CLIENT_ID"

# ── Step 5: Build Frontend ───────────────────────────────────────────────────
echo ""
echo "[5/6] Building frontend..."

cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=$API_URL
VITE_COGNITO_USER_POOL_ID=$USER_POOL_ID
VITE_COGNITO_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_AWS_REGION=$AWS_REGION
EOF

cd "$FRONTEND_DIR"
npm install --silent
npm run build
echo "      ✓ Frontend built → apps/frontend/dist/"

# ── Step 6: Deploy Frontend stack ────────────────────────────────────────────
echo ""
echo "[6/6] Deploying frontend stack (S3 + CloudFront)..."
cd "$INFRA_DIR"
npx cdk deploy "${STACK_PREFIX}-Frontend" \
  --context "env=${ENV}" \
  --require-approval never

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-Frontend" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text \
  --region "$AWS_REGION" 2>/dev/null || echo "(not available)")

echo ""
echo "======================================"
echo "  Deploy complete! ($ENV)"
echo "======================================"
echo "  App URL:  $CLOUDFRONT_URL"
echo "  API URL:  $API_URL"
echo "======================================"
