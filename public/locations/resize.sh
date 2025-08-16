for file in *; do
  # Only process files that are images (jpg, jpeg, png)
  if [[ "$file" =~ \.(jpg|jpeg|png)$ ]]; then
    # Resize image to max 1024px width or height, keeping aspect ratio
    mogrify -resize '707x471>' "$file"
  fi
done

# 2121 × 1414