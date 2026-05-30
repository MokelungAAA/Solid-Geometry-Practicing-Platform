# 立体几何练习平台 · 全功能修复参考文档

> 基于全面代码审查，列出所有12项功能的**现状**、**根因**和**修复方案**。

---

## 项目结构

```
E:\Coding\Htmls\Solid-Geometry\
├── index.html                    # 主HTML（462行）
├── css/
│   ├── material-you.css          # MD3变量+Toast+毛玻璃+设置+证明（391行）
│   ├── material-layout.css       # 布局+练习+折叠（842行）
│   └── material-components.css   # 按钮+输入+卡片组件（488行）
├── src/
│   ├── main.js                   # 主应用类（1708行）⚠️有重复方法
│   ├── core/
│   │   ├── renderer.js           # WebGL+CSS2D渲染器（122行）
│   │   └── scene.js              # 场景+网格+坐标轴（175行）
│   ├── geometry/
│   │   ├── configs.js            # 14种几何体配置+展开参数（437行）
│   │   └── factory.js            # Three.js几何体工厂（409行）
│   └── features/
│       ├── practice.js           # 练习管理器（208行）
│       ├── questionBank.js       # 题库生成（882行）
│       ├── crossSection.js       # 截面工具（538行）
│       ├── unfold.js             # 展开动画（287行）
│       ├── thumbnail.js          # 缩略图生成（213行）
│       └── solution3D.js         # 3D解析（545行）
└── vite.config.js
```

---

## 🔴 关键根因：main.js 重复方法

`main.js` 中以下3个方法被定义了**两次**：

| 方法 | 第一次（旧） | 第二次（新） | 问题 |
|------|-------------|-------------|------|
| `startPractice()` | ~648行 | ~1631行 | 旧版无shuffle、无折叠 |
| `updatePracticeUI()` | ~676行 | ~1664行 | 旧版无证明工具栏 |
| `showHint()` | ~832行 | ~1468行 | 旧版仅toast |

**JS类中后定义的方法会覆盖前者**，所以新版实际生效，但旧版成为死代码，增加文件体积。

---

## 12项功能逐一分析

### 1. 左侧面板卡片太小 → 菜单栏样式

**现状：** `initGeometrySelector()` 在 main.js:189 创建 `.geometry-card`，每个卡片含 `.geometry-thumbnail` + `.geometry-card-name`。

**根因：** 卡片是垂直排列的紧凑项，没有展开详情。

**修复方案：**
- 改卡片为水平菜单项：缩略图 + 信息区（名称+详情） + 展开箭头
- 点击箭头展开显示更多统计信息
- CSS已添加 `.geometry-card-info`、`.geometry-card-detail`、`.geometry-card-expand-icon`

**涉及文件：** `src/main.js` (initGeometrySelector), `css/material-layout.css`

---

### 2. 练习模式全宽显示

**现状：** `startPractice()` 在 main.js:1631 添加 `practice-active` class。

**根因：** CSS已正确实现 `.tab-content.active.practice-active .left-panel` 折叠。需要确保JS添加class到正确元素。

**修复方案：**
- `startPractice()` 中：`document.getElementById('tab-practice')?.classList.add('practice-active')`
- 退出练习时移除该class

**涉及文件：** `src/main.js` (startPractice, exitPractice)

---

### 3. 毛玻璃效果

**现状：** CSS已添加 `.glass`、`.glass-light` utility class，以及 `.left-panel`、`.geometry-info-card` 的 `backdrop-filter: blur`。

**根因：** 需确保HTML元素背景色使用半透明值。

**修复方案：**
- `.left-panel` 背景改为 `rgba(var(--md-surface-rgb), 0.7)`
- `.geometry-info-card` 同理
- 已在CSS中实现

**涉及文件：** `css/material-you.css`, `css/material-layout.css`

---

### 4. 编辑功能

**现状：** `showEditDialog()` 在 main.js:1270 创建编辑面板，含显示/隐藏开关和颜色选择器。

**根因：** 事件绑定通过 `querySelector` 在动态创建的元素上绑定，可能因DOM未就绪而失效。

**修复方案：**
- 确保 `showEditDialog()` 在DOM append后再绑定事件
- 使用 `requestAnimationFrame` 确保DOM渲染完成
- 添加几何体信息展示（顶点数、棱数、面数）

**涉及文件：** `src/main.js` (showEditDialog)

---

### 5. 展开/折叠功能

**现状：** `unfold.js` 的 `createUnfoldGroup()` 检查 `unfoldConfig` 但**不使用其数据**。

**根因：**
1. 展开逻辑仅用面中心到几何体中心的方向向量，忽略pivot/hinge数据
2. **严重缩放错误**：`animate(1)` 让progress到1，但 `updateDisplay()` 内部 `/100`，导致面几乎不动（t=0.01）

**修复方案：**
- 修复缩放：`updateDisplay()` 应接收0-1范围，不再除以100
- 使用 `unfoldConfig` 的pivot数据：按parent关系构建折叠树，围绕hinge轴旋转
- 对每个面应用正确的旋转角度（angle字段）

**涉及文件：** `src/features/unfold.js`

---

### 6. 随机生成几何体

**现状：** `randomGeometry()` 在 main.js:1260 实现，从 `GEOMETRY_CONFIGS` 随机选取。

**根因：** 实现正确，但需确保 `#btn-random` 按钮存在且有事件绑定。

**修复方案：**
- `bindEvents()` 中绑定 `#btn-random` 的click事件
- 按钮HTML已在index.html中添加

