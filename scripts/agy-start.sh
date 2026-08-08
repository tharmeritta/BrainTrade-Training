#!/bin/bash
set -e

# Colors for rich terminal output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}🚀 BrainTrade-Training: AGY Workspace Initialization ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Check Markdown & Memories
echo -e "\n${BLUE}1. Checking Documentation & Memories...${NC}"
if [ -f "GEMINI.md" ]; then
  echo -e "  ${GREEN}✓ GEMINI.md present${NC}"
fi
if [ -f "graphify-out/GRAPH_REPORT.md" ]; then
  echo -e "  ${GREEN}✓ Knowledge Graph (graphify-out/GRAPH_REPORT.md) present${NC}"
fi
if [ -f ".gemini/MEMORY.md" ]; then
  echo -e "  ${GREEN}✓ Project Memory (.gemini/MEMORY.md) present${NC}"
fi

# 2. Run Graphify Update
echo -e "\n${BLUE}2. Syncing Graphify Knowledge Graph...${NC}"
if command -v graphify &> /dev/null; then
  graphify update .
  echo -e "  ${GREEN}✓ Knowledge graph updated successfully${NC}"
else
  echo -e "  ${YELLOW}⚠ graphify CLI not found in PATH, skipping graphify update${NC}"
fi

# 3. Run Lint & Type Check
echo -e "\n${BLUE}3. Running Type Check & ESLint (npm run check)...${NC}"
npm run check
echo -e "  ${GREEN}✓ Type check & Lint passed cleanly!${NC}"

# 4. Run Production Build Verification
echo -e "\n${BLUE}4. Verifying Next.js Build (npm run build)...${NC}"
npm run build
echo -e "  ${GREEN}✓ Next.js build verification succeeded!${NC}"

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}✨ Workspace is 100% healthy and ready for AGY session!${NC}"
echo -e "${GREEN}====================================================${NC}"
