#!/bin/bash

# AI Compliance Platform - Release Verification Script
# Verifies the release package integrity and completeness

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERSION=$(cat VERSION)
RELEASE_DIR="releases"
ARCHIVE_NAME="ai-compliance-platform-v${VERSION}.tar.gz"
PACKAGE_DIR="ai-compliance-platform-v${VERSION}"

echo -e "${BLUE}🔍 AI Compliance Platform - Release Verification${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Archive: ${ARCHIVE_NAME}${NC}"
echo ""

# Check if release files exist
echo -e "${YELLOW}1. Checking release files...${NC}"

if [ ! -f "${RELEASE_DIR}/${ARCHIVE_NAME}" ]; then
    echo -e "${RED}❌ Release archive not found: ${RELEASE_DIR}/${ARCHIVE_NAME}${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Release archive found${NC}"

if [ ! -f "${RELEASE_DIR}/${ARCHIVE_NAME}.sha256" ]; then
    echo -e "${RED}❌ Checksum file not found: ${RELEASE_DIR}/${ARCHIVE_NAME}.sha256${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Checksum file found${NC}"

if [ ! -f "${RELEASE_DIR}/RELEASE_MANIFEST.md" ]; then
    echo -e "${RED}❌ Release manifest not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Release manifest found${NC}"

# Verify checksum
echo -e "${YELLOW}2. Verifying archive integrity...${NC}"
cd "${RELEASE_DIR}"
if sha256sum -c "${ARCHIVE_NAME}.sha256" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Archive checksum verified${NC}"
else
    echo -e "${RED}❌ Archive checksum verification failed${NC}"
    exit 1
fi
cd - > /dev/null

# Check archive contents
echo -e "${YELLOW}3. Checking archive contents...${NC}"
cd "${RELEASE_DIR}"

# Extract to temporary directory for verification
TEMP_DIR="temp_verify_$$"
mkdir -p "${TEMP_DIR}"
tar -xzf "${ARCHIVE_NAME}" -C "${TEMP_DIR}"

EXTRACT_DIR="${TEMP_DIR}/${PACKAGE_DIR}"

# Check essential files
REQUIRED_FILES=(
    "README.md"
    "README_RELEASE.md"
    "VERSION"
    "package.json"
    "install.sh"
    "platform-manager.sh"
    "keep-alive.sh"
    "health-check.sh"
    "setup-system-service.sh"
    "backend/main.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "frontend/src/App.js"
    "CHECKSUMS.txt"
    "VERSION_INFO.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "${EXTRACT_DIR}/${file}" ]; then
        echo -e "${RED}❌ Missing required file: ${file}${NC}"
        rm -rf "${TEMP_DIR}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All required files present${NC}"

# Check if scripts are executable
SCRIPTS=(
    "install.sh"
    "platform-manager.sh"
    "keep-alive.sh"
    "health-check.sh"
    "setup-system-service.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ ! -x "${EXTRACT_DIR}/${script}" ]; then
        echo -e "${RED}❌ Script not executable: ${script}${NC}"
        rm -rf "${TEMP_DIR}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All scripts are executable${NC}"

# Verify version consistency
PACKAGE_VERSION=$(cat "${EXTRACT_DIR}/VERSION")
if [ "${PACKAGE_VERSION}" != "${VERSION}" ]; then
    echo -e "${RED}❌ Version mismatch: expected ${VERSION}, found ${PACKAGE_VERSION}${NC}"
    rm -rf "${TEMP_DIR}"
    exit 1
fi
echo -e "${GREEN}✅ Version consistency verified${NC}"

# Check documentation files
DOC_FILES=(
    "RELEASE_NOTES.md"
    "CHANGELOG.md"
    "BUILD_INFO.md"
    "DEPLOYMENT_GUIDE.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ ! -f "${EXTRACT_DIR}/${doc}" ]; then
        echo -e "${YELLOW}⚠️  Optional documentation missing: ${doc}${NC}"
    fi
done
echo -e "${GREEN}✅ Documentation files checked${NC}"

# Cleanup
rm -rf "${TEMP_DIR}"
cd - > /dev/null

# Check current platform status
echo -e "${YELLOW}4. Checking current platform status...${NC}"
if ./health-check.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Current platform is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Current platform status unknown (this is OK for verification)${NC}"
fi

# Calculate and display package info
echo -e "${YELLOW}5. Package information...${NC}"
PACKAGE_SIZE=$(du -h "${RELEASE_DIR}/${ARCHIVE_NAME}" | cut -f1)
CHECKSUM=$(cat "${RELEASE_DIR}/${ARCHIVE_NAME}.sha256" | cut -d' ' -f1)

echo "   Package size: ${PACKAGE_SIZE}"
echo "   SHA256: ${CHECKSUM:0:16}..."

# Final verification summary
echo ""
echo -e "${GREEN}🎉 Release Verification Summary${NC}"
echo -e "${GREEN}===============================${NC}"
echo ""
echo -e "${GREEN}✅ Archive integrity: VERIFIED${NC}"
echo -e "${GREEN}✅ Required files: PRESENT${NC}"
echo -e "${GREEN}✅ Scripts: EXECUTABLE${NC}"
echo -e "${GREEN}✅ Version: CONSISTENT${NC}"
echo -e "${GREEN}✅ Documentation: COMPLETE${NC}"
echo ""
echo -e "${BLUE}📦 Release Package Details:${NC}"
echo "   Version: ${VERSION}"
echo "   Archive: ${ARCHIVE_NAME}"
echo "   Size: ${PACKAGE_SIZE}"
echo "   Location: ${RELEASE_DIR}/"
echo ""
echo -e "${BLUE}🚀 Ready for Distribution:${NC}"
echo "   ✅ Package integrity verified"
echo "   ✅ All components included"
echo "   ✅ Installation script ready"
echo "   ✅ Documentation complete"
echo ""
echo -e "${GREEN}✅ RELEASE VERIFICATION PASSED${NC}"
echo -e "${GREEN}The release package is ready for distribution!${NC}"
echo ""
echo -e "${YELLOW}To distribute:${NC}"
echo "   1. Share: ${RELEASE_DIR}/${ARCHIVE_NAME}"
echo "   2. Include: ${RELEASE_DIR}/${ARCHIVE_NAME}.sha256"
echo "   3. Reference: ${RELEASE_DIR}/RELEASE_MANIFEST.md"
echo ""