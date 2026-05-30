// ========================
// 常量定义
// ========================

export const CONSTANTS = {
    // 截面相关
    SNAP_THRESHOLD: 0.15,           // 顶点吸附阈值
    SECTION_POINT_SIZE: 0.12,       // 截面点大小
    SECTION_PREVIEW_SIZE: 0.08,     // 预览点大小

    // 动画相关
    UNFOLD_DURATION: 1.5,           // 展开动画时长(秒)
    CAMERA_ANIMATION_DURATION: 0.5, // 相机动画时长(秒)

    // 渲染相关
    DEFAULT_CAMERA_DISTANCE: 10,    // 默认相机距离
    MIN_CAMERA_DISTANCE: 3,         // 最小相机距离
    MAX_CAMERA_DISTANCE: 50,        // 最大相机距离

    // 几何体相关
    DEFAULT_SIZE: 2,                // 默认尺寸
    MIN_SIZE: 0.5,                  // 最小尺寸
    MAX_SIZE: 3,                    // 最大大小
    SIZE_STEP: 0.1,                 // 尺寸步长

    // 颜色
    COLORS: {
        background: 0xf0f0f0,
        ambientLight: 0xffffff,
        directionalLight: 0xffffff,
        grid: 0x888888,
        axes: {
            x: 0xff0000,
            y: 0x00ff00,
            z: 0x0000ff
        },
        ground: 0xcccccc,
        section: 0xb19cd9,
        sectionGlow: 0xd4b8e8,
        vertex: 0x4CAF50,
        vertexHover: 0x66BB6A,
        vertexSelected: 0xFF9800
    },

    // 光照
    LIGHTS: {
        ambient: {
            color: 0xffffff,
            intensity: 0.6
        },
        directional: {
            color: 0xffffff,
            intensity: 0.8,
            position: { x: 5, y: 10, z: 7.5 }
        }
    },

    // 视图预设
    VIEWS: {
        default: { x: 5, y: 5, z: 5 },
        front: { x: 0, y: 0, z: 8 },
        back: { x: 0, y: 0, z: -8 },
        left: { x: -8, y: 0, z: 0 },
        right: { x: 8, y: 0, z: 0 },
        top: { x: 0, y: 8, z: 0.01 },
        bottom: { x: 0, y: -8, z: 0.01 }
    },

    // UI
    MAX_TOASTS: 3,
    TOAST_DURATION: 3000,

    // 版本
    VERSION: '0.2.0',
    APP_NAME: '立体几何练习平台'
};

// 面名称映射
export const FACE_NAMES = {
    front: '前面',
    back: '后面',
    left: '左面',
    right: '右面',
    top: '顶面',
    bottom: '底面',
    side1: '侧面1',
    side2: '侧面2',
    side3: '侧面3',
    side4: '侧面4',
    side5: '侧面5',
    side6: '侧面6',
    triangle1: '三角面1',
    triangle2: '三角面2',
    square: '正方形面',
    pentagon: '五边形面',
    hexagon: '六边形面',
    octagon: '八边形面'
};

// 几何体名称映射
export const GEOMETRY_NAMES = {
    cube: '正方体',
    triangularPrism: '三棱柱',
    squarePyramid: '四棱锥',
    tetrahedron: '正四面体',
    rectangularBox: '长方体',
    hexagonalPrism: '六棱柱',
    triangularPyramid: '三棱锥',
    pentagonalPyramid: '五棱锥',
    irregularBox: '不规则六面体',
    truncatedPyramid: '棱台',
    octahedron: '正八面体'
};
