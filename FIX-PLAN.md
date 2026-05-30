# 立体几何平台修复计划 (v0.02)

## 问题清单 (13项)

### 🔴 关键功能问题

#### 1. 设置弹窗无法关闭
**根因**: CSS中 `.settings-overlay` 没有 `visible` 类时仍然可见（可能是 `visibility` 或 `opacity` 默认值问题）
**修复**: 检查 CSS 中 `.settings-overlay` 的默认状态，确保没有 `visible` 类时 `visibility: hidden; opacity: 0`

#### 2. 棱长显示开关失效
**根因**: `_applyChildGroupVisibility('edgeLengthLabels', ...)` 在 `geometryGroup` 中查找，但标签组可能不在 `geometryGroup` 内（在 scene 级别）
**修复**: 改为在 scene 中查找，或确保标签组在 geometryGroup 内

#### 3. 记录面板无法滚动
**根因**: `#wrong-records-list` 的父容器可能没有正确的 flex 布局或 overflow 设置
**修复**: 确保 `.records-panel` 是 flex 列布局，`#wrong-records-list` 有正确的 `flex: 1; overflow-y: auto`

#### 4. 截面模式无法转动几何体
**根因**: 进入截面模式时，OrbitControls 被完全禁用（包括 rotate/zoom/pan）
**修复**: 只禁用平移，保留旋转和缩放；或者改用右键旋转、左键选点的模式

#### 5. 坐标/棱长标签堆叠
**根因**: CSS2DObject 标签在缩放时不会自动调整，全部堆叠在一起
**修复**: 
- 添加基于相机距离的智能显示/隐藏（距离远时隐藏细节标签）
- 标签添加自适应大小（近大远小）
- 添加标签避让算法（避免重叠）

### 🟡 功能完善

#### 6. 随机生成未完成
**根因**: `randomGeometry()` 方法存在但可能没有正确绑定到按钮，或没有与练习系统联动
**修复**: 确保按钮绑定正确，随机生成后自动开始练习

#### 7. 题目质量低
**根因**: 动态生成的题目模板有限，缺乏多样性
**修复**: 
- 增加更多题目模板
- 优化难度分级算法
- 增加知识点覆盖

#### 8. 练习UI未对齐
**根因**: CSS 布局问题，选项按钮、统计区域等未对齐
**修复**: 统一使用 flexbox/grid 布局，添加适当的 gap 和 padding

#### 9. 展开功能问题
**根因**: 
- 长方体/正方体展开时面重叠（BFS展开算法可能有问题）
- 曲面体（圆柱、圆锥）被排除在展开之外
**修复**: 
- 修复 BFS 展开算法，确保面不重叠
- 为曲面体添加近似展开（圆柱→矩形+圆，圆锥→扇形+圆）

#### 10. 知识点选择失效
**根因**: 静态题库的 `knowledgePoints` 字段与 `KNOWLEDGE_POINTS` 的 key 不匹配
**修复**: 统一知识点标签，确保筛选逻辑正确

#### 11. 难度选择失效
**根因**: 难度筛选逻辑可能没有正确应用到题目选择
**修复**: 确保 `difficulty` 参数正确传递到 `autoGenerateQuestion`

#### 12. 开始练习 vs 随机生成
**根因**: 功能重叠，用户不理解区别
**修复**: 
- "开始练习" = 使用当前几何体开始练习
- "随机生成" = 生成随机几何体并开始练习
- 在UI上明确区分

#### 13. 提示功能无用
**根因**: 提示内容太泛泛，缺乏针对性
**修复**: 
- 为每道题添加具体提示
- 提示系统改为分步提示（概念→思路→具体步骤）

## 修复顺序

1. **Phase 1: 关键UI修复** (设置关闭、棱长开关、记录滚动、截面转动)
2. **Phase 2: 标签智能显示** (坐标/棱长自适应)
3. **Phase 3: 功能完善** (随机生成、题目质量、UI对齐、展开修复)
4. **Phase 4: 筛选与提示** (知识点、难度、提示功能)

## 技术方案

### 设置弹窗关闭
```css
.settings-overlay {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
}
.settings-overlay.visible {
  visibility: visible;
  opacity: 1;
}
```

### 棱长显示开关
```javascript
// 改为在 scene 中查找，而不是 geometryGroup
_applyChildGroupVisibility(groupName, visible) {
  this.scene.traverse(child => {
    if (child.name === groupName) child.visible = visible;
  });
}
```

### 截面模式转动
```javascript
// 只禁用平移，保留旋转和缩放
if (enteringCrossSection) {
  this._savedControlsState = {
    enabled: this.controls.enabled,
    enableRotate: this.controls.enableRotate,
    enableZoom: this.controls.enableZoom,
    enablePan: this.controls.enablePan
  };
  this.controls.enablePan = false;  // 只禁用平移
  // 旋转和缩放保持不变
}
```

### 标签智能显示
```javascript
// 在 animate() 中添加
updateLabelsVisibility() {
  const distance = this.camera.position.length();
  const showCoords = distance < 5 && this.settingsManager.getSetting('showCoordInfo');
  const showLength = distance < 4 && this.settingsManager.getSetting('showEdgeLength');
  // 更新标签可见性
}
```

### 展开算法修复
- 使用正确的面法向量计算
- 确保相邻面的展开位置不重叠
- 为曲面体添加近似展开
