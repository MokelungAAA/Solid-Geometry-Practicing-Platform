/**
 * QuestionBank — 题库生成器（完整版）
 * 包含：知识点分类、出题模板库、几何分析函数、静态题库、动态出题
 */

import { GEOMETRY_CONFIGS } from '../geometry/configs.js';

// ========================
// 知识点分类定义
// ========================
export const KNOWLEDGE_POINTS = {
  line_parallel: { name: '线线平行', color: '#89cff0' },
  line_intersect: { name: '线线相交', color: '#e68a8a' },
  line_skew: { name: '异面直线', color: '#f0e68a' },
  line_perpendicular: { name: '线线垂直', color: '#b19cd9' },
  plane_in_line: { name: '线在面内', color: '#8ae6a0' },
  line_plane_parallel: { name: '线面平行', color: '#ff9966' },
  line_plane_perpendicular: { name: '线面垂直', color: '#66ccff' },
  plane_parallel: { name: '面面平行', color: '#cc99ff' },
  plane_perpendicular: { name: '面面垂直', color: '#ffcc66' },
  angle_line_line: { name: '线线角', color: '#ff9999' },
  angle_line_plane: { name: '线面角', color: '#99ff99' },
  angle_dihedral: { name: '二面角', color: '#9999ff' },
  distance_point_line: { name: '点线距', color: '#ffcc99' },
  distance_point_plane: { name: '点面距', color: '#99ccff' },
  distance_skew_lines: { name: '异面直线距', color: '#ccffcc' },
  count_vertex: { name: '顶点数', color: '#ffcccc' },
  count_edge: { name: '棱数', color: '#ccffcc' },
  count_face: { name: '面数', color: '#ccccff' },
  count_diagonal: { name: '对角线数', color: '#ffccff' },
  section: { name: '截面问题', color: '#ccffff' },
  unfold: { name: '展开图', color: '#ffffcc' },
  volume: { name: '体积', color: '#aaddff' },
  surface_area: { name: '表面积', color: '#ffaadd' },
  proof_line_plane_parallel: { name: '线面平行证明', color: '#b19cd9' },
  proof_line_plane_perp: { name: '线面垂直证明', color: '#ff99cc' },
  proof_plane_parallel: { name: '面面平行证明', color: '#99ccff' },
  proof_plane_perp: { name: '面面垂直证明', color: '#ffcc99' },
  proof_skew: { name: '异面直线证明', color: '#ccffcc' }
};

// ========================
// 辅助函数
// ========================
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function shuffleOptions(options) {
  const correctAnswer = options[0];
  const shuffled = shuffleArray(options);
  shuffled.correctIndex = shuffled.indexOf(correctAnswer);
  return shuffled;
}

/**
 * 为符号表达式生成错误选项
 * 处理 '√2/12' 这类无法 parseFloat 的表达式
 */
function generateWrongExprOptions(expr) {
  const num = parseFloat(expr);
  if (!isNaN(num)) {
    // 纯数字表达式，用乘除生成干扰项
    return [
      String(Math.round(num * 2 * 100) / 100),
      String(Math.round(num / 2 * 100) / 100),
      String(Math.round(num * 3 * 100) / 100)
    ];
  }
  // 符号表达式：替换根号部分或分母
  const rootMatch = expr.match(/√(\d+)/);
  if (rootMatch) {
    const origRoot = parseInt(rootMatch[1]);
    return [
      expr.replace(`√${origRoot}`, `√${origRoot + 1}`),
      expr.replace(`√${origRoot}`, `√${origRoot * 2}`),
      expr.replace(`√${origRoot}`, `√${origRoot - 1 > 0 ? origRoot - 1 : 3}`)
    ];
  }
  // 兜底：加文字变体
  return [expr + '²', '2' + expr, expr + '/2'];
}

function getGeometryName(type) {
  const names = {
    cube: '正方体', rectangularBox: '长方体', triangularPrism: '三棱柱',
    hexagonalPrism: '正六棱柱', squarePyramid: '四棱锥', tetrahedron: '正四面体',
    triangularPyramid: '斜三棱锥'
  };
  return names[type] || '几何体';
}

// ========================
// 几何分析函数
// ========================
function calculateDistance(p1, p2) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], dz = p2[2] - p1[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isEdgeParallel(e1, e2, config) {
  const v1 = config.vertices[e1[0]], v2 = config.vertices[e1[1]];
  const v3 = config.vertices[e2[0]], v4 = config.vertices[e2[1]];
  if (!v1 || !v2 || !v3 || !v4) return false;
  const d1 = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
  const d2 = [v4[0]-v3[0], v4[1]-v3[1], v4[2]-v3[2]];
  const epsilon = 0.001;
  const cross = [
    d1[1]*d2[2] - d1[2]*d2[1],
    d1[2]*d2[0] - d1[0]*d2[2],
    d1[0]*d2[1] - d1[1]*d2[0]
  ];
  return Math.abs(cross[0]) < epsilon && Math.abs(cross[1]) < epsilon && Math.abs(cross[2]) < epsilon;
}

export function findSkewLinePairs(config) {
  const pairs = [];
  const edges = config.edges || [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i], e2 = edges[j];
      const commonVertex = e1.some(v => e2.includes(v));
      if (!commonVertex && !isEdgeParallel(e1, e2, config)) {
        pairs.push([e1, e2]);
      }
    }
  }
  return pairs;
}

export function findParallelEdgeGroups(config) {
  const groups = [];
  const visited = new Set();
  const edges = config.edges || [];
  for (const edge of edges) {
    const key = edge.join('-');
    if (visited.has(key)) continue;
    const group = [edge];
    visited.add(key);
    for (const otherEdge of edges) {
      const otherKey = otherEdge.join('-');
      if (visited.has(otherKey)) continue;
      if (isEdgeParallel(edge, otherEdge, config)) {
        group.push(otherEdge);
        visited.add(otherKey);
      }
    }
    if (group.length > 1) groups.push(group);
  }
  return groups;
}

export function findLinePlaneParallelPairs(config, type) {
  const pairs = [];
  if (type === 'cube') {
    pairs.push({ edge: ['A','B'], plane: '上下面' });
    pairs.push({ edge: ['A','D'], plane: '右左面' });
    pairs.push({ edge: ['A','E'], plane: '前后面' });
  }
  return pairs;
}

export function findLinePlanePerpendicularPairs(config, type) {
  const pairs = [];
  if (type === 'cube') {
    pairs.push({ edge: ['A','B'], plane: '前左面' });
    pairs.push({ edge: ['A','D'], plane: '前下面' });
  }
  return pairs;
}

export function findParallelPlanes(config) {
  const faceCount = Object.keys(config.faces || {}).length;
  if (faceCount >= 6) return [['前面','后面'],['左面','右面'],['上面','下面']];
  if (faceCount === 5) return [['上底面','下底面']];
  return [];
}

export function findPerpendicularPlanes(config) {
  const faceCount = Object.keys(config.faces || {}).length;
  if (faceCount >= 6) return [['前面','左面'],['前面','右面'],['前面','下面']];
  return [];
}

export function calculateLineLineAngle(config, type) {
  if (type === 'cube') return { edge1: ['A','B'], edge2: ['A','D'], angle: '45°', formula: '√2/2' };
  return { edge1: ['A','B'], edge2: ['A','C'], angle: '60°', formula: '1/2' };
}

