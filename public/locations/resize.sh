for file in *; do
  # Only process files that are images (jpg, jpeg, png)
  if [[ "$file" =~ \.(jpg|jpeg|png)$ ]]; then
    mogrify -resize '1536x1024>' "$file"
  fi
done

# 2121 × 1414