#!/bin/bash

# MoodBoarder Pro - 快速部署脚本

echo "🚀 MoodBoarder Pro - Azure部署准备"
echo "=================================="

# 检查是否已经是Git仓库
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
    git add .
    git commit -m "Initial commit: MoodBoarder Pro with image quality optimization"
else
    echo "✅ Git仓库已存在"
fi

echo ""
echo "📋 接下来的步骤："
echo "1. 在GitHub上创建新仓库"
echo "2. 运行以下命令连接到GitHub仓库："
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 在Azure Portal创建Static Web App并连接到GitHub仓库"
echo "4. 配置API密钥环境变量"
echo ""
echo "🔗 详细说明请查看 DEPLOY.md 文件"
echo ""
echo "✨ 部署完成后，你将获得一个可分享的公开URL！"
