#!/bin/bash
# 聚合导航页 - 一键部署脚本
# 在阿里云 ECS 上执行此脚本

set -e

echo "========================================="
echo "  聚合导航页 - 部署脚本"
echo "========================================="

# 配置变量
APP_DIR="/opt/nav-site"
REPO_URL="https://github.com/gengmu5588-ship-it/Frog-Fun-Navigation-Website.git"
DOMAIN="links.tbaosearch.asia"  # 替换为你的子域名

# 1. 安装依赖
echo "[1/6] 安装系统依赖..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

if ! command -v git &> /dev/null; then
    apt-get install -y git
fi

# 2. 拉取代码
echo "[2/6] 拉取代码..."
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 3. 安装 Node 依赖
echo "[3/6] 安装 Node 依赖..."
npm install

# 4. 构建前端
echo "[4/6] 构建前端..."
npx vite build

# 5. 配置 systemd 服务
echo "[5/6] 配置后端服务..."
cp deploy/nav-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable nav-backend
systemctl restart nav-backend

# 6. 配置 Nginx
echo "[6/6] 配置 Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/nav
# 替换域名为实际域名
sed -i "s/nav.yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/nav

# 启用站点（如果用 sites-enabled 模式）
if [ -d /etc/nginx/sites-enabled ]; then
    ln -sf /etc/nginx/sites-available/nav /etc/nginx/sites-enabled/nav
fi

# 测试 Nginx 配置
nginx -t

# 重载 Nginx
systemctl reload nginx

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "  前台地址: http://$DOMAIN"
echo "  后台地址: http://$DOMAIN/admin"
echo ""
echo "  后端服务: systemctl status nav-backend"
echo "  Nginx 状态: systemctl status nginx"
echo ""
echo "  如需 HTTPS，执行:"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d $DOMAIN"
echo "========================================="