export function calculateLinePlaneAngle(config, type) {
  if (type === 'squarePyramid') return '60°';
  if (type === 'tetrahedron') return '54.74°';
  if (type === 'triangularPrism') return '60°';
  return '90°';
}

export function calculateDihedralAngle(config, type) {
  if (type === 'cube') return '90°';
  if (type === 'squarePyramid') return '60°';
  return '60°';
}

export function calculatePointToLineDistance(vertex, edge, config, type) {
  if (vertex === edge[0] || vertex === edge[1]) return '0';
  if (type === 'cube') return '√2';
  return '1';
}

export function calculatePointToPlaneDistance(vertex, faceInfo, config, type) {
  if (faceInfo.vertices && faceInfo.vertices.includes(vertex)) return '0';
  if (type === 'cube') return '1';
  if (type === 'squarePyramid') return '2/√5';
  return '√3/3';
}

export function countDiagonals(config, type) {
  if (type === 'cube') return 4;
  if (type === 'tetrahedron') return 0;
  if (type === 'squarePyramid') return 2;
  if (type === 'triangularPrism') return 0;
  return 0;
}

export function calculateVolumeExpr(config, type) {
  if (type === 'cube') return '1';
  if (type === 'tetrahedron') return '√2/12';
  if (type === 'squarePyramid') return '1/3';
  if (type === 'triangularPrism') return '√3/4';
  return '1';
}

export function calculateSurfaceAreaExpr(config, type) {
  if (type === 'cube') return '6';
  if (type === 'tetrahedron') return '√3';
  if (type === 'squarePyramid') return '1+2√2';
  if (type === 'triangularPrism') return '√3/2+3';
  return '6';
}

export function calculateHeight(config, type) {
  if (type === 'cube') return '1';
  if (type === 'tetrahedron') return '√6/3';
  if (type === 'squarePyramid') return '1';
  if (type === 'triangularPrism') return '1.5';
  return '1';
}

export function calculateDiagonalLength(config, type) {
  if (type === 'cube') return '√3';
  if (type === 'rectangularBox') return '√(a²+b²+c²)';
  return '√3';
}

export function getRandomDiagonal(config, type) {
  if (type === 'cube') {
    const diags = [
      { name: 'AG', vertices: ['A','G'] }, { name: 'BH', vertices: ['B','H'] },
      { name: 'CE', vertices: ['C','E'] }, { name: 'DF', vertices: ['D','F'] }
    ];
    return diags[Math.floor(Math.random() * diags.length)];
  }
  if (type === 'squarePyramid') return { name: 'AC', vertices: ['A','C'] };
  return null;
}

export function generateSectionQuestion(config, type) {
  if (type === 'cube') {
    return {
      options: ['三角形','四边形','五边形','六边形'],
      correctIndex: 1,
      explanation: '正方体的截面可以是三角形、四边形、五边形或六边形',
      correct: '四边形'
    };
  }
  return {
    options: ['三角形','四边形','五边形','六边形'],
    correctIndex: 0,
    explanation: '该几何体的截面可能是三角形',
    correct: '三角形'
  };
}

function getRandomFace(config) {
  const faces = Object.keys(config.faces || {});
  const name = faces[Math.floor(Math.random() * faces.length)];
  return { name, ...(config.faces[name] || {}) };
}

function getEdgesOnSameFace(edge, config) {
  const result = [];
  for (const face of Object.values(config.faces || {})) {
    if (Array.isArray(face) && face.includes(edge[0]) && face.includes(edge[1])) {
      result.push(edge);
    }
  }
  return result;
}

