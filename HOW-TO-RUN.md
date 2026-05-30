# 立体几何平台 - 运行说明

## 重要提示

⚠️ **不能直接双击HTML文件打开！**

由于项目使用ES模块（现代JavaScript），必须通过HTTP服务器运行。

## 运行方法

### 方法1：双击批处理文件（最简单）

1. 双击 `start-server.bat` 文件
2. 等待浏览器自动打开 http://localhost:3000
3. 开始使用！

### 方法2：命令行运行

1. 打开命令提示符或PowerShell
2. 进入项目目录：
   ```bash
   cd E:\Coding\Htmls\Solid-Geometry
   ```
3. 运行：
   ```bash
   npm run dev
   ```
4. 浏览器会自动打开 http://localhost:3000

### 方法3：使用Python（如果已安装）

```bash
cd E:\Coding\Htmls\Solid-Geometry
python -m http.server 3000
```

然后访问 http://localhost:3000

## 停止服务器

在命令行窗口按 `Ctrl + C` 即可停止服务器。

## 常见问题

### Q: 为什么不能直接打开HTML文件？
A: 现代JavaScript使用ES模块（import/export），这需要HTTP服务器才能正常工作。直接打开HTML文件会因为安全限制而无法加载模块。

### Q: 端口被占用怎么办？
A: Vite会自动尝试其他端口（如3001、3002等），查看命令行输出的实际端口号。

### Q: 如何部署到GitHub Pages？
A: 运行 `npm run deploy`，会自动构建并部署到GitHub Pages。
