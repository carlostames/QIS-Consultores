#!/bin/bash
# ===========================================
# Remove Background from Logos using remove.bg API
# ===========================================
# Usage: ./remove_bg.sh YOUR_API_KEY
# Free tier: 50 images/month at preview quality (up to 0.25 megapixels)
# ===========================================

API_KEY="$1"

if [ -z "$API_KEY" ]; then
  echo "❌ Error: API key required"
  echo "Usage: ./remove_bg.sh YOUR_API_KEY"
  echo ""
  echo "Get your free API key at: https://www.remove.bg/api"
  exit 1
fi

# Directories
INPUT_DIR="assets/logos_finales"
OUTPUT_DIR="assets/logos_nobg"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎨 Remove.bg Background Remover"
echo "================================"
echo "Input:  $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo ""

# Count PNG files
TOTAL=$(ls "$INPUT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "📁 Found $TOTAL PNG logos to process"
echo ""

CURRENT=0
SUCCESS=0
FAILED=0

for file in "$INPUT_DIR"/*.png; do
  CURRENT=$((CURRENT + 1))
  FILENAME=$(basename "$file")
  
  echo "[$CURRENT/$TOTAL] Processing: $FILENAME"
  
  # Call remove.bg API
  HTTP_CODE=$(curl -s -o "$OUTPUT_DIR/$FILENAME" -w "%{http_code}" \
    -H "X-Api-Key: $API_KEY" \
    -F "image_file=@$file" \
    -F "size=auto" \
    -F "type=logo" \
    "https://api.remove.bg/v1.0/removebg")
  
  if [ "$HTTP_CODE" = "200" ]; then
    # Get file sizes for comparison
    ORIG_SIZE=$(wc -c < "$file" | tr -d ' ')
    NEW_SIZE=$(wc -c < "$OUTPUT_DIR/$FILENAME" | tr -d ' ')
    echo "   ✅ Success! ($ORIG_SIZE bytes → $NEW_SIZE bytes)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "   ❌ Failed (HTTP $HTTP_CODE)"
    # Show error details
    cat "$OUTPUT_DIR/$FILENAME" 2>/dev/null
    echo ""
    rm -f "$OUTPUT_DIR/$FILENAME"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "================================"
echo "📊 Results:"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed:  $FAILED"
echo "   📁 Output:  $OUTPUT_DIR/"
echo ""

if [ $SUCCESS -gt 0 ]; then
  echo "🎉 Done! Logos with transparent backgrounds saved to $OUTPUT_DIR/"
  echo ""
  echo "Next step: Update index.html to use logos from '$OUTPUT_DIR/' instead of '$INPUT_DIR/'"
fi
