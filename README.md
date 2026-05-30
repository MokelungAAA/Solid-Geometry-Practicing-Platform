# 高中立体几何交互练习平台

一个基于Three.js的立体几何学习平台，采用Material You设计风格，支持几何体查看、练习模式和做题记录。

## 功能特性

### 查看模式
- 11种几何体：正方体、长方体、圆柱、圆锥、球、正棱柱、正棱锥等
- 3D交互：旋转、缩放、平移
- 视图切换：正视图、侧视图、透视图
- 显示模式：实体、线框、虚线
- 透明度调节
- 辅助元素：地面网格、坐标轴
- 展开/折叠动画
- 截面工具

### 练习模式
- 多种题型：填空题、选择题、证明题、计算题
- 难度分级：简单、中等、困难
- 练习模式：当前几何体、随机混合
- 题目数量：3、5、8、10题可选
- 实时统计：总题数、正确数、正确率

### 做题记录
- 自动记录练习历史
- 统计信息：总练习次数、平均正确率、总用时
- 正确率趋势图表
- 导出/导入JSON格式记录

## 技术栈

- **3D引擎**: Three.js v0.160.0
- **构建工具**: Vite v5.0.0
- **动画库**: GSAP v3.12.5
- **设计风格**: Material Design 3 (Material You)

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装运行

1. **克隆或下载项目**
   ```bash
   # 如果使用git
   git clone <repository-url>
   cd solid-geometry-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 http://localhost:3000

### 使用启动脚本（Windows）

双击运行 `start-server.bat`，脚本会自动：
- 检查并安装依赖
- 启动开发服务器
- 显示访问地址

## 项目结构

```
solid-geometry-platform/
├── css/                    # 样式文件
│   ├── material-you.css   # Material You变量系统
│   ├── material-layout.css # 布局样式
│   └── material-components.css # 组件样式
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   │   ├── scene.js       # 场景管理
│   │   ├── camera.js      # 相机管理
│   │   └── renderer.js    # 渲染器管理
│   ├── features/          # 功能模块
│   │   ├── unfold.js      # 展开折叠
│   │   ├── crossSection.js # 截面工具
│   │   ├── viewControl.js # 视图控制
│   │   ├── practice.js    # 练习模式
│   │   └── records.js     # 做题记录
│   ├── geometry/          # 几何体模块
│   │   ├── configs.js     # 几何体配置
│   │   └── factory.js     # 几何体工厂
│   ├── ui/                # UI模块
│   │   └── toast.js       # Toast提示
│   ├── utils/             # 工具模块
│   │   └── constants.js   # 常量定义
│   └── main.js            # 主入口
├── index.html             # 主页面
├── package.json           # 项目配置
├── start-server.bat       # Windows启动脚本
└── README.md              # 项目说明
```

## 使用说明

### 查看模式
1. 在左侧选择几何体类型
2. 使用鼠标操作3D场景：
   - 左键拖拽：旋转
   - 滚轮：缩放
   - 右键拖拽：平移
3. 调整视图、显示模式、透明度等参数
4. 使用展开/折叠功能查看几何体展开图
5. 使用截面工具创建几何体截面

### 练习模式
1. 选择练习模式（当前几何体/随机混合）
2. 设置题目数量和难度
3. 点击"开始练习"按钮
4. 回答题目并提交答案
5. 查看答案解析和统计信息

### 做题记录
1. 切换到"做题记录"标签
2. 查看历史练习记录和统计信息
3. 使用导出/导入功能备份记录

## 配置说明

### 几何体配置
几何体配置在 `src/geometry/configs.js` 文件中，可以：
- 添加新的几何体类型
- 修改几何体参数
- 调整几何体显示样式

### 题目模板
题目模板在 `src/features/practice.js` 文件中，可以：
- 添加新的题目类型
- 修改题目生成逻辑
- 调整难度分级

## 开发指南

### 添加新几何体
1. 在 `src/geometry/configs.js` 中添加配置
2. 在 `src/geometry/factory.js` 中添加创建方法
3. 更新几何体选择器UI

### 添加新题型
1. 在 `src/features/practice.js` 中添加题目类型
2. 实现题目生成方法
3. 实现答案检查方法
4. 更新UI显示

### 自定义样式
修改CSS变量系统（`css/material-you.css`）来自定义主题：
- 主色调：`--md-primary` 系列
- 表面色：`--md-surface` 系列
- 圆角：`--md-radius-*`
- 间距：`--md-spacing-*`

## 常见问题

### Q: 页面加载后显示空白？
A: 请确保通过本地服务器运行，不要直接打开HTML文件。使用 `npm run dev` 或双击 `start-server.bat`。

### Q: 3D场景不显示？
A: 检查浏览器控制台是否有错误信息。确保浏览器支持WebGL。

### Q: 如何备份做题记录？
A: 在"做题记录"标签中点击"导出"按钮，保存JSON文件。需要恢复时使用"导入"功能。

### Q: 如何添加自定义几何体？
A: 参考 `src/geometry/configs.js` 中的配置格式，添加新的几何体定义。

## 更新日志

### v0.2.0 (2026-05-30)
- 重构为Material You设计风格
- 添加练习模式和做题记录
- 优化UI布局和交互体验
- 添加题目生成系统框架

### v0.1.0 (2026-05-28)
- 初始版本发布
- 基础几何体查看功能
- 展开折叠动画
- 截面工具

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发者。
