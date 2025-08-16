#!/bin/bash
for file in *; do
  exiftool -all= "$file"
done


