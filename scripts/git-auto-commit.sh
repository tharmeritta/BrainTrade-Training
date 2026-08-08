#!/bin/bash
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="chore: automated workspace update & graph sync"
fi

echo -e "${CYAN}🚀 Automated GitHub Commit Pipeline${NC}"
echo -e "${CYAN}===================================${NC}"

# 1. Run Type Check & Linting
echo -e "\n${CYAN}1. Running Pre-Commit Verification (npm run check)...${NC}"
npm run check
echo -e "${GREEN}✓ Type Check & Lint passed!${NC}"

# 2. Update Graphify Knowledge Graph
echo -e "\n${CYAN}2. Updating Knowledge Graph (graphify update .)...${NC}"
if command -v graphify &> /dev/null; then
  graphify update .
  echo -e "${GREEN}✓ Knowledge graph updated!${NC}"
fi

# 3. Stage changes
echo -e "\n${CYAN}3. Staging changes...${NC}"
git add .

# 4. Commit
echo -e "\n${CYAN}4. Committing changes: '${COMMIT_MSG}'...${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${CYAN}Nothing new to commit.${NC}"

# 5. Push to GitHub
echo -e "\n${CYAN}5. Pushing to GitHub (origin/main)...${NC}"
git push origin main
echo -e "${GREEN}✨ Successfully verified, committed, and pushed to GitHub!${NC}"
