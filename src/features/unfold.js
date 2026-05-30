/**
 * UnfoldManager
 * 几何体展开/折叠管理器 — 生成正确的展开图（2D net）
 *
 * 算法：
 * 1. 检测面邻接关系（共享边的面）
 * 2. 用 BFS 生成展开树（spanning tree）
 * 3. 递归计算各面在 XY 平面上的目标位置
 * 4. 动画：从 3D 位置/旋转 → 2D 位置/旋转
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import gsap from 'gsap';

export class UnfoldManager {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.unfoldGroup = null;
    this.isUnfolded = false;
    this.progress = 0;
    this.animation = null;
    this.animationSpeed = 1;
  }

  /**
   * 创建展开图组
   */
  createUnfoldGroup(config, vertices) {
    this.clear();

    if (config.type === 'curved') {
      this._createCurvedUnfold(config);
      return;
    }
    if (!config.faces) return;

    // 将顶点转为 Vector3
    const verts3D = {};
    for (const [name, pos] of Object.entries(vertices)) {
      verts3D[name] = new THREE.Vector3(pos.x, pos.y, pos.z);
    }

    // 面数据
    const faces = {};
    for (const [name, vertNames] of Object.entries(config.faces)) {
      if (!Array.isArray(vertNames)) continue;
      faces[name] = vertNames;
    }

    // 计算面法线和中心
    const faceNormals = {};
    const faceCenters = {};
    for (const [name, vertNames] of Object.entries(faces)) {
      const vs = vertNames.map(n => verts3D[n]);
      const center = new THREE.Vector3();
      vs.forEach(v => center.add(v));
      center.divideScalar(vs.length);
      faceCenters[name] = center;

      const normal = new THREE.Vector3();
      if (vs.length >= 3) {
        const e1 = vs[1].clone().sub(vs[0]);
        const e2 = vs[2].clone().sub(vs[0]);
        normal.crossVectors(e1, e2).normalize();
      }
      faceNormals[name] = normal;
    }

    // 面邻接：共享一条边的两个面
    const adjacency = this._buildAdjacency(faces);

    // 选择底面作为根（法线最朝下的面）
    const rootFace = this._selectRootFace(faces, faceNormals);

    // BFS 计算 2D 网格位置
    const netPositions = this._computeNetPositions(
      rootFace, faces, verts3D, faceNormals, faceCenters, adjacency
    );

    // 创建展开组
    this.unfoldGroup = new THREE.Group();
    this.unfoldGroup.name = 'unfold';

    const color = new THREE.Color(config.color || '#6750A4');

    for (const [faceName, vertNames] of Object.entries(faces)) {
      const netPos = netPositions[faceName];
      if (!netPos) continue;

      const vertsLocal3D = vertNames.map(n => verts3D[n].clone());
      const center3D = faceCenters[faceName];
      const local3D = vertsLocal3D.map(v => v.clone().sub(center3D));

      const verts2D = netPos.vertices;
      const center2D = netPos.center;
      const local2D = verts2D.map(v => v.clone().sub(center2D));

      const faceGroup = new THREE.Group();
      faceGroup.position.copy(center3D);

      // 面
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(local3D.length * 3);
      local3D.forEach((v, i) => {
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      });
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const faceIndices = [];
      for (let i = 1; i < local3D.length - 1; i++) {
        faceIndices.push(0, i, i + 1);
      }
      geom.setIndex(faceIndices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      faceGroup.add(new THREE.Mesh(geom, mat));

      // 边
      const edgePoints = [];
      for (let i = 0; i < local3D.length; i++) {
        edgePoints.push(local3D[i], local3D[(i + 1) % local3D.length]);
      }
      const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePoints);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 1 });
      faceGroup.add(new THREE.LineSegments(edgeGeom, edgeMat));

      // 顶点标签
      for (let i = 0; i < vertNames.length; i++) {
        const label = this._createVertexLabel(vertNames[i]);
        label.position.copy(local3D[i]);
        faceGroup.add(label);
      }

      faceGroup.userData = {
        faceName,
        center3D: center3D.clone(),
        center2D,
        local3D,
        local2D,
      };

      this.unfoldGroup.add(faceGroup);
    }

    this.unfoldGroup.userData = { progress: 0 };
    this.unfoldGroup.visible = false;
    this.scene.add(this.unfoldGroup);
  }

  /**
   * 构建面邻接图
   */
  _buildAdjacency(faces) {
    // 边 → 面列表
    const edgeToFaces = {};
    for (const [faceName, vertNames] of Object.entries(faces)) {
      for (let i = 0; i < vertNames.length; i++) {
        const a = vertNames[i];
        const b = vertNames[(i + 1) % vertNames.length];
        const key = [a, b].sort().join('-');
        if (!edgeToFaces[key]) edgeToFaces[key] = [];
        edgeToFaces[key].push({ face: faceName, edge: [a, b] });
      }
    }

    // 面 → 邻接面列表
    const adjacency = {};
    for (const [faceName] of Object.entries(faces)) {
      adjacency[faceName] = [];
    }
    for (const faces_of_edge of Object.values(edgeToFaces)) {
      if (faces_of_edge.length === 2) {
        const [a, b] = faces_of_edge;
        adjacency[a.face].push({ neighbor: b.face, edge: a.edge });
        adjacency[b.face].push({ neighbor: a.face, edge: b.edge });
      }
    }
    return adjacency;
  }

  /**
   * 选择根面：法线 Y 分量最负（最朝下）
   */
  _selectRootFace(faces, faceNormals) {
    let bestFace = Object.keys(faces)[0];
    let bestDot = Infinity;
    for (const [name, normal] of Object.entries(faceNormals)) {
      const dot = normal.dot(new THREE.Vector3(0, -1, 0));
      if (dot < bestDot) {
        bestDot = dot;
        bestFace = name;
      }
    }
    return bestFace;
  }

  /**
   * BFS 计算每个面在 2D 平面上的目标位置
   */
  _computeNetPositions(rootFace, faces, verts3D, faceNormals, faceCenters, adjacency) {
    const result = {};

    // 根面：直接投影到 XZ 平面（Y=0），保持原始朝向
    const rootVerts = faces[rootFace].map(n => verts3D[n]);
    const rootCenter = faceCenters[rootFace].clone();
    const root2DVerts = rootVerts.map(v => new THREE.Vector3(v.x, 0, v.z));
    const rootCenter2D = new THREE.Vector3(rootCenter.x, 0, rootCenter.z);

    result[rootFace] = {
      vertices: root2DVerts,
      center: rootCenter2D,
      rotation: new THREE.Quaternion(), // 单位四元数，无旋转
    };

    // BFS 展开
    const visited = new Set([rootFace]);
    const queue = [rootFace];

    while (queue.length > 0) {
      const currentFace = queue.shift();
      const neighbors = adjacency[currentFace] || [];

      for (const { neighbor, edge } of neighbors) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);

        // 展开邻接面
        const netPos = this._unfoldAdjacentFace(
          currentFace, neighbor, edge, faces, verts3D, faceNormals, faceCenters, result
        );
        if (netPos) {
          result[neighbor] = netPos;
        }
      }
    }

    return result;
  }

  /**
   * 将邻接面展开到父面旁边
   * 使用绕共享边旋转的正确几何算法
   */
  _unfoldAdjacentFace(parentFace, adjFace, sharedEdge, faces, verts3D, faceNormals, faceCenters, result) {
    const parentNet = result[parentFace];
    if (!parentNet) return null;

    const parentVertNames = faces[parentFace];
    const adjVertNames = faces[adjFace];

    // 共享边在父面中的索引
    const sharedIndicesInParent = sharedEdge.map(se => parentVertNames.indexOf(se));
    if (sharedIndicesInParent.includes(-1)) return null;

    // 父面的 2D 网格中共享边的位置
    const parentV0_2D = parentNet.vertices[sharedIndicesInParent[0]];
    const parentV1_2D = parentNet.vertices[sharedIndicesInParent[1]];

    // 共享边在 3D 中的位置
    const edge3D_0 = verts3D[sharedEdge[0]];
    const edge3D_1 = verts3D[sharedEdge[1]];
    const edgeDir3D = edge3D_1.clone().sub(edge3D_0).normalize();
    const edgeLen3D = edge3D_1.distanceTo(edge3D_0);

    // 共享边中点
    const edgeMid3D = edge3D_0.clone().add(edge3D_1).multiplyScalar(0.5);

    // 计算各面相对于共享边的外侧方向（从边中点指向面中心，去除沿边分量）
    const parentCenter3D = faceCenters[parentFace];
    const adjCenter3D = faceCenters[adjFace];

    const toParent3D = parentCenter3D.clone().sub(edgeMid3D);
    const parentAlongEdge3D = edgeDir3D.clone().multiplyScalar(toParent3D.dot(edgeDir3D));
    const parentOutDir3D = toParent3D.clone().sub(parentAlongEdge3D);
    const parentOutLen3D = parentOutDir3D.length();

    const toAdj3D = adjCenter3D.clone().sub(edgeMid3D);
    const adjAlongEdge3D = edgeDir3D.clone().multiplyScalar(toAdj3D.dot(edgeDir3D));
    const adjOutDir3D = toAdj3D.clone().sub(adjAlongEdge3D);
    const adjOutLen3D = adjOutDir3D.length();

    // 计算二面角：使用外侧方向的夹角（不依赖法线，避免绕序不一致问题）
    // dihedral = pi - angle_between_outward_directions
    let dihedralAngle = Math.PI / 2; // 默认值
    if (parentOutLen3D > 0.001 && adjOutLen3D > 0.001) {
      const cosAngle = parentOutDir3D.dot(adjOutDir3D) / (parentOutLen3D * adjOutLen3D);
      dihedralAngle = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    }

    // 2D 中共享边的位置和方向
    const edgeMid2D = parentV0_2D.clone().add(parentV1_2D).multiplyScalar(0.5);
    const edgeDir2D = parentV1_2D.clone().sub(parentV0_2D).normalize();

    // 2D 中边的缩放比例
    const edgeLen2D = parentV1_2D.distanceTo(parentV0_2D);
    const scale = edgeLen3D > 0.001 ? edgeLen2D / edgeLen3D : 1;

    // 展开方向：使用叉积 edgeDir3D × parentNormal3D
    // 边总是在父面平面内，叉积必然垂直于边且位于父面平面内
    const parentNormal3D = faceNormals[faces[parentFace]] || new THREE.Vector3(0, 1, 0);
    const outDirRaw = edgeDir3D.clone().cross(parentNormal3D);

    // 确保方向远离父面中心（指向子面展开的方向）
    const toParentDir = parentCenter3D.clone().sub(edgeMid3D);
    if (outDirRaw.dot(toParentDir) > 0) {
      outDirRaw.negate();
    }

    // 归一化外侧方向（供后续 perpDist 计算使用）
    const parentOutDirNorm3D = outDirRaw.length() > 0.001
      ? outDirRaw.clone().normalize()
      : new THREE.Vector3(0, 1, 0);

    // 垂直边标记（仅用于顶点坐标计算）
    const isVerticalEdge = edgeDir2D.length() < 0.001;

    // 为每个邻接面顶点计算 2D 位置
    const adj2DVerts = adjVertNames.map(vName => {
      const v3D = verts3D[vName];

      // 相对于共享边起点的偏移
      const rel = v3D.clone().sub(edge3D_0);

      // 沿边方向分量
      const t = rel.dot(edgeDir3D);

      // 垂直于边的分量
      const perp = rel.clone().sub(edgeDir3D.clone().multiplyScalar(t));

      // perp 在父面外侧方向上的分量（带符号）
      const perpDist = perp.dot(parentOutDirNorm3D);

      // 计算与父面平面的垂直距离（使用叉积法，不依赖法线绕序）
      const perpHeight = perp.clone().sub(
        parentOutDirNorm3D.clone().multiplyScalar(perpDist)
      ).length();
      const perpFull = perp.clone();
      const perpInPlane = parentOutDirNorm3D.clone().multiplyScalar(perpDist);
      const heightVec = perpFull.clone().sub(perpInPlane);
      const adjRelCenter = adjCenter3D.clone().sub(edgeMid3D);
      const adjHeightSign = adjRelCenter.dot(heightVec) >= 0 ? 1 : -1;
      const signedPerpHeight = perpHeight * adjHeightSign;

      // 展开旋转：绕共享边旋转 dihedralAngle 角度
      const unfoldedDist = perpDist * Math.cos(dihedralAngle)
                         + signedPerpHeight * Math.sin(dihedralAngle);

      let v2D;
      if (isVerticalEdge) {
        // 垂直边：沿边方向使用 3D 边在 XZ 平面的投影，垂直方向使用 outDirRaw
        const edgeDirXZ = new THREE.Vector3(edgeDir3D.x, 0, edgeDir3D.z);
        const edgeDirXZNorm = edgeDirXZ.length() > 0.001
          ? edgeDirXZ.clone().normalize()
          : new THREE.Vector3(0, 0, 1);
        v2D = edgeMid2D.clone()
          .add(edgeDirXZNorm.clone().multiplyScalar(t * scale))
          .add(outDirRaw.clone().multiplyScalar(unfoldedDist * scale));
      } else {
        // 非垂直边：沿边方向使用 edgeDir2D，垂直方向使用 outDirRaw
        v2D = edgeMid2D.clone()
          .add(edgeDir2D.clone().multiplyScalar((t - edgeLen3D / 2) * scale))
          .add(outDirRaw.clone().multiplyScalar(unfoldedDist * scale));
      }

      return v2D;
    });

    // 计算 2D 中心
    const adjCenter2D = new THREE.Vector3();
    adj2DVerts.forEach(v => adjCenter2D.add(v));
    adjCenter2D.divideScalar(adj2DVerts.length);

    return {
      vertices: adj2DVerts,
      center: adjCenter2D,
    };
  }

  /**
   * 创建顶点标签
   */
  _createVertexLabel(name) {
    const div = document.createElement('div');
    div.className = 'vertex-label';
    div.textContent = name;
    Object.assign(div.style, {
      color: '#ffffff',
      fontSize: '11px',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(103,80,164,0.8)',
      pointerEvents: 'none',
      userSelect: 'none',
    });
    const label = new CSS2DObject(div);
    return label;
  }

  /**
   * 曲面体近似展开（圆柱/圆锥）
   * 圆柱：侧面展开为矩形，上下底为圆
   * 圆锥：侧面展开为扇形，底面为圆
   */
  _createCurvedUnfold(config) {
    const params = config.defaultParams || {};
    const color = new THREE.Color(config.color || '#6750A4');
    this.unfoldGroup = new THREE.Group();
    this.unfoldGroup.name = 'unfold';

    if (config.name === '圆柱') {
      this._unfoldCylinder(params, color);
    } else if (config.name === '圆锥') {
      this._unfoldCone(params, color);
    } else {
      // 球等其他曲面体暂不支持
      return;
    }

    this.unfoldGroup.userData = { progress: 0 };
    this.unfoldGroup.visible = false;
    this.scene.add(this.unfoldGroup);
  }

  /** 圆柱展开：侧面→矩形，两底→圆 */
  _unfoldCylinder(params, color) {
    const r = params.radius || 1;
    const h = params.height || 2;
    const seg = 48;

    // 侧面展开：矩形 宽=2πr, 高=h
    const sideWidth = 2 * Math.PI * r;
    const sideCenter2D = new THREE.Vector3(0, 0, 0);
    const sideCenter3D = new THREE.Vector3(0, 0, 0);

    const sideVerts3D = [];
    const sideVerts2D = [];
    for (let i = 0; i < seg; i++) {
      const angle = (i / seg) * Math.PI * 2;
      const x3 = r * Math.cos(angle);
      const z3 = r * Math.sin(angle);
      sideVerts3D.push(new THREE.Vector3(x3, -h / 2, z3));
      sideVerts3D.push(new THREE.Vector3(x3, h / 2, z3));

      const x2 = (i / seg) * sideWidth - sideWidth / 2;
      const x2next = ((i + 1) / seg) * sideWidth - sideWidth / 2;
      sideVerts2D.push(new THREE.Vector3(x2, 0, -h / 2));
      sideVerts2D.push(new THREE.Vector3(x2, 0, h / 2));
    }

    this._addCurvedFace(sideVerts3D, sideVerts2D, sideCenter3D, sideCenter2D, color, seg * 2);

    // 底面圆：放置在侧面下方
    const circleOffset = h / 2 + r + 0.3;
    this._addCircleFace(r, seg, new THREE.Vector3(0, 0, circleOffset), new THREE.Vector3(0, -h / 2, 0), color, -1);
    this._addCircleFace(r, seg, new THREE.Vector3(0, 0, -circleOffset), new THREE.Vector3(0, h / 2, 0), color, 1);
  }

  /** 圆锥展开：侧面→扇形，底→圆 */
  _unfoldCone(params, color) {
    const r = params.radius || 1;
    const h = params.height || 2;
    const seg = 48;
    const slant = Math.sqrt(r * r + h * h);
    const sectorAngle = (2 * Math.PI * r) / slant; // 扇形张角

    // 侧面展开：扇形 顶点在原点
    const apex3D = new THREE.Vector3(0, h / 2, 0);
    const apex2D = new THREE.Vector3(0, 0, 0);

    const sideVerts3D = [];
    const sideVerts2D = [];
    for (let i = 0; i < seg; i++) {
      const a3 = (i / seg) * Math.PI * 2;
      const x3 = r * Math.cos(a3);
      const z3 = r * Math.sin(a3);
      sideVerts3D.push(new THREE.Vector3(x3, -h / 2, z3));

      const a2 = (i / seg) * sectorAngle - sectorAngle / 2;
      sideVerts2D.push(new THREE.Vector3(slant * Math.sin(a2), 0, slant * Math.cos(a2)));
    }

    // 三角形条带：apex → 每对相邻底边顶点
    const fanVerts3D = [];
    const fanVerts2D = [];
    for (let i = 0; i < seg; i++) {
      const next = (i + 1) % seg;
      fanVerts3D.push(apex3D.clone(), sideVerts3D[i].clone(), sideVerts3D[next].clone());
      fanVerts2D.push(apex2D.clone(), sideVerts2D[i].clone(), sideVerts2D[next].clone());
    }

    this._addCurvedFace(fanVerts3D, fanVerts2D, apex3D.clone(), apex2D.clone(), color, fanVerts3D.length);

    // 底面圆：放置在扇形下方
    const circleOffset = slant + r + 0.3;
    this._addCircleFace(r, seg, new THREE.Vector3(0, 0, circleOffset), new THREE.Vector3(0, -h / 2, 0), color, -1);
  }

  /** 添加曲面展开的一个面（三角形条带） */
  _addCurvedFace(verts3D, verts2D, center3D, center2D, color, count) {
    const local3D = verts3D.map(v => v.clone().sub(center3D));
    const local2D = verts2D.map(v => v.clone().sub(center2D));

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    local3D.forEach((v, i) => {
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const indices = [];
    for (let i = 0; i < count; i += 3) indices.push(i, i + 1, i + 2);
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const faceGroup = new THREE.Group();
    faceGroup.position.copy(center3D);
    faceGroup.add(new THREE.Mesh(geom, mat));

    // 边线
    const edgePts = [];
    for (let i = 0; i < count; i += 3) {
      edgePts.push(local3D[i], local3D[i + 1]);
      edgePts.push(local3D[i + 1], local3D[i + 2]);
      edgePts.push(local3D[i + 2], local3D[i]);
    }
    const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePts);
    faceGroup.add(new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0x222222 })));

    faceGroup.userData = {
      faceName: 'curved',
      center3D: center3D.clone(),
      center2D: center2D.clone(),
      local3D,
      local2D,
    };

    this.unfoldGroup.add(faceGroup);
  }

  /** 添加圆形底面（用正多边形近似） */
  _addCircleFace(r, seg, pos2D, pos3D, color, normalSign) {
    const verts3D = [];
    const verts2D = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      verts3D.push(new THREE.Vector3(r * Math.cos(a), pos3D.y, r * Math.sin(a)));
      // 2D 中展开为平面上的圆
      verts2D.push(new THREE.Vector3(r * Math.cos(a) + pos2D.x, 0, r * Math.sin(a) + pos2D.z));
    }

    const center3D = pos3D.clone();
    const center2D = new THREE.Vector3(pos2D.x, 0, pos2D.z);
    const local3D = verts3D.map(v => v.clone().sub(center3D));
    const local2D = verts2D.map(v => v.clone().sub(center2D));

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(seg * 3);
    local3D.forEach((v, i) => {
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const indices = [];
    for (let i = 1; i < seg - 1; i++) indices.push(0, i, i + 1);
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const faceGroup = new THREE.Group();
    faceGroup.position.copy(center3D);
    faceGroup.add(new THREE.Mesh(geom, mat));

    // 边线
    const edgePts = [];
    for (let i = 0; i < seg; i++) edgePts.push(local3D[i], local3D[(i + 1) % seg]);
    const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePts);
    faceGroup.add(new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0x222222 })));

    faceGroup.userData = {
      faceName: 'circle',
      center3D: center3D.clone(),
      center2D: center2D.clone(),
      local3D,
      local2D,
    };

    this.unfoldGroup.add(faceGroup);
  }

  /**
   * 清理展开组
   */
  clear() {
    if (this.unfoldGroup) {
      this.unfoldGroup.traverse(child => {
        if (child.isCSS2DObject && child.element && child.element.parentNode) {
          child.element.parentNode.removeChild(child.element);
        }
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.scene.remove(this.unfoldGroup);
      this.unfoldGroup = null;
    }
    this.isUnfolded = false;
    this.progress = 0;
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }
  }

  /**
   * 播放展开/折叠动画
   */
  animate(target) {
    if (!this.unfoldGroup) return;

    if (this.animation) {
      this.animation.kill();
    }

    const baseDuration = 1.2;
    const duration = baseDuration / (this.animationSpeed || 1);
    const ease = 'power2.inOut';

    if (target === 1) {
      this.unfoldGroup.visible = true;
      this.isUnfolded = true;

      this.animation = gsap.to(this, {
        progress: 1,
        duration,
        ease,
        onUpdate: () => this._updateFaces(),
      });
    } else {
      this.isUnfolded = false;

      this.animation = gsap.to(this, {
        progress: 0,
        duration,
        ease,
        onUpdate: () => this._updateFaces(),
        onComplete: () => {
          if (this.unfoldGroup) this.unfoldGroup.visible = false;
        },
      });
    }
  }

  /**
   * 设置进度（滑块控制）
   */
  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    if (this.unfoldGroup) {
      this.unfoldGroup.visible = this.progress > 0;
      this.isUnfolded = this.progress > 0.5;
      this._updateFaces();
    }
  }

  /**
   * 根据 progress 更新所有面的位置和旋转
   * progress=0: 3D 原始位置
   * progress=1: 2D 展开位置
   */
  _updateFaces() {
    if (!this.unfoldGroup) return;

    const t = this.progress;

    this.unfoldGroup.children.forEach(faceGroup => {
      const ud = faceGroup.userData;
      if (!ud.center3D) return;

      // 插值中心位置
      const pos = ud.center3D.clone().lerp(ud.center2D, t);
      faceGroup.position.copy(pos);

      // 插值每个子对象的局部位置
      const local3D = ud.local3D;
      const local2D = ud.local2D;
      if (!local3D || !local2D) return;

      let vertIdx = 0;
      faceGroup.children.forEach(child => {
        if (child.isMesh) {
          // 更新面几何体顶点（顶点数 = local3D.length）
          const positions = child.geometry.attributes.position.array;
          const count = Math.min(positions.length / 3, local3D.length);
          for (let i = 0; i < count; i++) {
            const p = local3D[i].clone().lerp(local2D[i], t);
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
          }
          child.geometry.attributes.position.needsUpdate = true;
        } else if (child.isLineSegments) {
          // 更新边几何体顶点（每个边段2个端点，共 2*local3D.length 个顶点）
          const positions = child.geometry.attributes.position.array;
          for (let i = 0; i < local3D.length; i++) {
            const p0 = local3D[i].clone().lerp(local2D[i], t);
            const p1 = local3D[(i + 1) % local3D.length].clone().lerp(local2D[(i + 1) % local3D.length], t);
            const idx = i * 6; // 每段6个float（2个顶点各3分量）
            positions[idx] = p0.x;
            positions[idx + 1] = p0.y;
            positions[idx + 2] = p0.z;
            positions[idx + 3] = p1.x;
            positions[idx + 4] = p1.y;
            positions[idx + 5] = p1.z;
          }
          child.geometry.attributes.position.needsUpdate = true;
        } else if (child.isCSS2DObject) {
          // 顶点标签
          if (vertIdx < local3D.length) {
            const p = local3D[vertIdx].clone().lerp(local2D[vertIdx], t);
            child.position.copy(p);
          }
          vertIdx++;
        }
      });

      // 面透明度
      faceGroup.children.forEach(child => {
        if (child.isMesh && child.material) {
          child.material.opacity = 0.3 + t * 0.4;
        }
      });
    });
  }
}
