/**
 * 几何体详细配置
 * 包含顶点、边、面的定义
 */

export const GEOMETRY_NAMES = {
  cube: '正方体',
  rectangularBox: '长方体',
  triangularPrism: '三棱柱',
  tetrahedron: '正四面体',
  squarePyramid: '四棱锥',
  hexagonalPrism: '六棱柱',
  triangularPyramid: '三棱锥',
  cylinder: '圆柱',
  cone: '圆锥',
  sphere: '球'
};

export const GEOMETRY_CONFIGS = {
  cube: {
    name: '正方体',
    description: '所有面都是正方形的六面体',
    category: '多面体',
    type: 'polyhedron',
    defaultParams: { size: 1 },
    vertices: { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] },
    edges: [['A','B'],['B','C'],['C','D'],['D','A'],['E','F'],['F','G'],['G','H'],['H','E'],['A','E'],['B','F'],['C','G'],['D','H']],
    faces: { bottom: ['A','B','C','D'], top: ['E','F','G','H'], front: ['A','B','F','E'], back: ['D','C','G','H'], left: ['A','D','H','E'], right: ['B','C','G','F'] },
    volume: (params) => Math.pow(params.size, 3),
    surfaceArea: (params) => 6 * Math.pow(params.size, 2)
  },
  rectangularBox: {
    name: '长方体',
    description: '六个面都是矩形的六面体',
    category: '多面体',
    type: 'polyhedron',
    defaultParams: { width: 1.5, height: 1, depth: 1 },
    vertices: { A: [0, 0, 0], B: [1.5, 0, 0], C: [1.5, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1.5, 0, 1], G: [1.5, 1, 1], H: [0, 1, 1] },
    edges: [['A','B'],['B','C'],['C','D'],['D','A'],['E','F'],['F','G'],['G','H'],['H','E'],['A','E'],['B','F'],['C','G'],['D','H']],
    faces: { bottom: ['A','B','C','D'], top: ['E','F','G','H'], front: ['A','B','F','E'], back: ['D','C','G','H'], left: ['A','D','H','E'], right: ['B','C','G','F'] },
    volume: (params) => params.width * params.height * params.depth,
    surfaceArea: (params) => 2 * (params.width * params.height + params.height * params.depth + params.width * params.depth)
  },
  triangularPrism: {
    name: '三棱柱',
    description: '底面为三角形的棱柱',
    category: '棱柱',
    type: 'polyhedron',
    defaultParams: { radius: 1, height: 1.5 },
    vertices: { A: [0, 0, 0], B: [1, 0, 0], C: [0.5, 0.866, 0], D: [0, 0, 1.5], E: [1, 0, 1.5], F: [0.5, 0.866, 1.5] },
    edges: [['A','B'],['B','C'],['C','A'],['D','E'],['E','F'],['F','D'],['A','D'],['B','E'],['C','F']],
    faces: { bottom: ['A','B','C'], top: ['D','E','F'], front: ['A','B','E','D'], back: ['B','C','F','E'], left: ['C','A','D','F'] },
    volume: (params) => (Math.sqrt(3) / 4) * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * (Math.sqrt(3) / 4) * Math.pow(params.radius, 2) + 3 * params.radius * params.height
  },
  tetrahedron: {
    name: '正四面体',
    description: '四个面都是等边三角形',
    category: '多面体',
    type: 'polyhedron',
    defaultParams: { radius: 1 },
    vertices: { A: [0, 0, 0], B: [1, 0, 0], C: [0.5, 0.866, 0], D: [0.5, 0.289, 0.816] },
    edges: [['A','B'],['B','C'],['C','A'],['A','D'],['B','D'],['C','D']],
    faces: { bottom: ['A','B','C'], front: ['A','B','D'], back: ['B','C','D'], left: ['C','A','D'] },
    volume: (params) => (Math.sqrt(2) / 12) * Math.pow(params.radius * 2, 3),
    surfaceArea: (params) => Math.sqrt(3) * Math.pow(params.radius * 2, 2)
  },
  squarePyramid: {
    name: '四棱锥',
    description: '底面为四边形的棱锥',
    category: '棱锥',
    type: 'polyhedron',
    defaultParams: { baseSize: 1.5, height: 1.5 },
    vertices: { A: [0, 0, 0], B: [1.5, 0, 0], C: [1.5, 0, 1.5], D: [0, 0, 1.5], E: [0.75, 1.5, 0.75] },
    edges: [['A','B'],['B','C'],['C','D'],['D','A'],['A','E'],['B','E'],['C','E'],['D','E']],
    faces: { bottom: ['A','B','C','D'], front: ['A','B','E'], back: ['C','D','E'], left: ['A','D','E'], right: ['B','C','E'] },
    volume: (params) => (1 / 3) * Math.pow(params.baseSize, 2) * params.height,
    surfaceArea: (params) => {
      const base = Math.pow(params.baseSize, 2);
      const slant = Math.sqrt(Math.pow(params.height, 2) + Math.pow(params.baseSize / 2, 2));
      return base + 2 * params.baseSize * slant;
    }
  },
  hexagonalPrism: {
    name: '六棱柱',
    description: '底面为六边形的棱柱',
    category: '棱柱',
    type: 'polyhedron',
    defaultParams: { radius: 1, height: 1.5 },
    vertices: {
      A: [1, 0, 0], B: [0.5, 0.866, 0], C: [-0.5, 0.866, 0],
      D: [-1, 0, 0], E: [-0.5, -0.866, 0], F: [0.5, -0.866, 0],
      G: [1, 0, 1.5], H: [0.5, 0.866, 1.5], I: [-0.5, 0.866, 1.5],
      J: [-1, 0, 1.5], K: [-0.5, -0.866, 1.5], L: [0.5, -0.866, 1.5]
    },
    edges: [
      ['A','B'],['B','C'],['C','D'],['D','E'],['E','F'],['F','A'],
      ['G','H'],['H','I'],['I','J'],['J','K'],['K','L'],['L','G'],
      ['A','G'],['B','H'],['C','I'],['D','J'],['E','K'],['F','L']
    ],
    faces: {
      bottom: ['A','B','C','D','E','F'],
      top: ['G','H','I','J','K','L'],
      front: ['A','B','H','G'],
      back: ['D','E','K','J'],
      left: ['B','C','I','H'],
      right: ['E','F','L','K'],
      frontLeft: ['C','D','J','I'],
      frontRight: ['F','A','G','L']
    },
    volume: (params) => (3 * Math.sqrt(3) / 2) * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * (3 * Math.sqrt(3) / 2) * Math.pow(params.radius, 2) + 6 * params.radius * params.height
  },
  triangularPyramid: {
    name: '三棱锥',
    description: '底面为三角形的棱锥',
    category: '棱锥',
    type: 'polyhedron',
    defaultParams: { baseRadius: 1, height: 1.5 },
    vertices: { A: [0, 0, 0], B: [1, 0, 0], C: [0.5, 0.866, 0], D: [0.5, 0.289, 1.5] },
    edges: [['A','B'],['B','C'],['C','A'],['A','D'],['B','D'],['C','D']],
    faces: { bottom: ['A','B','C'], front: ['A','B','D'], back: ['B','C','D'], left: ['C','A','D'] },
    volume: (params) => (1 / 3) * (Math.sqrt(3) / 4) * Math.pow(params.baseRadius, 2) * params.height,
    surfaceArea: (params) => {
      const base = (Math.sqrt(3) / 4) * Math.pow(params.baseRadius, 2);
      const slantHeight = Math.sqrt(Math.pow(params.height, 2) + Math.pow(params.baseRadius / Math.sqrt(3), 2));
      return base + 3 * (params.baseRadius * slantHeight / 2);
    }
  },
  cylinder: {
    name: '圆柱',
    description: '底面为圆的柱体',
    category: '曲面体',
    type: 'curved',
    defaultParams: { radius: 1, height: 2 },
    vertices: {},
    edges: [],
    faces: { bottom: 'circle', top: 'circle', side: 'curved' },
    volume: (params) => Math.PI * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * Math.PI * params.radius * (params.radius + params.height)
  },
  cone: {
    name: '圆锥',
    description: '底面为圆的锥体',
    category: '曲面体',
    type: 'curved',
    defaultParams: { radius: 1, height: 2 },
    vertices: { apex: [0, 2, 0] },
    edges: [],
    faces: { bottom: 'circle', side: 'curved' },
    volume: (params) => (1 / 3) * Math.PI * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => {
      const slant = Math.sqrt(Math.pow(params.radius, 2) + Math.pow(params.height, 2));
      return Math.PI * params.radius * (params.radius + slant);
    }
  },
  sphere: {
    name: '球',
    description: '到定点距离等于定长的点的集合',
    category: '曲面体',
    type: 'curved',
    defaultParams: { radius: 1 },
    vertices: {},
    edges: [],
    faces: { surface: 'curved' },
    volume: (params) => (4 / 3) * Math.PI * Math.pow(params.radius, 3),
    surfaceArea: (params) => 4 * Math.PI * Math.pow(params.radius, 2)
  }
};

export const GEOMETRY_DETAILS = GEOMETRY_CONFIGS;
