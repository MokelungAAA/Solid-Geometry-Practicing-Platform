/**
 * 常量定义
 * 几何体配置、颜色、尺寸等
 */

// ==================== 几何体类型 ====================

export const GEOMETRY_TYPES = {
  CUBE: 'cube',
  RECTANGULAR_BOX: 'rectangularBox',
  TRIANGULAR_PRISM: 'triangularPrism',
  TETRAHEDRON: 'tetrahedron',
  SQUARE_PYRAMID: 'squarePyramid',
  HEXAGONAL_PRISM: 'hexagonalPrism',
  TRIANGULAR_PYRAMID: 'triangularPyramid',
  CYLINDER: 'cylinder',
  CONE: 'cone',
  SPHERE: 'sphere'
};

// ==================== 几何体配置 ====================

export const GEOMETRY_CONFIGS = {
  [GEOMETRY_TYPES.CUBE]: {
    name: '正方体',
    description: '所有面都是正方形的六面体',
    category: '多面体',
    defaultParams: { size: 1 }
  },
  [GEOMETRY_TYPES.RECTANGULAR_BOX]: {
    name: '长方体',
    description: '六个面都是矩形的六面体',
    category: '多面体',
    defaultParams: { width: 1.5, height: 1, depth: 1 }
  },
  [GEOMETRY_TYPES.TRIANGULAR_PRISM]: {
    name: '三棱柱',
    description: '底面为三角形的棱柱',
    category: '棱柱',
    defaultParams: { radius: 1, height: 1.5 }
  },
  [GEOMETRY_TYPES.TETRAHEDRON]: {
    name: '正四面体',
    description: '四个面都是等边三角形',
    category: '多面体',
    defaultParams: { radius: 1 }
  },
  [GEOMETRY_TYPES.SQUARE_PYRAMID]: {
    name: '四棱锥',
    description: '底面为四边形的棱锥',
    category: '棱锥',
    defaultParams: { baseSize: 1.5, height: 1.5 }
  },
  [GEOMETRY_TYPES.HEXAGONAL_PRISM]: {
    name: '六棱柱',
    description: '底面为六边形的棱柱',
    category: '棱柱',
    defaultParams: { radius: 1, height: 1.5 }
  },
  [GEOMETRY_TYPES.TRIANGULAR_PYRAMID]: {
    name: '三棱锥',
    description: '底面为三角形的棱锥',
    category: '棱锥',
    defaultParams: { baseRadius: 1, height: 1.5 }
  },
  [GEOMETRY_TYPES.CYLINDER]: {
    name: '圆柱',
    description: '底面为圆的柱体',
    category: '曲面体',
    defaultParams: { radius: 1, height: 2 }
  },
  [GEOMETRY_TYPES.CONE]: {
    name: '圆锥',
    description: '底面为圆的锥体',
    category: '曲面体',
    defaultParams: { radius: 1, height: 2 }
  },
  [GEOMETRY_TYPES.SPHERE]: {
    name: '球',
    description: '到定点距离等于定长的点的集合',
    category: '曲面体',
    defaultParams: { radius: 1 }
  }
};

// ==================== 颜色配置 ====================

export const COLORS = {
  primary: 0x6750A4,
  primaryLight: 0xD0BCFF,
  primaryDark: 0x381E72,
  secondary: 0x625B71,
  tertiary: 0x7D5260,
  error: 0xB3261E,
  surface: 0xFFFBFE,
  background: 0xF5F5F5,
  outline: 0x79747E,
  wireframe: 0x49454F,
  highlight: 0xFFD8E4,
  selected: 0xEADDFF
};

// ==================== 尺寸配置 ====================

export const SIZES = {
  scene: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 100,
    position: { x: 3, y: 2, z: 3 }
  },
  grid: {
    size: 10,
    divisions: 10
  }
};

// ==================== 动画配置 ====================

export const ANIMATION = {
  duration: {
    short: 150,
    medium: 300,
    long: 500
  },
  easing: {
    standard: 'power2.out',
    emphasized: 'power3.out',
    decelerate: 'power1.out',
    accelerate: 'power3.in'
  }
};

// ==================== 本地存储键名 ====================

export const STORAGE_KEYS = {
  practiceRecords: 'solid-geometry-practice-records',
  settings: 'solid-geometry-settings',
  theme: 'solid-geometry-theme'
};

// ==================== 练习模式配置 ====================

export const PRACTICE_CONFIG = {
  questionTypes: [
    { id: 'vertexCount', name: '顶点计数', description: '识别几何体的顶点数量' },
    { id: 'edgeCount', name: '棱计数', description: '识别几何体的棱数量' },
    { id: 'faceCount', name: '面计数', description: '识别几何体的面数量' },
    { id: 'crossSection', name: '截面识别', description: '识别几何体的截面形状' }
  ],
  difficulties: [
    { id: 'easy', name: '简单', color: 'success' },
    { id: 'medium', name: '中等', color: 'warning' },
    { id: 'hard', name: '困难', color: 'error' }
  ]
};