**涉及文件：** `src/main.js` (bindEvents, randomGeometry)

---

### 7. 截面选点功能

**现状：** `CrossSectionManager` 有完整的raycasting逻辑（handleClick、updatePreviewPoint、snapToVertex），但**main.js从未绑定鼠标事件**到3D画布。

**根因：** 仅有UI按钮的事件（btn-cross-section-mode、btn-create-section、btn-clear-section），没有canvas上的click/mousemove事件。

**修复方案：**
- 进入截面模式时，在renderer.domElement上添加：
  - `click` → `crossSectionManager.handleClick(event)`
  - `mousemove` → `crossSectionManager.updatePreviewPoint(event)`
- 退出截面模式时移除这些监听器
- 连接回调：`onModeChange`、`onPointsChange`、`onVertexSelect`

**涉及文件：** `src/main.js` (toggleCrossSectionMode)

---

### 8. 信息卡片显示

**现状：** `#geometry-info-card` 在 index.html:239，`updateGeometryInfo()` 更新 `#geometry-name`、`#vertex-count`、`#edge-count`、`#face-count`。

**根因：** z-index可能被canvas遮挡。CSS已添加 `z-index: 5`。

**修复方案：**
- 确保 `.geometry-info-card` 有 `z-index: 5` 和 `position: absolute`
- 确保canvas容器z-index低于信息卡

**涉及文件：** `css/material-layout.css`

---

### 9. 多级提示系统

**现状：** `showHint()` 在 main.js:1468 实现多级提示面板。

**根因：** 需确保生成的提示内容有意义，而非占位文本。

**修复方案：**
- 根据题目类型生成不同级别提示：
  - Level 1（💡概念）：回忆相关公式/定理
  - Level 2（🔍思路）：解题方向
  - Level 3（📝格式）：证明题的书写格式
- 从question对象的hint字段读取第一级提示

**涉及文件：** `src/main.js` (showHint, generateMultiHints)

---

### 10. 证明题模板

**现状：** `createProofToolbar()` 在 main.js:1558 生成28个数学符号按钮。

**根因：** 需确保：
1. 证明题显示工具栏+文本框
2. 点击符号能插入到文本框
3. `bindProofToolbarEvents()` 使用事件委托绑定

**修复方案：**
- `updatePracticeUI()` 中对 `question.type === 'proof'` 的题目调用 `createProofToolbar()`
- `bindProofToolbarEvents()` 使用document级委托，通过 `.proof-symbol-btn` 类识别

**涉及文件：** `src/main.js` (createProofToolbar, bindProofToolbarEvents, updatePracticeUI)

---

### 11. 题目随机性

**现状：** `fisherYatesShuffle()` 在 main.js:1619 实现。

**根因：** `startPractice()` 调用了shuffle，但 `difficulty` 参数被忽略。

**修复方案：**
- `startPractice()` 中对生成的题目应用Fisher-Yates洗牌
- `difficulty` 过滤需在questionBank中实现（按difficulty字段筛选）

**涉及文件：** `src/main.js` (startPractice), `src/features/questionBank.js`

---

### 12. 设置面板

**现状：** `showSettings()` 在 main.js:1225 创建设置面板。

**根因：**
1. 网格/坐标轴开关引用 `this.sceneManager?.gridVisible`（未定义属性）
2. `SceneManager.toggleGrid()` 只切换 `Object3D.visible`，不存储状态

**修复方案：**
- 在 `SceneManager` 中添加 `this.gridVisible = true` 和 `this.axesVisible = true` 属性
- `toggleGrid()` 中同步更新 `this.gridVisible`
- 设置面板读取这些属性设置初始状态

**涉及文件：** `src/core/scene.js`, `src/main.js` (showSettings)

---

### 13. 切换几何体残留点

**现状：** `disposeGroup()` 在 main.js:410 递归释放Three.js资源。

**根因：** `createGeometry()` 调用 `disposeGroup(this.geometryGroup)` 后再 `scene.remove()`。

**修复方案：**
- 确保dispose在remove之前执行
- 递归遍历group的所有child，dispose geometry和material

**涉及文件：** `src/main.js` (createGeometry, disposeGroup)

---

## 额外发现的问题

### PracticeManager 缺少 stopTimer()
`getRecord()` 引用 `this.endTime` 但从未设置。需添加 `stopTimer()` 方法设置 `this.endTime = Date.now()`。

### 难度参数被忽略
`generateQuestions()` 接受 `difficulty` 参数但从不使用。需在questionBank中添加难度过滤逻辑。

### 证明答案验证缺失
`checkProofAnswer()` 总是返回true。需要实现关键词匹配或模糊比对。

### solution3D 内存泄漏
`clearSolution()` 不dispose geometry/material。需添加递归dispose。

---

## 实施优先级

| 优先级 | 功能 | 原因 |
|--------|------|------|
| P0 | 修复重复方法 | 代码质量基础问题 |
| P0 | 修复展开缩放 | 完全失效的功能 |
| P0 | 截面鼠标事件 | 完全失效的功能 |
| P1 | 设置面板状态 | 引用未定义属性 |
| P1 | 证明题模板 | 需验证是否正确渲染 |
| P1 | 练习全宽模式 | 需验证class添加 |
| P2 | 难度过滤 | 功能增强 |
| P2 | 证明答案验证 | 功能增强 |
| P2 | solution3D内存泄漏 | 性能优化 |
