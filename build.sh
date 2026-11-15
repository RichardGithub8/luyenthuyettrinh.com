#!/usr/bin/env bash
# Tạo thư mục netlify/ để kéo thả lên Netlify: thêm khung HTML đầy đủ quanh index.html.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf netlify && mkdir -p netlify
{
  printf '<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  grep -E '^<(title|meta|link)' index.html
  printf '</head><body>\n'
  grep -vE '^<(title|meta|link)' index.html
  printf '</body></html>\n'
} > netlify/index.html
cp -r css js img netlify/
echo "Đã tạo netlify/ ($(du -sh netlify | cut -f1))"
