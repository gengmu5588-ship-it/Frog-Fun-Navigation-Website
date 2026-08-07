#!/bin/bash
# 聚合导航页 - 一键首次部署脚本 (阿里云 ECS, RHEL/Alibaba Linux 系)
# 执行: bash deploy/deploy.sh
# 注意: 首次部署后需运行 certbot --nginx -d links.tbaosearch.asia 配置 SSL

set -e

APP_DIR="/testpage"
PM2_NAME="nav-backend"
DOMAIN="links.tbaosearch.asia"
REPO_URL="https://github.com/gengmu5588-ship-it/Frog-Fun-Navigation-Website.git"

echo "========================================="
echo "  聚合导航页 - 首次部署"
echo "========================================="

echo "[1/7] 安装系统依赖..."
command -v node >/dev/null 2>&1 || { curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -; yum install -y nodejs; }
command -v nginx >/dev/null 2>&1 || yum install -y nginx
command -v git  >/dev/null 2>&1 || yum install -y git
yum install -y gcc-c++ make python3 2>/dev/null || true

echo "[2/7] 拉取代码..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git fetch origin && git reset --hard origin/main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "[3/7] 安装 Node 依赖..."
npm install --no-audit --no-fund

echo "[4/7] 构建前端..."
umask 022
npx vite build
chmod -R a+rX dist

echo "[5/7] 配置 Nginx..."
# 若已存在 Certbot 管理的配置则不覆盖 (保留 SSL)
if [ ! -f /etc/nginx/conf.d/links.tbaosearch.asia.conf ]; then
  cp deploy/nginx.conf /etc/nginx/conf.d/links.tbaosearch.asia.conf
  echo "已放置 nginx 配置 (首次)"
else
  echo "nginx 配置已存在, 跳过 (保留 Certbot SSL)"
fi
nginx -t && systemctl reload nginx

echo "[6/7] 启动后端 (PM2)..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start "$APP_DIR/server/index.js" --name "$PM2_NAME" --cwd "$APP_DIR"
pm2 save
pm2 startup systemd 2>/dev/null | tail -1 || true

echo "[7/7] 验证..."
sleep 2
curl -s -o /dev/null -w "  后端 3001: %{http_code} %{content_type}\n" http://127.0.0.1:3001/api/nav-data
curl -sk -o /dev/null -w "  公网 /admin/: %{http_code} %{content_type}\n" https://$DOMAIN/admin/ 2>/dev/null || true

echo ""
echo "========================================="
echo "  部署完成!"
echo "  前台: https://$DOMAIN"
echo "  后台: https://$DOMAIN/admin/login"
echo "  账号: admin / jm407351242"
echo "  HTTPS: certbot --nginx -d $DOMAIN"
echo "========================================="
