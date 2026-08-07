#!/bin/bash
# 聚合导航页 - 更新部署脚本
# 在阿里云 ECS 上执行: bash deploy/fix-and-deploy.sh
# 说明: 只更新代码/前端/后端，不覆盖 Nginx 配置 (SSL 由 Certbot 管理)

set -e

APP_DIR="/testpage"
PM2_NAME="nav-backend"
DOMAIN="links.tbaosearch.asia"

echo "========================================="
echo "  聚合导航页 - 更新部署"
echo "========================================="

echo "[1/5] 拉取最新代码..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main
echo "HEAD: $(git rev-parse --short HEAD)  $(git log -1 --format=%s)"

echo "[2/5] 安装依赖..."
npm install --no-audit --no-fund

echo "[3/5] 构建前端 (umask 022 确保 nginx 可读)..."
umask 022
rm -rf dist_new dist_old
npx vite build --outDir dist_new --emptyOutDir
[ -d dist ] && mv dist dist_old
mv dist_new dist
chmod -R a+rX dist
echo "dist 构建完成: $(ls dist)"

echo "[4/5] 重启后端 (PM2)..."
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start "$APP_DIR/server/index.js" --name "$PM2_NAME" --cwd "$APP_DIR"
pm2 save
sleep 2

echo "[5/5] 验证..."
nginx -t && nginx -s reload
curl -s -o /dev/null -w "  后端 3001/api/nav-data -> %{http_code} %{content_type}\n" http://127.0.0.1:3001/api/nav-data
curl -sk -o /dev/null -w "  https://$DOMAIN/admin/       -> %{http_code} %{content_type}\n" https://$DOMAIN/admin/
curl -sk -o /dev/null -w "  https://$DOMAIN/api/nav-data -> %{http_code} %{content_type}\n" https://$DOMAIN/api/nav-data

echo ""
echo "========================================="
echo "  部署完成"
echo "  前台: https://$DOMAIN"
echo "  后台: https://$DOMAIN/admin/login"
echo "  账号: admin / jm407351242"
echo "========================================="
