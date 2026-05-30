# 立体几何平台 - Bug修复报告

## 修复的问题

### 1. UnfoldManager构造函数参数不匹配 (Critical)
**文件**: `src/main.js`
**问题**: UnfoldManager初始化时传递了错误的参数 `(scene, camera, renderer)`，但其构造函数期望 `(scene, geometryFactory)`
**影响**: 应用无法加载，UnfoldManager内部的geometryFactory为undefined
**修复**: 
- 将UnfoldManager的初始化从`initFeatures()`移动到`initGeometry()`
- 确保在GeometryFactory创建之后再初始化UnfoldManager
- 传递正确的参数：`new UnfoldManager(this.scene, this.geometryFactory)`

### 2. CrossSectionManager方法名不匹配 (Critical)
**文件**: `src/main.js`
**问题**: 调用了不存在的方法`toggleVertex(name)`，实际方法名是`toggleVertexSelection(vertexName)`
**影响**: 点击顶点时报错 "this.crossSectionManager.toggleVertex is not a function"
**修复**: 将方法调用改为`this.crossSectionManager.toggleVertexSelection(name)`

### 3. 坐标轴切换只影响标签 (Minor)
**文件**: `src/core/scene.js`
**问题**: `toggleAxes()`方法只切换标签的可见性，不切换坐标轴线条和箭头
**影响**: 用户关闭坐标轴后，线条和箭头仍然可见
**修复**: 
- 创建`axesGroup`包含所有坐标轴元素（线条、箭头、标签）
- 修改`toggleAxes()`切换整个组的可见性
- 将标签添加到axesGroup而不是直接添加到scene

### 4. 几何体选择网格为空 (Critical)
**文件**: `src/main.js`
**问题**: HTML中的`geometry-grid`元素为空（注释说"由JS动态生成"），但没有JS代码生成按钮
**影响**: 用户无法选择不同的几何体
**修复**: 
- 导入`GEOMETRY_NAMES`用于显示中文名称
- 添加`initGeometryGrid()`方法动态生成按钮
- 添加`updateGeometryGridButtons()`方法更新active状态
- 在`initUI()`中调用`initGeometryGrid()`

## 已知限制

### ToolbarManager元素ID不匹配
**文件**: `src/ui/toolbar.js`
**问题**: ToolbarManager期望的元素ID（如`geometrySelect`, `sizeSlider`, `toggleFaces`等）在HTML中不存在
**影响**: ToolbarManager的事件绑定不会生效，但不影响核心功能
**原因**: HTML使用了不同的ID命名（如`geometry-grid`, `btn-solid`, `opacity-slider`等）
**状态**: 不影响当前功能，因为main.js直接使用getElementById绑定了正确的元素

## 验证

- [x] 构建成功 (`npm run build`)
- [x] 所有25个模块正确转换
- [x] 无语法错误
- [x] 核心功能绑定正确

## 测试建议

1. 加载应用后应显示立方体
2. 左侧工具栏应显示11个几何体选择按钮
3. 点击不同按钮应切换几何体
4. 视图控制按钮应正常工作
5. 显示模式切换应正常工作
6. 展开/折叠功能应正常工作
7. 截面工具应正常工作
