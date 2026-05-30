@echo off
echo ========================================
echo 立体几何练习平台 - 本地服务器
echo ========================================
echo.
echo 正在启动本地服务器...
echo 启动后请访问: http://localhost:3000
echo 如果端口被占用，请查看控制台输出的实际端口
echo.
echo 按 Ctrl+C 可以停止服务器
echo ========================================
echo.
cd /d "%~dp0"

echo 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
)

echo.
echo 启动开发服务器...
call npm run dev
pause
