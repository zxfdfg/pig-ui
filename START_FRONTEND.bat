@echo off
chcp 65001
echo ========================================
echo 启动 PIG-UI 前端项目
echo ========================================
echo.

cd /d %~dp0

echo [1/2] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
)

echo.
echo [2/2] 启动开发服务器...
echo.
echo 前端地址: http://localhost:8888
echo 商城入口: http://localhost:8888/#/shop
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

call npm run dev

pause
