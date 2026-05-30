// ========================
// 几何体配置数据
// ========================

export const GEOMETRY_CONFIGS = {
    cube: {
        size: 2,
        vertices: {
            A: [-1, -1, 1],   // 前左下
            B: [1, -1, 1],    // 前右下
            C: [1, 1, 1],     // 前右上
            D: [-1, 1, 1],    // 前左上
            E: [-1, -1, -1],  // 后左下
            F: [1, -1, -1],   // 后右下
            G: [1, 1, -1],    // 后右上
            H: [-1, 1, -1]    // 后左上
        },
        faces: {
            front: { vertices: ['A', 'B', 'C', 'D'], name: '前面' },
            back: { vertices: ['E', 'F', 'G', 'H'], name: '后面' },
            left: { vertices: ['A', 'D', 'H', 'E'], name: '左面' },
            right: { vertices: ['B', 'C', 'G', 'F'], name: '右面' },
            bottom: { vertices: ['A', 'B', 'F', 'E'], name: '下面' },
            top: { vertices: ['D', 'C', 'G', 'H'], name: '上面' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                front: { hinge: ['A', 'B'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['E', 'F'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'D'], axis: 'z', angle: -Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'z', angle: Math.PI / 2, parent: null },
                top: { hinge: ['C', 'G'], axis: 'z', angle: Math.PI / 2, parent: 'right' }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
            ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'],
            ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']
        ]
    },

    triangularPrism: {
        size: 2,
        vertices: {
            A: [-1, -1, 1],   // 底面左
            B: [1, -1, 1],    // 底面右
            C: [0, 1, 1],     // 底面前
            D: [-1, -1, -1],  // 顶面左
            E: [1, -1, -1],   // 顶面右
            F: [0, 1, -1]     // 顶面后
        },
        faces: {
            bottom: { vertices: ['A', 'B', 'C'], name: '下底面' },
            top: { vertices: ['D', 'E', 'F'], name: '上底面' },
            front: { vertices: ['A', 'C', 'F', 'D'], name: '前面' },
            back: { vertices: ['B', 'E', 'F', 'C'], name: '后面' },
            left: { vertices: ['A', 'D', 'E', 'B'], name: '侧面' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                top: { hinge: ['D', 'E'], axis: 'z', angle: Math.PI / 2, parent: null },
                front: { hinge: ['A', 'C'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['B', 'C'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'B'], axis: 'z', angle: -Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'A'],
            ['D', 'E'], ['E', 'F'], ['F', 'D'],
            ['A', 'D'], ['B', 'E'], ['C', 'F']
        ]
    },

    squarePyramid: {
        size: 2,
        vertices: {
            A: [-1, 0, -1],   // 底面左后
            B: [1, 0, -1],    // 底面右后
            C: [1, 0, 1],     // 底面右前
            D: [-1, 0, 1],    // 底面左前
            O: [0, 2, 0]      // 顶点
        },
        faces: {
            base: { vertices: ['A', 'B', 'C', 'D'], name: '底面' },
            front: { vertices: ['D', 'O', 'C'], name: '前面' },
            back: { vertices: ['A', 'B', 'O'], name: '后面' },
            left: { vertices: ['A', 'O', 'D'], name: '左面' },
            right: { vertices: ['B', 'C', 'O'], name: '右面' }
        },
        unfoldConfig: {
            baseFace: 'base',
            pivots: {
                front: { hinge: ['D', 'C'], axis: 'z', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['A', 'B'], axis: 'z', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'D'], axis: 'x', angle: -Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'x', angle: Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
            ['A', 'O'], ['B', 'O'], ['C', 'O'], ['D', 'O']
        ]
    },

    tetrahedron: {
        size: 2,
        vertices: {
            A: [-1, -0.816, 0.577],
            B: [1, -0.816, 0.577],
            C: [0, -0.816, -1.155],
            D: [0, 1.633, 0]
        },
        faces: {
            base: { vertices: ['A', 'B', 'C'], name: '底面' },
            front: { vertices: ['A', 'D', 'C'], name: '前面' },
            back: { vertices: ['A', 'B', 'D'], name: '后面' },
            right: { vertices: ['B', 'C', 'D'], name: '右面' }
        },
        unfoldConfig: {
            baseFace: 'base',
            pivots: {
                front: { hinge: ['A', 'C'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['A', 'B'], axis: 'z', angle: Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'x', angle: Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'A'],
            ['A', 'D'], ['B', 'D'], ['C', 'D']
        ]
    },

    rectangularBox: {
        size: 2,
        vertices: {
            A: [-1, -0.75, 0.5],   // 前左下
            B: [1, -0.75, 0.5],     // 前右下
            C: [1, 0.75, 0.5],     // 前右上
            D: [-1, 0.75, 0.5],    // 前左上
            E: [-1, -0.75, -0.5],  // 后左下
            F: [1, -0.75, -0.5],   // 后右下
            G: [1, 0.75, -0.5],    // 后右上
            H: [-1, 0.75, -0.5]    // 后左上
        },
        faces: {
            front: { vertices: ['A', 'B', 'C', 'D'], name: '前面' },
            back: { vertices: ['E', 'F', 'G', 'H'], name: '后面' },
            left: { vertices: ['A', 'D', 'H', 'E'], name: '左面' },
            right: { vertices: ['B', 'C', 'G', 'F'], name: '右面' },
            bottom: { vertices: ['A', 'B', 'F', 'E'], name: '下面' },
            top: { vertices: ['D', 'C', 'G', 'H'], name: '上面' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                front: { hinge: ['A', 'B'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['E', 'F'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'D'], axis: 'z', angle: -Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'z', angle: Math.PI / 2, parent: null },
                top: { hinge: ['C', 'G'], axis: 'z', angle: Math.PI / 2, parent: 'right' }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
            ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'],
            ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']
        ]
    },

    hexagonalPrism: {
        size: 2,
        vertices: {
            A1: [1, 1, 0.866],
            A2: [0, 1, 1.732],
            A3: [-1, 1, 0.866],
            A4: [-1, 1, -0.866],
            A5: [0, 1, -1.732],
            A6: [1, 1, -0.866],
            B1: [1, -1, 0.866],
            B2: [0, -1, 1.732],
            B3: [-1, -1, 0.866],
            B4: [-1, -1, -0.866],
            B5: [0, -1, -1.732],
            B6: [1, -1, -0.866]
        },
        faces: {
            top: { vertices: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'], name: '上底面' },
            bottom: { vertices: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'], name: '下底面' },
            front1: { vertices: ['A1', 'A2', 'B2', 'B1'], name: '前面1' },
            front2: { vertices: ['A2', 'A3', 'B3', 'B2'], name: '前面2' },
            side1: { vertices: ['A3', 'A4', 'B4', 'B3'], name: '侧面1' },
            side2: { vertices: ['A4', 'A5', 'B5', 'B4'], name: '侧面2' },
            back1: { vertices: ['A5', 'A6', 'B6', 'B5'], name: '后面1' },
            back2: { vertices: ['A6', 'A1', 'B1', 'B6'], name: '后面2' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                top: { hinge: ['B1', 'B2'], axis: 'y', angle: -Math.PI, parent: null },
                front1: { hinge: ['B1', 'B2'], axis: 'x', angle: -Math.PI / 2, parent: null },
                front2: { hinge: ['B2', 'B3'], axis: 'x', angle: -Math.PI / 2, parent: null },
                side1: { hinge: ['B3', 'B4'], axis: 'x', angle: -Math.PI / 2, parent: null },
                side2: { hinge: ['B4', 'B5'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back1: { hinge: ['B5', 'B6'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back2: { hinge: ['B6', 'B1'], axis: 'x', angle: -Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A1', 'A2'], ['A2', 'A3'], ['A3', 'A4'], ['A4', 'A5'], ['A5', 'A6'], ['A6', 'A1'],
            ['B1', 'B2'], ['B2', 'B3'], ['B3', 'B4'], ['B4', 'B5'], ['B5', 'B6'], ['B6', 'B1'],
            ['A1', 'B1'], ['A2', 'B2'], ['A3', 'B3'], ['A4', 'B4'], ['A5', 'B5'], ['A6', 'B6']
        ]
    },

    triangularPyramid: {
        size: 2,
        vertices: {
            A: [-1.2, -1, -0.7],
            B: [1.2, -1, -0.7],
            C: [0, -1, 1.2],
            D: [0.3, 0.8, 0.2]
        },
        faces: {
            base: { vertices: ['A', 'B', 'C'], name: '底面' },
            front: { vertices: ['A', 'D', 'C'], name: '前面' },
            back: { vertices: ['B', 'D', 'C'], name: '右后面' },
            left: { vertices: ['A', 'D', 'B'], name: '左后面' }
        },
        unfoldConfig: {
            baseFace: 'base',
            pivots: {
                front: { hinge: ['A', 'C'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['B', 'C'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'B'], axis: 'z', angle: Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'A'],
            ['A', 'D'], ['B', 'D'], ['C', 'D']
        ]
    },

    pentagonalPyramid: {
        size: 2,
        vertices: {
            A: [0, 0, 1],
            B: [0.951, 0, 0.309],
            C: [0.588, 0, -0.809],
            D: [-0.588, 0, -0.809],
            E: [-0.951, 0, 0.309],
            O: [0, 1.5, 0]
        },
        faces: {
            base: { vertices: ['A', 'B', 'C', 'D', 'E'], name: '底面' },
            front: { vertices: ['A', 'O', 'B'], name: '前面' },
            frontRight: { vertices: ['B', 'O', 'C'], name: '右前面' },
            backRight: { vertices: ['C', 'O', 'D'], name: '右后面' },
            backLeft: { vertices: ['D', 'O', 'E'], name: '左后面' },
            frontLeft: { vertices: ['E', 'O', 'A'], name: '左前面' }
        },
        unfoldConfig: {
            baseFace: 'base',
            pivots: {
                front: { hinge: ['A', 'B'], axis: 'z', angle: -Math.PI / 2, parent: null },
                frontRight: { hinge: ['B', 'C'], axis: 'z', angle: -Math.PI / 2, parent: null },
                backRight: { hinge: ['C', 'D'], axis: 'z', angle: -Math.PI / 2, parent: null },
                backLeft: { hinge: ['D', 'E'], axis: 'z', angle: -Math.PI / 2, parent: null },
                frontLeft: { hinge: ['E', 'A'], axis: 'z', angle: -Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'],
            ['A', 'O'], ['B', 'O'], ['C', 'O'], ['D', 'O'], ['E', 'O']
        ]
    },

    irregularBox: {
        size: 2,
        vertices: {
            A: [-1.25, -0.9, 0.6],
            B: [1.25, -0.9, 0.6],
            C: [1.25, 0.9, 0.6],
            D: [-1.25, 0.9, 0.6],
            E: [-1.25, -0.9, -0.6],
            F: [1.25, -0.9, -0.6],
            G: [1.25, 0.9, -0.6],
            H: [-1.25, 0.9, -0.6]
        },
        faces: {
            front: { vertices: ['A', 'B', 'C', 'D'], name: '前面' },
            back: { vertices: ['E', 'F', 'G', 'H'], name: '后面' },
            left: { vertices: ['A', 'D', 'H', 'E'], name: '左面' },
            right: { vertices: ['B', 'C', 'G', 'F'], name: '右面' },
            bottom: { vertices: ['A', 'B', 'F', 'E'], name: '下面' },
            top: { vertices: ['D', 'C', 'G', 'H'], name: '上面' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                front: { hinge: ['A', 'B'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['E', 'F'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'D'], axis: 'z', angle: -Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'z', angle: Math.PI / 2, parent: null },
                top: { hinge: ['C', 'G'], axis: 'z', angle: Math.PI / 2, parent: 'right' }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
            ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'],
            ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']
        ]
    },

    truncatedPyramid: {
        size: 2,
        vertices: {
            A: [-1, 0, 1],
            B: [1, 0, 1],
            C: [1, 0, -1],
            D: [-1, 0, -1],
            E: [-0.4, 1.5, 0.4],
            F: [0.4, 1.5, 0.4],
            G: [0.4, 1.5, -0.4],
            H: [-0.4, 1.5, -0.4]
        },
        faces: {
            bottom: { vertices: ['A', 'B', 'C', 'D'], name: '下底面' },
            top: { vertices: ['E', 'F', 'G', 'H'], name: '上底面' },
            front: { vertices: ['A', 'B', 'F', 'E'], name: '前面' },
            back: { vertices: ['D', 'C', 'G', 'H'], name: '后面' },
            left: { vertices: ['A', 'D', 'H', 'E'], name: '左面' },
            right: { vertices: ['B', 'C', 'G', 'F'], name: '右面' }
        },
        unfoldConfig: {
            baseFace: 'bottom',
            pivots: {
                front: { hinge: ['A', 'B'], axis: 'x', angle: -Math.PI / 2, parent: null },
                back: { hinge: ['D', 'C'], axis: 'x', angle: Math.PI / 2, parent: null },
                left: { hinge: ['A', 'D'], axis: 'z', angle: -Math.PI / 2, parent: null },
                right: { hinge: ['B', 'C'], axis: 'z', angle: Math.PI / 2, parent: null },
                top: { hinge: ['F', 'G'], axis: 'z', angle: Math.PI / 2, parent: 'right' }
            }
        },
        edges: [
            ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
            ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'],
            ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']
        ]
    },

    octahedron: {
        size: 2,
        vertices: {
            A: [0, 0, 1.2],
            B: [0, 0, -1.2],
            C: [1.2, 0, 0],
            D: [-1.2, 0, 0],
            E: [0, 1.2, 0],
            F: [0, -1.2, 0]
        },
        faces: {
            frontUpper: { vertices: ['A', 'E', 'D'], name: '前上' },
            frontLower: { vertices: ['A', 'F', 'D'], name: '前下' },
            rightUpper: { vertices: ['C', 'E', 'A'], name: '右上' },
            rightLower: { vertices: ['C', 'F', 'A'], name: '右下' },
            backUpper: { vertices: ['B', 'E', 'C'], name: '后上' },
            backLower: { vertices: ['B', 'F', 'C'], name: '后下' },
            leftUpper: { vertices: ['D', 'E', 'B'], name: '左上' },
            leftLower: { vertices: ['D', 'F', 'B'], name: '左下' }
        },
        unfoldConfig: {
            baseFace: 'frontLower',
            pivots: {
                frontUpper: { hinge: ['A', 'D'], axis: 'x', angle: -Math.PI / 2, parent: null },
                rightUpper: { hinge: ['A', 'C'], axis: 'z', angle: -Math.PI / 2, parent: null },
                rightLower: { hinge: ['C', 'F'], axis: 'z', angle: -Math.PI / 2, parent: null },
                backUpper: { hinge: ['B', 'C'], axis: 'x', angle: Math.PI / 2, parent: null },
                backLower: { hinge: ['B', 'F'], axis: 'x', angle: Math.PI / 2, parent: null },
                leftUpper: { hinge: ['D', 'B'], axis: 'z', angle: Math.PI / 2, parent: null },
                leftLower: { hinge: ['D', 'F'], axis: 'z', angle: Math.PI / 2, parent: null }
            }
        },
        edges: [
            ['A', 'C'], ['C', 'B'], ['B', 'D'], ['D', 'A'],
            ['A', 'E'], ['C', 'E'], ['B', 'E'], ['D', 'E'],
            ['A', 'F'], ['C', 'F'], ['B', 'F'], ['D', 'F']
        ]
    }
};

// ========================
// 几何体类型名称映射
// ========================
export const GEOMETRY_NAMES = {
    cube: '正方体',
    triangularPrism: '三棱柱',
    squarePyramid: '四棱锥',
    tetrahedron: '正四面体',
    rectangularBox: '长方体',
    hexagonalPrism: '六棱柱',
    triangularPyramid: '三棱锥',
    pentagonalPyramid: '五棱锥',
    irregularBox: '不规则长方体',
    truncatedPyramid: '四棱台',
    octahedron: '正八面体'
};