// ========================
// 出题模板库
// ========================
const QUESTION_TEMPLATES = {
  choice: [
    // ========== 位置关系 ==========
    {
      id: 'choice_line_parallel',
      tags: ['line_parallel'],
      difficulty: 'easy',
      generate: (config, type) => {
        const groups = findParallelEdgeGroups(config);
        if (groups.length === 0) return null;
        const group = groups[Math.floor(Math.random() * groups.length)];
        const edge = group[Math.floor(Math.random() * group.length)];
        const others = group.filter(e => e !== edge);
        if (others.length === 0) return null;
        const answer = others.length;
        return {
          question: `${getGeometryName(type)}中，与棱${edge[0]}${edge[1]}平行的棱有（  ）条`,
          options: shuffleOptions([String(answer), String(answer+1), String(answer-1), String(answer+2)]),
          explanation: `与${edge[0]}${edge[1]}平行的棱有${others.map(e=>e[0]+e[1]).join('、')}，共${answer}条`,
          correct: String(answer)
        };
      }
    },
    {
      id: 'choice_line_skew',
      tags: ['line_skew'],
      difficulty: 'medium',
      generate: (config, type) => {
        const pairs = findSkewLinePairs(config);
        if (pairs.length === 0) return null;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const shuffled = shuffleOptions(['平行','相交','异面','垂直']);
        return {
          question: `${getGeometryName(type)}中，直线${pair[0][0]}${pair[0][1]}与直线${pair[1][0]}${pair[1][1]}的位置关系是（  ）`,
          options: shuffled,
          correctIndex: shuffled.correctIndex,
          explanation: `${pair[0][0]}${pair[0][1]}与${pair[1][0]}${pair[1][1]}既不平行也不相交，是异面直线`,
          correct: '异面'
        };
      }
    },
    {
      id: 'choice_plane_parallel',
      tags: ['plane_parallel'],
      difficulty: 'medium',
      generate: (config, type) => {
        const planes = findParallelPlanes(config);
        if (planes.length === 0) return null;
        const pair = planes[Math.floor(Math.random() * planes.length)];
        const shuffled = shuffleOptions(['垂直','平行','斜交','重合']);
        return {
          question: `${getGeometryName(type)}中，${pair[0]}与${pair[1]}的位置关系是（  ）`,
          options: shuffled,
          correctIndex: shuffled.correctIndex,
          explanation: `${pair[0]}与${pair[1]}是平行的两个面`,
          correct: '平行'
        };
      }
    },
    {
      id: 'choice_plane_perpendicular',
      tags: ['plane_perpendicular'],
      difficulty: 'medium',
      generate: (config, type) => {
        const perpPlanes = findPerpendicularPlanes(config);
        if (perpPlanes.length === 0) return null;
        const pair = perpPlanes[Math.floor(Math.random() * perpPlanes.length)];
        const shuffled = shuffleOptions(['垂直','平行','斜交','重合']);
        return {
          question: `${getGeometryName(type)}中，${pair[0]}与${pair[1]}的位置关系是（  ）`,
          options: shuffled,
          correctIndex: shuffled.correctIndex,
          explanation: `${pair[0]}与${pair[1]}是垂直的两个面`,
          correct: '垂直'
        };
      }
    },
    // ========== 角度计算 ==========
    {
      id: 'choice_line_line_angle',
      tags: ['angle_line_line'],
      difficulty: 'hard',
      generate: (config, type) => {
        const r = calculateLineLineAngle(config, type);
        const options = ['30°','45°','60°','90°'].filter(a => a !== r.angle);
        options.splice(Math.floor(Math.random()*3), 0, r.angle);
        return {
          question: `${getGeometryName(type)}中，直线${r.edge1[0]}${r.edge1[1]}与直线${r.edge2[0]}${r.edge2[1]}所成角的余弦值为（  ）`,
          options: options,
          correctIndex: options.indexOf(r.angle),
          explanation: `由几何关系可得，两直线所成角的余弦值为${r.formula}，即${r.angle}`,
          correct: r.angle
        };
      }
    },
    {
      id: 'choice_line_plane_angle',
      tags: ['angle_line_plane'],
      difficulty: 'hard',
      generate: (config, type) => {
        const angle = calculateLinePlaneAngle(config, type);
        const options = ['30°','45°','60°','90°'].filter(a => a !== angle);
        options.splice(Math.floor(Math.random()*3), 0, angle);
        return {
          question: `${getGeometryName(type)}中，某条侧棱与底面所成的线面角是（  ）`,
          options: options,
          correctIndex: options.indexOf(angle),
          explanation: `由几何关系可得，侧棱与底面所成的线面角为${angle}`,
          correct: angle
        };
      }
    },
    {
      id: 'choice_dihedral_angle',
      tags: ['angle_dihedral'],
      difficulty: 'hard',
      generate: (config, type) => {
        const angle = calculateDihedralAngle(config, type);
        const options = ['30°','45°','60°','90°'].filter(a => a !== angle);
        options.splice(Math.floor(Math.random()*3), 0, angle);
        return {
          question: `${getGeometryName(type)}中，相邻两个侧面所成二面角的大小是（  ）`,
          options: options,
          correctIndex: options.indexOf(angle),
          explanation: `相邻两个侧面所成的二面角为${angle}`,
          correct: angle
        };
      }
    },
    // ========== 距离计算 ==========
    {
      id: 'choice_point_to_line_distance',
      tags: ['distance_point_line'],
      difficulty: 'medium',
      generate: (config, type) => {
        const vertices = Object.keys(config.vertices || {});
        const edges = config.edges || [];
        if (vertices.length === 0 || edges.length === 0) return null;
        const v = vertices[Math.floor(Math.random() * vertices.length)];
        const edge = edges[Math.floor(Math.random() * edges.length)];
        const dist = calculatePointToLineDistance(v, edge, config, type);
        const options = shuffleOptions([dist, String(Math.round(parseFloat(dist)+0.5)), String(Math.round(parseFloat(dist)-0.5)), String(Math.round(parseFloat(dist)+1))]);
        return {
          question: `${getGeometryName(type)}中，顶点${v}到直线${edge[0]}${edge[1]}的距离为（  ）（设棱长为1）`,
          options: options,
          explanation: `由几何关系可得，顶点${v}到直线${edge[0]}${edge[1]}的距离为${dist}`,
          correct: dist
        };
      }
    },
    {
      id: 'choice_point_to_plane_distance',
      tags: ['distance_point_plane'],
      difficulty: 'hard',
      generate: (config, type) => {
        const vertices = Object.keys(config.vertices || {});
        const faceNames = Object.keys(config.faces || {});
        if (vertices.length === 0 || faceNames.length === 0) return null;
        const v = vertices[Math.floor(Math.random() * vertices.length)];
        const faceName = faceNames[Math.floor(Math.random() * faceNames.length)];
        const faceInfo = { name: faceName, vertices: config.faces[faceName] };
        const dist = calculatePointToPlaneDistance(v, faceInfo, config, type);
        return {
          question: `${getGeometryName(type)}中，顶点${v}到${faceName}的距离为（  ）（设棱长为1）`,
          options: shuffleOptions([dist,'√2','√3','2']),
          explanation: `由几何关系可得，顶点${v}到${faceName}的距离为${dist}`,
          correct: dist
        };
      }
    },
    // ========== 数量问题 ==========
    {
      id: 'choice_edge_count',
      tags: ['count_edge'],
      difficulty: 'easy',
      generate: (config, type) => {
        const edgeCount = (config.edges || []).length;
        const options = shuffleOptions([String(edgeCount), String(edgeCount+2), String(edgeCount-2), String(edgeCount+4)]);
        return {
          question: `${getGeometryName(type)}有（  ）条棱`,
          options: options,
          explanation: `${getGeometryName(type)}有${edgeCount}条棱`,
          correct: String(edgeCount)
        };
      }
    },
    {
      id: 'choice_face_count',
      tags: ['count_face'],
      difficulty: 'easy',
      generate: (config, type) => {
        const faceCount = Object.keys(config.faces || {}).length;
        const options = shuffleOptions([String(faceCount), String(faceCount+1), String(faceCount-1), String(faceCount+2)]);
        return {
          question: `${getGeometryName(type)}有（  ）个面`,
          options: options,
          explanation: `${getGeometryName(type)}有${faceCount}个面`,
          correct: String(faceCount)
        };
      }
    },
    {
      id: 'choice_vertex_count',
      tags: ['count_vertex'],
      difficulty: 'easy',
      generate: (config, type) => {
        const vertexCount = Object.keys(config.vertices || {}).length;
        const options = shuffleOptions([String(vertexCount), String(vertexCount+1), String(vertexCount-1), String(vertexCount+2)]);
        return {
          question: `${getGeometryName(type)}有（  ）个顶点`,
          options: options,
          explanation: `${getGeometryName(type)}有${vertexCount}个顶点`,
          correct: String(vertexCount)
        };
      }
    },
    {
      id: 'choice_diagonal_count',
      tags: ['count_diagonal'],
      difficulty: 'medium',
      generate: (config, type) => {
        const diagCount = countDiagonals(config, type);
        const options = shuffleOptions([String(diagCount), String(diagCount*2), String(diagCount-1), String(diagCount+2)]);
        return {
          question: `${getGeometryName(type)}的体对角线有（  ）条`,
          options: options,
          explanation: `${getGeometryName(type)}有${diagCount}条体对角线`,
          correct: String(diagCount)
        };
      }
    },
    // ========== 体积与表面积 ==========
    {
      id: 'choice_volume',
      tags: ['volume'],
      difficulty: 'medium',
      generate: (config, type) => {
        const volume = calculateVolumeExpr(config, type);
        const wrongOptions = generateWrongExprOptions(volume);
        return {
          question: `${getGeometryName(type)}的体积为（  ）（设棱长为1）`,
          options: shuffleOptions([volume, ...wrongOptions]),
          explanation: `当棱长为1时，${getGeometryName(type)}的体积为${volume}`,
          correct: volume
        };
      }
    },
    {
      id: 'choice_surface_area',
      tags: ['surface_area'],
      difficulty: 'easy',
      generate: (config, type) => {
        const area = calculateSurfaceAreaExpr(config, type);
        const wrongOptions = generateWrongExprOptions(area);
        return {
          question: `${getGeometryName(type)}的表面积为（  ）（设棱长为1）`,
          options: shuffleOptions([area, ...wrongOptions]),
          explanation: `当棱长为1时，${getGeometryName(type)}的表面积为${area}`,
          correct: area
        };
      }
    },
    // ========== 截面问题 ==========
    {
      id: 'choice_section_shape',
      tags: ['section'],
      difficulty: 'hard',
      generate: (config, type) => {
        const sectionInfo = generateSectionQuestion(config, type);
        return {
          question: `${getGeometryName(type)}中，过特定顶点的截面可能是（  ）`,
          options: sectionInfo.options,
          correctIndex: sectionInfo.correctIndex,
          explanation: sectionInfo.explanation,
          correct: sectionInfo.correct
        };
      }
    },
    // ========== 正六棱柱专项 ==========
    {
      id: 'choice_hexagonal_vertex_count',
      tags: ['count_vertex'],
      difficulty: 'easy',
      geometry: 'hexagonalPrism',
      generate: () => ({
        question: `${getGeometryName('hexagonalPrism')}有（  ）个顶点`,
        options: ['6','8','12','18'],
        correctIndex: 2,
        explanation: '正六棱柱有12个顶点（上底面6个，下底面6个）',
        correct: '12'
      })
    },
    {
      id: 'choice_hexagonal_edge_count',
      tags: ['count_edge'],
      difficulty: 'medium',
      geometry: 'hexagonalPrism',
      generate: () => ({
        question: `${getGeometryName('hexagonalPrism')}有（  ）条棱`,
        options: ['12','16','18','24'],
        correctIndex: 2,
        explanation: '正六棱柱有18条棱（上底面6条，下底面6条，垂直棱6条）',
        correct: '18'
      })
    },
    {
      id: 'choice_hexagonal_face_count',
      tags: ['count_face'],
      difficulty: 'easy',
      geometry: 'hexagonalPrism',
      generate: () => ({
        question: `${getGeometryName('hexagonalPrism')}有（  ）个面`,
        options: ['6','8','10','12'],
        correctIndex: 1,
        explanation: '正六棱柱有8个面（上下底面各1个，侧面6个）',
        correct: '8'
      })
    },
    // ========== 斜三棱锥专项 ==========
    {
      id: 'choice_triangular_pyramid_vertex',
      tags: ['count_vertex'],
      difficulty: 'easy',
      geometry: 'triangularPyramid',
      generate: () => ({
        question: `${getGeometryName('triangularPyramid')}有（  ）个顶点`,
        options: ['3','4','5','6'],
        correctIndex: 1,
        explanation: '斜三棱锥有4个顶点（底面3个，顶点1个）',
        correct: '4'
      })
    },
    {
      id: 'choice_triangular_pyramid_edge',
      tags: ['count_edge'],
      difficulty: 'easy',
      geometry: 'triangularPyramid',
      generate: () => ({
        question: `${getGeometryName('triangularPyramid')}有（  ）条棱`,
        options: ['4','5','6','7'],
        correctIndex: 2,
        explanation: '斜三棱锥有6条棱（底面3条，侧棱3条）',
        correct: '6'
      })
    },
    {
      id: 'choice_triangular_pyramid_face',
      tags: ['count_face'],
      difficulty: 'easy',
      geometry: 'triangularPyramid',
      generate: () => ({
        question: `${getGeometryName('triangularPyramid')}有（  ）个面`,
        options: ['3','4','5','6'],
        correctIndex: 1,
        explanation: '斜三棱锥有4个面（底面1个，侧面3个）',
        correct: '4'
      })
    }
  ],
  fill: [
    {
      id: 'fill_vertex_count',
      tags: ['count_vertex'],
      difficulty: 'easy',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}有______个顶点`,
        answers: [String(Object.keys(config.vertices || {}).length)],
        explanation: `${getGeometryName(type)}有${Object.keys(config.vertices || {}).length}个顶点`
      })
    },
    {
      id: 'fill_edge_count',
      tags: ['count_edge'],
      difficulty: 'easy',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}有______条棱`,
        answers: [String((config.edges || []).length)],
        explanation: `${getGeometryName(type)}有${(config.edges || []).length}条棱`
      })
    },
    {
      id: 'fill_face_count',
      tags: ['count_face'],
      difficulty: 'easy',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}有______个面`,
        answers: [String(Object.keys(config.faces || {}).length)],
        explanation: `${getGeometryName(type)}有${Object.keys(config.faces || {}).length}个面`
      })
    },
    {
      id: 'fill_volume',
      tags: ['volume'],
      difficulty: 'medium',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}的体积公式为______（设棱长为a）`,
        answers: type === 'cube' ? ['a³','a^3','a*a*a'] : ['V=Sh'],
        explanation: type === 'cube' ? '正方体体积 = a³' : '棱柱/棱锥体积 = 底面积 × 高'
      })
    },
    {
      id: 'fill_surface_area',
      tags: ['surface_area'],
      difficulty: 'medium',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}的表面积公式为______（设棱长为a）`,
        answers: type === 'cube' ? ['6a²','6a^2','6*a*a'] : ['S=各面面积之和'],
        explanation: type === 'cube' ? '正方体表面积 = 6a²' : '表面积 = 各面面积之和'
      })
    },
    {
      id: 'fill_diagonal',
      tags: ['count_diagonal'],
      difficulty: 'medium',
      generate: (config, type) => ({
        question: `${getGeometryName(type)}的体对角线有______条`,
        answers: [String(countDiagonals(config, type))],
        explanation: `${getGeometryName(type)}有${countDiagonals(config, type)}条体对角线`
      })
    },
    {
      id: 'fill_triangular_pyramid_volume',
      tags: ['volume'],
      difficulty: 'hard',
      geometry: 'triangularPyramid',
      generate: () => ({
        question: '斜三棱锥的底面面积为3，高为4，则其体积为______',
        answers: ['4','4.0','4.00'],
        explanation: '锥体体积 = (1/3) × 底面积 × 高 = (1/3) × 3 × 4 = 4'
      })
    }
  ],
  proof: [
    // ========== 正方体证明题 ==========
    {
      id: 'proof_cube_diagonal_perp',
      tags: ['proof_line_perp', 'line_perpendicular'],
      difficulty: 'medium',
      geometry: 'cube',
      generate: () => ({
        question: '正方体的对角线与棱垂直',
        premise: '已知：正方体ABCD-EFGH',
        claim: '求证：对棱AC ⊥ BD',
        proofSteps: [
          { statement: '在正方形ABCD中，AC和BD是对角线', reason: '由正方形的性质可得' },
          { statement: '正方形的对角线互相垂直', reason: '正方形的性质' },
          { statement: 'AC ⊥ BD', reason: '正方形对角线互相垂直' }
        ],
        hints: ['利用正方形的性质','正方形的对角线互相垂直']
      })
    },
    {
      id: 'proof_cube_skew',
      tags: ['proof_skew', 'line_skew'],
      difficulty: 'hard',
      geometry: 'cube',
      generate: () => ({
        question: '正方体的异面直线',
        premise: '已知：正方体ABCD-EFGH',
        claim: '求证：直线AE和直线DH是异面直线',
        proofSteps: [
          { statement: 'AE是侧棱，DH是侧棱', reason: '由正方体结构可得' },
          { statement: '假设AE和DH共面', reason: '反证法' },
          { statement: '若AE∥DH，则AD∥EH', reason: '平行四边形性质' },
          { statement: '但AD与EH不平行', reason: 'AD在底面，EH在顶面，方向不同' },
          { statement: '若AE与DH相交，则交点在平面ADHE上', reason: '两直线相交确定一个平面' },
          { statement: '但这与A、E、D、H四点共面矛盾', reason: 'E和D在不同的平面上' },
          { statement: '故假设不成立，AE和DH是异面直线', reason: '反证法得证' }
        ],
        hints: ['本题适合用反证法','假设不是异面直线，即共面或平行','证明这两种情况都不可能']
      })
    },
    {
      id: 'proof_cube_plane_perp',
      tags: ['proof_plane_perp', 'plane_perpendicular'],
      difficulty: 'medium',
      geometry: 'cube',
      generate: () => ({
        question: '正方体的面面垂直',
        premise: '已知：正方体ABCD-EFGH',
        claim: '求证：平面ABCD ⊥ 平面ABE',
        proofSteps: [
          { statement: 'AB ⊥ BE', reason: '正方体的棱互相垂直' },
          { statement: 'AB ⊂ 平面ABCD', reason: 'AB是底面的一条棱' },
          { statement: 'BE ⊂ 平面ABE', reason: 'BE是侧面的一条棱' },
          { statement: 'AB ⊥ 平面ABE', reason: 'AB垂直于平面ABE内的BE' },
          { statement: '平面ABCD ⊥ 平面ABE', reason: '面面垂直判定定理' }
        ],
        hints: ['正方体的棱互相垂直','找平面内的直线垂直于另一个平面','直接应用面面垂直判定定理']
      })
    },
    // ========== 正四面体证明题 ==========
    {
      id: 'proof_tetrahedron_perp',
      tags: ['proof_line_perp', 'line_perpendicular'],
      difficulty: 'hard',
      geometry: 'tetrahedron',
      generate: () => ({
        question: '正四面体的对棱垂直',
        premise: '已知：正四面体A-BCD',
        claim: '求证：对棱AD ⊥ BC',
        proofSteps: [
          { statement: '取BC的中点M，连接AM和DM', reason: '添加辅助线' },
          { statement: '在正四面体中，AM ⊥ BC', reason: '正三角形的高' },
          { statement: '在正四面体中，DM ⊥ BC', reason: '正三角形的高' },
          { statement: 'BC ⊥ 平面AMD', reason: '直线垂直于平面内两条相交直线' },
          { statement: 'AD在平面AMD内', reason: 'A和D都在该平面内' },
          { statement: 'AD ⊥ BC', reason: '线面垂直的性质' }
        ],
        hints: ['取BC的中点M','构造平面AMD','利用正三角形的性质：AM和DM都是BC的高']
      })
    },
    {
      id: 'proof_tetrahedron_plane_perp',
      tags: ['proof_plane_perp', 'plane_perpendicular'],
      difficulty: 'hard',
      geometry: 'tetrahedron',
      generate: () => ({
        question: '正四面体的面面垂直',
        premise: '已知：正四面体A-BCD，E是AD的中点',
        claim: '求证：平面BCE ⊥ 平面ACD',
        proofSteps: [
          { statement: 'E是AD的中点', reason: '由已知可得' },
          { statement: '在正四面体中，取BC的中点F', reason: '添加辅助线' },
          { statement: 'EF ∥ CD', reason: '三角形中位线定理' },
          { statement: 'BF ⊥ CD', reason: '正三角形的高' },
          { statement: 'EF ⊥ BF', reason: '平行线性质' },
          { statement: 'BF ⊥ 平面ACD', reason: 'BF垂直于平面ACD内的两条相交直线' },
          { statement: '平面BCE ⊥ 平面ACD', reason: '面内直线垂直于另一个平面' }
        ],
        hints: ['构造BC的中点F','利用三角形中位线定理','关键是证明BF垂直于平面ACD']
      })
    },
    // ========== 正四棱锥证明题 ==========
    {
      id: 'proof_square_pyramid_line_plane',
      tags: ['proof_line_plane_parallel', 'line_plane_parallel'],
      difficulty: 'medium',
      geometry: 'squarePyramid',
      generate: () => ({
        question: '正四棱锥的线面平行',
        premise: '已知：正四棱锥P-ABCD，O是底面ABCD的中心，M是侧棱PA的中点',
        claim: '求证：直线MB ∥ 平面PCD',
        proofSteps: [
          { statement: 'M是PA的中点，O是ABCD的中心', reason: '由已知可得' },
          { statement: '在正四棱锥中，PO ⊥ 平面ABCD', reason: '正棱锥的性质' },
          { statement: 'O是ABCD对角线的交点', reason: '正方形的性质' },
          { statement: 'MO ∥ PC', reason: '直角三角形斜边中线的性质' },
          { statement: 'MO ⊥ AB', reason: '由对称性可得' },
          { statement: 'MB ∥ 平面PCD', reason: '线面平行的判定定理' }
        ],
        hints: ['利用正四棱锥的对称性','O是底面中心，连结MO','构造平行四边形']
      })
    },
    {
      id: 'proof_square_pyramid_height',
      tags: ['proof_line_plane_perp', 'line_plane_perpendicular'],
      difficulty: 'medium',
      geometry: 'squarePyramid',
      generate: () => ({
        question: '正四棱锥的高的性质',
        premise: '已知：正四棱锥P-ABCD，O是底面ABCD的中心',
        claim: '求证：PO ⊥ 平面ABCD',
        proofSteps: [
          { statement: 'O是底面ABCD的中心', reason: '由已知可得' },
          { statement: 'PA = PB = PC = PD', reason: '正四棱锥的定义' },
          { statement: 'OA = OB = OC = OD', reason: '正方形对角线交点的性质' },
          { statement: '△POA ≌ △POB ≌ △POC ≌ △POD', reason: 'SSS全等' },
          { statement: '∠POA = ∠POB = ∠POC = ∠POD', reason: '全等三角形的对应角相等' },
          { statement: 'PO ⊥ 平面ABCD', reason: '射影定理' }
        ],
        hints: ['利用正四棱锥的定义','证明底面中心O到各顶点距离相等','利用全等三角形']
      })
    },
    // ========== 三棱柱证明题 ==========
    {
      id: 'proof_triangular_prism_line_plane',
      tags: ['proof_line_plane_parallel', 'line_plane_parallel'],
      difficulty: 'easy',
      geometry: 'triangularPrism',
      generate: () => ({
        question: '三棱柱的线面平行',
        premise: '已知：三棱柱ABC-DEF，M是侧棱AD的中点，N是侧棱BE的中点',
        claim: '求证：直线MN ∥ 平面ACF',
        proofSteps: [
          { statement: 'M是AD的中点，N是BE的中点', reason: '由已知可得' },
          { statement: '在棱柱中，AD ∥ BE ∥ CF', reason: '棱柱对应棱平行' },
          { statement: 'ME = EN', reason: '由中点条件可得' },
          { statement: '四边形MNFE是平行四边形', reason: '一组对边平行且相等' },
          { statement: 'MN ∥ EF', reason: '平行四边形的对边平行' },
          { statement: 'EF ⊂ 平面ACF', reason: 'E和F都在平面ACF上' },
          { statement: 'MN ∥ 平面ACF', reason: '直线平行于平面内的直线' }
        ],
        hints: ['构造平行四边形MNFE','利用棱柱中侧棱平行的性质','将线面平行转化为线线平行']
      })
    },
    {
      id: 'proof_triangular_prism_plane_perp',
      tags: ['proof_plane_perp', 'plane_perpendicular'],
      difficulty: 'medium',
      geometry: 'triangularPrism',
      generate: () => ({
        question: '三棱柱的面面垂直',
        premise: '已知：三棱柱ABC-DEF，底面ABC是直角三角形，∠ABC = 90°',
        claim: '求证：平面ABC ⊥ 平面BCF',
        proofSteps: [
          { statement: '∠ABC = 90°', reason: '由已知可得' },
          { statement: 'AB ⊥ BC', reason: '直角三角形的定义' },
          { statement: 'AB ⊂ 平面ABC', reason: 'AB是底面的一条边' },
          { statement: 'BC ⊂ 平面BCF', reason: 'BC是侧面的一条边' },
          { statement: 'AB ⊥ 平面BCF', reason: 'AB垂直于平面BCF内的BC' },
          { statement: '平面ABC ⊥ 平面BCF', reason: '面面垂直判定定理' }
        ],
        hints: ['利用直角三角形的性质','找平面ABC内垂直于平面BCF的直线','AB ⊥ BC，再利用线面垂直判定面面垂直']
      })
    },
    {
      id: 'proof_triangular_prism_skew',
      tags: ['proof_skew', 'line_skew'],
      difficulty: 'hard',
      geometry: 'triangularPrism',
      generate: () => ({
        question: '三棱柱的异面直线',
        premise: '已知：三棱柱ABC-DEF',
        claim: '求证：直线AD和直线BC是异面直线',
        proofSteps: [
          { statement: 'AD是侧棱，BC是底面的一条边', reason: '由棱柱结构可得' },
          { statement: 'AD和BC没有公共点', reason: 'AD在侧面，BC在底面，它们不在同一个面内' },
          { statement: 'AD不平行于BC', reason: '分析方向：AD是侧棱方向，BC是底面方向' },
          { statement: 'AD和BC不在同一平面内', reason: '若共面，则交于一点或平行' },
          { statement: 'AD和BC是异面直线', reason: '既不平行也不相交，且不在同一平面内' }
        ],
        hints: ['分析AD和BC的位置','它们既不平行也不相交','不在同一个平面内']
      })
    },
    // ========== 正八面体证明题 ==========
    {
      id: 'proof_octahedron_line_perp',
      tags: ['proof_line_perp', 'line_perpendicular'],
      difficulty: 'medium',
      geometry: 'octahedron',
      generate: () => ({
        question: '正八面体的对棱垂直',
        premise: '已知：正八面体ABCD-EF，O是正八面体的中心',
        claim: '求证：AB ⊥ CD',
        proofSteps: [
          { statement: 'O是正八面体的中心', reason: '由已知可得' },
          { statement: '正八面体由两个正四棱锥组成', reason: '正八面体的结构' },
          { statement: 'OA = OB = OC = OD = OE = OF', reason: '正八面体的性质' },
          { statement: '取AB的中点M，连接OM', reason: '添加辅助线' },
          { statement: '在△AOB中，OM ⊥ AB', reason: '等腰三角形底边中线垂直于底边' },
          { statement: '同理可证OM ⊥ CD', reason: '对称性' },
          { statement: 'AB ⊥ CD', reason: '由对称性分析可得' }
        ],
        hints: ['利用正八面体的对称性','取AB的中点M','利用等腰三角形的性质']
      })
    },
    // ========== 正五棱锥证明题 ==========
    {
      id: 'proof_pentagonal_pyramid_height',
      tags: ['proof_line_plane_perp', 'line_plane_perpendicular'],
      difficulty: 'hard',
      geometry: 'pentagonalPyramid',
      generate: () => ({
        question: '正五棱锥的高的性质',
        premise: '已知：正五棱锥P-ABCDE，O是底面正五边形的中心',
        claim: '求证：PO ⊥ 平面ABCDE',
        proofSteps: [
          { statement: 'O是底面正五边形的中心', reason: '由已知可得' },
          { statement: 'PA = PB = PC = PD = PE', reason: '正五棱锥的定义' },
          { statement: 'OA = OB = OC = OD = OE', reason: '正五边形外接圆的性质' },
          { statement: '△POA ≌ △POB ≌ △POC ≌ △POD ≌ △POE', reason: 'SSS全等' },
          { statement: '∠POA = ∠POB = ... = 90°', reason: '全等三角形的对应角相等' },
          { statement: 'PO ⊥ 平面ABCDE', reason: '直线垂直于平面内过垂足的两条直线' }
        ],
        hints: ['利用正五棱锥的定义','正五边形外接圆的性质','利用全等三角形证明垂直']
      })
    }
  ]
};

// ========================
// 静态题库（35题）
// ========================
const STATIC_QUESTION_BANK = [
  // 选择题 (1-8)
  { id:1, type:'choice', difficulty:'easy', geometry:'cube', question:'正方体ABCD-EFGH中，与棱AB平行的棱有（  ）条', options:['3','4','5','6'], correct:0, explanation:'与AB平行的棱有CD（在前面）、EF（在下面）、GH（在后面），共3条' },
  { id:2, type:'choice', difficulty:'easy', geometry:'cube', question:'正方体ABCD-EFGH中，直线AB与直线HG的位置关系是（  ）', options:['平行','相交','异面','垂直'], correct:0, explanation:'AB与HG平行，它们在同一平面内且方向相同' },
  { id:3, type:'choice', difficulty:'medium', geometry:'cube', question:'正方体ABCD-EFGH中，直线BD与直线FH的位置关系是（  ）', options:['平行','相交','异面','垂直'], correct:2, explanation:'BD在前表面，FH在后表面，两直线既不平行也不相交，是异面直线' },
  { id:4, type:'choice', difficulty:'medium', geometry:'cube', question:'正方体的棱长为2，则其体对角线长为（  ）', options:['2√2','2√3','4','4√2'], correct:1, explanation:'体对角线长 = 棱长 × √3 = 2√3' },
  { id:5, type:'choice', difficulty:'hard', geometry:'cube', question:'正方体ABCD-EFGH中，∠BDH的度数是（  ）', options:['30°','45°','60°','90°'], correct:3, explanation:'BD=2√2, DH=2, BH=2√3。由余弦定理cos(∠BDH)=0，所以∠BDH=90°' },
  { id:6, type:'choice', difficulty:'easy', geometry:'cube', question:'正方体的棱长为a，其表面积为（  ）', options:['a²','4a²','6a²','8a²'], correct:2, explanation:'正方体有6个面，每个面面积为a²，所以表面积为6a²' },
  { id:7, type:'choice', difficulty:'medium', geometry:'tetrahedron', question:'正四面体的棱长为a，其高为（  ）', options:['a','a√2','a√6/3','a√3/2'], correct:2, explanation:'正四面体的高 = a × √6/3' },
  { id:8, type:'choice', difficulty:'medium', geometry:'cube', question:'正方体ABCD-EFGH中，二面角A-BF-H的大小为（  ）', options:['30°','45°','60°','90°'], correct:1, explanation:'AB⊥BF，AB⊥BH，∠ABH在底面上是45°，所以二面角为45°' },
  // 填空题 (9-16)
  { id:9, type:'fill', difficulty:'easy', geometry:'cube', question:'正方体有______个面，______条棱，______个顶点', answers:['6','12','8'], explanation:'正方体是特殊的长方体，有6个面、12条棱、8个顶点' },
  { id:10, type:'fill', difficulty:'easy', geometry:'cube', question:'正方体的体积公式为______（设棱长为a）', answers:['a³','a*a*a','a^3'], explanation:'正方体体积 = a³' },
  { id:11, type:'fill', difficulty:'easy', geometry:'cube', question:'正方体的体对角线有______条', answers:['4'], explanation:'正方体有4条体对角线（AG、BH、CE、DF）' },
  { id:12, type:'fill', difficulty:'medium', geometry:'cube', question:'若正方体棱长为1，则其体对角线长为______', answers:['√3','sqrt(3)','1.732'], explanation:'体对角线长 = 棱长 × √3 = √3' },
  { id:13, type:'fill', difficulty:'medium', geometry:'cube', question:'正方体ABCD-EFGH中，点A到直线GH的距离为______', answers:['√2','sqrt(2)','1.414'], explanation:'A到GH的距离等于A到过GH且平行于AB的直线的距离，为√2' },
  { id:14, type:'fill', difficulty:'medium', geometry:'tetrahedron', question:'正四面体的面数为______', answers:['4'], explanation:'正四面体有4个面' },
  { id:15, type:'fill', difficulty:'medium', geometry:'squarePyramid', question:'正四棱锥的棱数为______', answers:['8'], explanation:'正四棱锥有8条棱（底面4条+侧棱4条）' },
  { id:16, type:'fill', difficulty:'hard', geometry:'cube', question:'正方体ABCD-EFGH中，二面角A-BD-H的余弦值为______', answers:['1/3','0.333'], explanation:'利用向量法可求得二面角A-BD-H的余弦值为1/3' },
  // 证明题 (17-25)
  { id:17, type:'proof', difficulty:'medium', geometry:'cube', premise:'已知：正方体ABCD-EFGH', claim:'求证：AC ⊥ BD', proofSteps:[{statement:'在正方形ABCD中，AC和BD是对角线',reason:'由正方形的性质可得'},{statement:'正方形的对角线互相垂直',reason:'正方形的性质'},{statement:'AC ⊥ BD',reason:'正方形对角线互相垂直'}], hints:['利用正方形的性质'], knowledgePoints:['proof_line_perp'] },
  { id:18, type:'proof', difficulty:'hard', geometry:'cube', premise:'已知：正方体ABCD-EFGH', claim:'求证：AE和DH是异面直线', proofSteps:[{statement:'AE是侧棱，DH是侧棱',reason:'由正方体结构可得'},{statement:'假设AE和DH共面',reason:'反证法'},{statement:'AE和DH既不平行也不相交',reason:'分析可得'},{statement:'故假设不成立',reason:'反证法得证'}], hints:['用反证法'], knowledgePoints:['proof_skew'] },
  { id:19, type:'proof', difficulty:'medium', geometry:'tetrahedron', premise:'已知：正四面体A-BCD', claim:'求证：AD ⊥ BC', proofSteps:[{statement:'取BC的中点M',reason:'添加辅助线'},{statement:'AM ⊥ BC且DM ⊥ BC',reason:'正三角形的高'},{statement:'BC ⊥ 平面AMD',reason:'线面垂直判定'},{statement:'AD ⊥ BC',reason:'线面垂直性质'}], hints:['取中点，构造平面'], knowledgePoints:['proof_line_perp'] },
  { id:20, type:'proof', difficulty:'hard', geometry:'tetrahedron', premise:'已知：正四面体A-BCD，E是AD中点', claim:'求证：平面BCE ⊥ 平面ACD', proofSteps:[{statement:'取BC中点F',reason:'添加辅助线'},{statement:'EF ∥ CD',reason:'中位线定理'},{statement:'BF ⊥ CD',reason:'正三角形的高'},{statement:'BF ⊥ 平面ACD',reason:'线面垂直判定'},{statement:'平面BCE ⊥ 平面ACD',reason:'面面垂直判定'}], hints:['构造中位线','证明BF⊥平面ACD'], knowledgePoints:['proof_plane_perp'] },
  { id:21, type:'proof', difficulty:'medium', geometry:'squarePyramid', premise:'已知：正四棱锥P-ABCD，O是底面中心', claim:'求证：PO ⊥ 平面ABCD', proofSteps:[{statement:'PA=PB=PC=PD',reason:'正棱锥定义'},{statement:'OA=OB=OC=OD',reason:'正方形性质'},{statement:'△POA≌△POB≌△POC≌△POD',reason:'SSS全等'},{statement:'PO ⊥ 平面ABCD',reason:'射影定理'}], hints:['利用全等三角形'], knowledgePoints:['proof_line_plane_perp'] },
  { id:22, type:'proof', difficulty:'easy', geometry:'triangularPrism', premise:'已知：三棱柱ABC-DEF，M是AD中点，N是BE中点', claim:'求证：MN ∥ 平面ACF', proofSteps:[{statement:'AD ∥ BE ∥ CF',reason:'棱柱性质'},{statement:'四边形MNFE是平行四边形',reason:'一组对边平行且相等'},{statement:'MN ∥ EF',reason:'平行四边形对边平行'},{statement:'MN ∥ 平面ACF',reason:'线面平行判定'}], hints:['构造平行四边形'], knowledgePoints:['proof_line_plane_parallel'] },
  { id:23, type:'proof', difficulty:'medium', geometry:'triangularPrism', premise:'已知：三棱柱ABC-DEF，∠ABC=90°', claim:'求证：平面ABC ⊥ 平面BCF', proofSteps:[{statement:'AB ⊥ BC',reason:'直角三角形'},{statement:'AB ⊂ 平面ABC',reason:'底面边'},{statement:'AB ⊥ 平面BCF',reason:'线面垂直判定'},{statement:'平面ABC ⊥ 平面BCF',reason:'面面垂直判定'}], hints:['利用直角三角形性质'], knowledgePoints:['proof_plane_perp'] },
  { id:24, type:'proof', difficulty:'hard', geometry:'triangularPrism', premise:'已知：三棱柱ABC-DEF', claim:'求证：AD和BC是异面直线', proofSteps:[{statement:'AD是侧棱，BC是底面边',reason:'棱柱结构'},{statement:'AD和BC没有公共点',reason:'不在同一面内'},{statement:'AD不平行于BC',reason:'方向不同'},{statement:'AD和BC是异面直线',reason:'异面直线定义'}], hints:['分析位置关系'], knowledgePoints:['proof_skew'] },
  { id:25, type:'proof', difficulty:'medium', geometry:'cube', premise:'已知：正方体ABCD-EFGH', claim:'求证：平面ABCD ⊥ 平面ABE', proofSteps:[{statement:'AB ⊥ BE',reason:'正方体棱垂直'},{statement:'AB ⊂ 平面ABCD',reason:'底面棱'},{statement:'AB ⊥ 平面ABE',reason:'线面垂直判定'},{statement:'平面ABCD ⊥ 平面ABE',reason:'面面垂直判定'}], hints:['棱互相垂直'], knowledgePoints:['proof_plane_perp'] },
  // 作图题 (26-30)
  { id:26, type:'drawing', difficulty:'easy', geometry:'cube', question:'在正方体ABCD-EFGH中，选择所有与棱AB平行的棱', targetVertices:['C','D','E','F','G','H'], explanation:'与AB平行的棱：CD、EF、GH' },
  { id:27, type:'drawing', difficulty:'medium', geometry:'cube', question:'在正方体中，选择所有与平面ABCD垂直的棱', targetVertices:['A','E','B','F','C','G','D','H'], explanation:'与底面垂直的棱：AE、BF、CG、DH' },
  { id:28, type:'drawing', difficulty:'medium', geometry:'tetrahedron', question:'在正四面体A-BCD中，选择所有与AD垂直的棱的端点', targetVertices:['B','C'], explanation:'AD ⊥ BC，所以选择B和C' },
  { id:29, type:'drawing', difficulty:'hard', geometry:'cube', question:'在正方体中，选择体对角线AG的两个端点', targetVertices:['A','G'], explanation:'体对角线AG连接A和G' },
  { id:30, type:'drawing', difficulty:'medium', geometry:'squarePyramid', question:'在正四棱锥P-ABCD中，选择所有侧棱的端点', targetVertices:['A','B','C','D','P'], explanation:'侧棱为PA、PB、PC、PD' },
  // 综合题 (31-35)
  { id:31, type:'choice', difficulty:'hard', geometry:'cube', question:'正方体ABCD-EFGH中，直线AC与直线EG的位置关系是（  ）', options:['平行','相交','异面','垂直'], correct:0, explanation:'AC在底面，EG在顶面，方向相同，互相平行' },
  { id:32, type:'fill', difficulty:'hard', geometry:'tetrahedron', question:'正四面体的棱长为1，则其体积为______', answers:['√2/12','sqrt(2)/12','0.1178'], explanation:'V = (√2/12)a³ = √2/12' },
  { id:33, type:'choice', difficulty:'medium', geometry:'hexagonalPrism', question:'正六棱柱的底面是正六边形，其内角和为（  ）', options:['360°','540°','720°','1080°'], correct:2, explanation:'正六边形内角和 = (6-2)×180° = 720°' },
  { id:34, type:'fill', difficulty:'medium', geometry:'squarePyramid', question:'正四棱锥的底面边长为2，高为3，则其体积为______', answers:['4','4.0'], explanation:'V = (1/3)×2²×3 = 4' },
  { id:35, type:'choice', difficulty:'hard', geometry:'cube', question:'正方体ABCD-EFGH中，二面角C-AF-B的正切值为（  ）', options:['1','√2','√3','2'], correct:1, explanation:'利用向量法可求得二面角C-AF-B的正切值为√2' }
];

// ========================
// QuestionBank 主类
// ========================
export class QuestionBank {
  constructor() {
    this._allTemplates = [
      ...(QUESTION_TEMPLATES.choice || []),
      ...(QUESTION_TEMPLATES.fill || []),
      ...(QUESTION_TEMPLATES.proof || [])
    ];
    this._genId = 100;
  }

  /** 获取知识点分类 */
  getKnowledgePoints() {
    return KNOWLEDGE_POINTS;
  }

  /** 获取静态题库 */
  getStaticQuestions() {
    return STATIC_QUESTION_BANK;
  }

  /** 获取题库统计 */
  getStats() {
    return {
      total: STATIC_QUESTION_BANK.length,
      byType: {
        choice: STATIC_QUESTION_BANK.filter(q => q.type === 'choice').length,
        fill: STATIC_QUESTION_BANK.filter(q => q.type === 'fill').length,
        proof: STATIC_QUESTION_BANK.filter(q => q.type === 'proof').length,
        drawing: STATIC_QUESTION_BANK.filter(q => q.type === 'drawing').length
      }
    };
  }

  /** 随机出题（静态题库 + 30%动态） */
  randomQuestion(answeredIds = []) {
    const unanswered = STATIC_QUESTION_BANK.filter(q => !answeredIds.includes(q.id));
    if (unanswered.length === 0) {
      return this.autoGenerateQuestion({ type: 'mixed', difficulty: 'mixed' });
    }
    if (Math.random() < 0.3) {
      return this.autoGenerateQuestion({ type: 'mixed', difficulty: 'mixed' });
    }
    return unanswered[Math.floor(Math.random() * unanswered.length)];
  }

  /** 自动生成题目（支持筛选） */
  autoGenerateQuestion(options = {}) {
    const geometryTypes = Object.keys(GEOMETRY_CONFIGS).filter(k => GEOMETRY_CONFIGS[k].type === 'polyhedron');
    const typeFilter = options.type || 'mixed';
    const difficultyFilter = options.difficulty || 'mixed';
    const knowledgeFilter = options.knowledge || [];

    const allTypes = ['choice', 'fill', 'proof'];
    const qType = typeFilter === 'mixed'
      ? allTypes[Math.floor(Math.random() * allTypes.length)]
      : typeFilter;

    const geoType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    return this.generateDynamicQuestion(qType, geoType, {
      difficulty: difficultyFilter,
      knowledge: knowledgeFilter
    });
  }

  /** 生成动态题目 */
  generateDynamicQuestion(type, geometryType, options = {}) {
    const config = GEOMETRY_CONFIGS[geometryType];
    if (!config) return this._fallbackQuestion(type, geometryType);

    let templates = type === 'mixed'
      ? this._allTemplates
      : (QUESTION_TEMPLATES[type] || this._allTemplates);

    if (options.difficulty && options.difficulty !== 'mixed') {
      templates = templates.filter(t => t.difficulty === options.difficulty);
    }

    if (options.knowledge && options.knowledge.length > 0) {
      templates = templates.filter(t =>
        t.tags && t.tags.some(tag => options.knowledge.includes(tag))
      );
    }

    const matched = templates.filter(t => !t.geometry || t.geometry === geometryType);
    if (matched.length > 0) templates = matched;

    if (templates.length === 0) {
      templates = this._allTemplates.filter(t => !t.geometry);
    }
    if (templates.length === 0) return this._fallbackQuestion(type, geometryType);

    const template = templates[Math.floor(Math.random() * templates.length)];
    const result = template.generate(config, geometryType);
    if (!result) return this._fallbackQuestion(type, geometryType);

    return {
      id: this._genId++,
      type: template.id.startsWith('proof_') ? 'proof' : (type === 'mixed' ? template.id.split('_')[0] : type),
      difficulty: template.difficulty,
      geometry: geometryType,
      tags: template.tags,
      ...result
    };
  }

  /** 兜底题目 */
  _fallbackQuestion(type, geometryType) {
    const config = GEOMETRY_CONFIGS[geometryType] || GEOMETRY_CONFIGS.cube;
    const name = config.name || '几何体';
    return {
      id: this._genId++,
      type: 'choice',
      difficulty: 'easy',
      geometry: geometryType || 'cube',
      question: `${name}有（  ）个顶点`,
      options: shuffleOptions([String(Object.keys(config.vertices || {}).length), '4', '6', '8']),
      correctIndex: 0,
      explanation: `${name}有${Object.keys(config.vertices || {}).length}个顶点`,
      correct: String(Object.keys(config.vertices || {}).length)
    };
  }

  /** 按知识点筛选题目 */
  filterByKnowledge(knowledgeTags) {
    return STATIC_QUESTION_BANK.filter(q =>
      q.knowledgePoints && q.knowledgePoints.some(k => knowledgeTags.includes(k))
    );
  }

  /** 按难度筛选 */
  filterByDifficulty(questions, difficulty) {
    return questions.filter(q => q.difficulty === difficulty);
  }

  /** 获取所有几何体类型（用于动态出题） */
  getGeometryTypes() {
    return Object.keys(GEOMETRY_CONFIGS).filter(k => GEOMETRY_CONFIGS[k].type === 'polyhedron');
  }
}

// ========================
// HintManager — 提示管理器
// ========================
export class HintManager {
  constructor() {
    this.hints = {};
    this.hintIndex = {};
  }

  getHint(questionId) {
    if (!this.hintIndex[questionId]) this.hintIndex[questionId] = 0;
    const hint = this.hints[questionId];
    if (!hint) return null;
    const current = this.hintIndex[questionId];
    if (current >= hint.steps.length) return null;
    const step = hint.steps[current];
    this.hintIndex[questionId] = current + 1;
    return { step: current + 1, totalSteps: hint.steps.length, hint: step };
  }

  resetHints(questionId) {
    this.hintIndex[questionId] = 0;
  }

  addHint(questionId, steps) {
    this.hints[questionId] = { steps };
  }

  hasHints(questionId) {
    return !!this.hints[questionId];
  }

  getHintCount(questionId) {
    return this.hints[questionId] ? this.hints[questionId].steps.length : 0;
  }
}
