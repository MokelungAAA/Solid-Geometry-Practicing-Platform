/**
 * 几何体详细配置
 * 包含顶点、边、面的定义
 */

export const GEOMETRY_DETAILS = {
  cube: {
    vertices: 8,
    edges: 12,
    faces: 6,
    faceTypes: ['正方形', '正方形', '正方形', '正方形', '正方形', '正方形'],
    volume: (params) => Math.pow(params.size, 3),
    surfaceArea: (params) => 6 * Math.pow(params.size, 2)
  },
  rectangularBox: {
    vertices: 8,
    edges: 12,
    faces: 6,
    faceTypes: ['矩形', '矩形', '矩形', '矩形', '矩形', '矩形'],
    volume: (params) => params.width * params.height * params.depth,
    surfaceArea: (params) => 2 * (params.width * params.height + params.height * params.depth + params.width * params.depth)
  },
  triangularPrism: {
    vertices: 6,
    edges: 9,
    faces: 5,
    faceTypes: ['三角形', '三角形', '矩形', '矩形', '矩形'],
    volume: (params) => (Math.sqrt(3) / 4) * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * (Math.sqrt(3) / 4) * Math.pow(params.radius, 2) + 3 * params.radius * params.height
  },
  tetrahedron: {
    vertices: 4,
    edges: 6,
    faces: 4,
    faceTypes: ['等边三角形', '等边三角形', '等边三角形', '等边三角形'],
    volume: (params) => (Math.sqrt(2) / 12) * Math.pow(params.radius * 2, 3),
    surfaceArea: (params) => Math.sqrt(3) * Math.pow(params.radius * 2, 2)
  },
  squarePyramid: {
    vertices: 5,
    edges: 8,
    faces: 5,
    faceTypes: ['正方形', '三角形', '三角形', '三角形', '三角形'],
    volume: (params) => (1 / 3) * Math.pow(params.baseSize, 2) * params.height,
    surfaceArea: (params) => {
      const base = Math.pow(params.baseSize, 2);
      const slant = Math.sqrt(Math.pow(params.height, 2) + Math.pow(params.baseSize / 2, 2));
      return base + 2 * params.baseSize * slant;
    }
  },
  hexagonalPrism: {
    vertices: 12,
    edges: 18,
    faces: 8,
    faceTypes: ['六边形', '六边形', '矩形', '矩形', '矩形', '矩形', '矩形', '矩形'],
    volume: (params) => (3 * Math.sqrt(3) / 2) * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * (3 * Math.sqrt(3) / 2) * Math.pow(params.radius, 2) + 6 * params.radius * params.height
  },
  triangularPyramid: {
    vertices: 4,
    edges: 6,
    faces: 4,
    faceTypes: ['三角形', '三角形', '三角形', '三角形'],
    volume: (params) => (1 / 3) * (Math.sqrt(3) / 4) * Math.pow(params.baseRadius, 2) * params.height,
    surfaceArea: (params) => {
      const base = (Math.sqrt(3) / 4) * Math.pow(params.baseRadius, 2);
      const slantHeight = Math.sqrt(Math.pow(params.height, 2) + Math.pow(params.baseRadius / Math.sqrt(3), 2));
      return base + 3 * (params.baseRadius * slantHeight / 2);
    }
  },
  cylinder: {
    vertices: 0, // 曲面体，顶点数无限
    edges: 2,
    faces: 3,
    faceTypes: ['圆', '圆', '曲面'],
    volume: (params) => Math.PI * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => 2 * Math.PI * params.radius * (params.radius + params.height)
  },
  cone: {
    vertices: 1,
    edges: 1,
    faces: 2,
    faceTypes: ['圆', '曲面'],
    volume: (params) => (1 / 3) * Math.PI * Math.pow(params.radius, 2) * params.height,
    surfaceArea: (params) => {
      const slant = Math.sqrt(Math.pow(params.radius, 2) + Math.pow(params.height, 2));
      return Math.PI * params.radius * (params.radius + slant);
    }
  },
  sphere: {
    vertices: 0, // 曲面体，顶点数无限
    edges: 0,
    faces: 1,
    faceTypes: ['曲面'],
    volume: (params) => (4 / 3) * Math.PI * Math.pow(params.radius, 3),
    surfaceArea: (params) => 4 * Math.PI * Math.pow(params.radius, 2)
  }
};
