/**
 * 几何体缩略图生成器
 * 使用 Canvas 2D 绘制几何体预览图
 */

/**
 * 绘制正方体缩略图
 */
function drawCube(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.3;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  // 前面
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.rect(cx - s, cy - s, s * 2, s * 2);
  ctx.fill();
  ctx.stroke();
  // 上面
  ctx.fillStyle = 'rgba(108,142,191,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx - s + s * 0.5, cy - s - s * 0.5);
  ctx.lineTo(cx + s + s * 0.5, cy - s - s * 0.5);
  ctx.lineTo(cx + s, cy - s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 右面
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx + s, cy - s);
  ctx.lineTo(cx + s + s * 0.5, cy - s - s * 0.5);
  ctx.lineTo(cx + s + s * 0.5, cy + s - s * 0.5);
  ctx.lineTo(cx + s, cy + s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制长方体缩略图
 */
function drawRectangularBox(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const sx = Math.min(w, h) * 0.35;
  const sy = Math.min(w, h) * 0.25;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.rect(cx - sx, cy - sy, sx * 2, sy * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx - sx, cy - sy);
  ctx.lineTo(cx - sx + sx * 0.4, cy - sy - sy * 0.5);
  ctx.lineTo(cx + sx + sx * 0.4, cy - sy - sy * 0.5);
  ctx.lineTo(cx + sx, cy - sy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx + sx, cy - sy);
  ctx.lineTo(cx + sx + sx * 0.4, cy - sy - sy * 0.5);
  ctx.lineTo(cx + sx + sx * 0.4, cy + sy - sy * 0.5);
  ctx.lineTo(cx + sx, cy + sy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制三棱柱缩略图
 */
function drawTriangularPrism(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.3;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx - s, cy + s * 0.7);
  ctx.lineTo(cx + s, cy + s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx + s, cy + s * 0.7);
  ctx.lineTo(cx + s + s * 0.5, cy + s * 0.7 - s * 0.3);
  ctx.lineTo(cx + s * 0.5, cy - s - s * 0.3);
  ctx.lineTo(cx, cy - s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制四面体缩略图
 */
function drawTetrahedron(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.35;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.7);
  ctx.lineTo(cx - s, cy + s);
  ctx.lineTo(cx + s, cy + s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.8);
  ctx.lineTo(cx - s, cy + s);
  ctx.lineTo(cx, cy + s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.8);
  ctx.lineTo(cx + s, cy + s);
  ctx.lineTo(cx, cy + s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制四棱锥缩略图
 */
function drawSquarePyramid(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.3;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.rect(cx - s, cy + s * 0.3, s * 2, s * 1.2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx - s, cy + s * 0.3);
  ctx.lineTo(cx + s, cy + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制六棱柱缩略图
 */
function drawHexagonalPrism(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.28;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制圆柱缩略图
 */
function drawCylinder(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const rx = Math.min(w, h) * 0.3;
  const ry = rx * 0.3;
  const height = Math.min(w, h) * 0.5;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx - rx, cy - height / 2 + ry);
  ctx.lineTo(cx - rx, cy + height / 2 - ry);
  ctx.ellipse(cx, cy + height / 2 - ry, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, cy - height / 2 + ry);
  ctx.ellipse(cx, cy - height / 2 + ry, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy - height / 2 + ry, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制圆锥缩略图
 */
function drawCone(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const rx = Math.min(w, h) * 0.35;
  const ry = rx * 0.3;
  const height = Math.min(w, h) * 0.5;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + height / 2 - ry, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - height / 2);
  ctx.lineTo(cx - rx, cy + height / 2 - ry);
  ctx.ellipse(cx, cy + height / 2 - ry, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * 绘制球体缩略图
 */
function drawSphere(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.35;
  ctx.strokeStyle = '#6c8ebf';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(108,142,191,0.15)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.3, r, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * 缩略图绘制函数映射
 */
const DRAW_FUNCTIONS = {
  cube: drawCube,
  rectangularBox: drawRectangularBox,
  triangularPrism: drawTriangularPrism,
  tetrahedron: drawTetrahedron,
  squarePyramid: drawSquarePyramid,
  hexagonalPrism: drawHexagonalPrism,
  triangularPyramid: drawTetrahedron,
  cylinder: drawCylinder,
  cone: drawCone,
  sphere: drawSphere
};

/**
 * 为所有几何体卡片生成缩略图
 */
export function generateGeometryThumbnails() {
  document.querySelectorAll('.geometry-card').forEach(card => {
    const type = card.dataset.type;
    const thumbnailEl = card.querySelector('.geometry-thumbnail');
    if (!type || !thumbnailEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 80, 80);

    const drawFn = DRAW_FUNCTIONS[type];
    if (drawFn) {
      drawFn(ctx, 80, 80);
    }

    thumbnailEl.style.backgroundImage = `url(${canvas.toDataURL()})`;
    thumbnailEl.style.backgroundSize = 'contain';
    thumbnailEl.style.backgroundRepeat = 'no-repeat';
    thumbnailEl.style.backgroundPosition = 'center';
  });
}
