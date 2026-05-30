// ========================
// 信息卡片管理器
// ========================
import { GEOMETRY_CONFIGS } from '../geometry/configs.js';

export class InfoCardManager {
    constructor() {
        this.elements = {};
        this.init();
    }

    // ========================
    // 初始化
    // ========================
    init() {
        this.cacheElements();
    }

    // ========================
    // 缓存DOM元素
    // ========================
    cacheElements() {
        this.elements = {
            geometryName: document.getElementById('geometryName'),
            geometryDescription: document.getElementById('geometryDescription'),
            faceCount: document.getElementById('faceCount'),
            edgeCount: document.getElementById('edgeCount'),
            vertexCount: document.getElementById('vertexCount'),
            unfoldSteps: document.getElementById('unfoldSteps'),
            geometryInfoCard: document.getElementById('geometryInfoCard')
        };
    }

    // ========================
    // 更新几何体信息
    // ========================
    updateGeometryInfo(geometryType) {
        const config = GEOMETRY_CONFIGS[geometryType];
        if (!config) return;

        const stats = this.calculateStats(geometryType, config);

        // 更新名称
        if (this.elements.geometryName) {
            this.elements.geometryName.textContent = stats.name;
        }

        // 更新描述
        if (this.elements.geometryDescription) {
            this.elements.geometryDescription.textContent = stats.description;
        }

        // 更新统计数据
        if (this.elements.faceCount) {
            this.elements.faceCount.textContent = stats.faceCount;
        }
        if (this.elements.edgeCount) {
            this.elements.edgeCount.textContent = stats.edgeCount;
        }
        if (this.elements.vertexCount) {
            this.elements.vertexCount.textContent = stats.vertexCount;
        }
        if (this.elements.unfoldSteps) {
            this.elements.unfoldSteps.textContent = stats.unfoldSteps;
        }
    }

    // ========================
    // 计算统计数据
    // ========================
    calculateStats(geometryType, config) {
        const stats = {
            name: config.name || geometryType,
            description: this.getDescription(geometryType),
            faceCount: Object.keys(config.faces).length,
            edgeCount: config.edges.length,
            vertexCount: Object.keys(config.vertices).length,
            unfoldSteps: this.calculateUnfoldSteps(config)
        };

        return stats;
    }

    // ========================
    // 获取几何体描述
    // ========================
    getDescription(geometryType) {
        const descriptions = {
            cube: '六个完全相同的正方形面组成的正多面体',
            triangularPrism: '两个平行的三角形底面和三个矩形侧面',
            squarePyramid: '正方形底面和四个三角形侧面组成的棱锥',
            tetrahedron: '四个全等的等边三角形面组成的正多面体',
            rectangularBox: '六个矩形面组成的长方体',
            hexagonalPrism: '两个平行的六边形底面和六个矩形侧面',
            triangularPyramid: '三角形底面和三个三角形侧面组成的棱锥',
            pentagonalPyramid: '五边形底面和五个三角形侧面组成的棱锥',
            irregularBox: '不规则六面体',
            truncatedPyramid: '棱锥被平行于底面的平面截断后的几何体',
            octahedron: '八个全等的等边三角形面组成的正多面体'
        };
        return descriptions[geometryType] || '';
    }

    // ========================
    // 计算展开步骤数
    // ========================
    calculateUnfoldSteps(config) {
        if (!config.unfoldConfig || !config.unfoldConfig.pivots) {
            return Object.keys(config.faces).length;
        }
        return Object.keys(config.unfoldConfig.pivots).length + 1;
    }

    // ========================
    // 更新展开信息
    // ========================
    updateUnfoldInfo(progress, isPlaying) {
        const unfoldInfo = document.getElementById('unfoldInfo');
        if (unfoldInfo) {
            const percent = Math.round(progress * 100);
            unfoldInfo.textContent = `展开进度: ${percent}%`;
        }
    }

    // ========================
    // 更新截面信息
    // ========================
    updateSectionInfo(pointCount, hasSection) {
        const sectionInfo = document.getElementById('sectionInfo');
        if (sectionInfo) {
            if (hasSection) {
                sectionInfo.textContent = `已创建截面 (${pointCount}点)`;
            } else if (pointCount > 0) {
                sectionInfo.textContent = `已选择 ${pointCount} 个点`;
            } else {
                sectionInfo.textContent = '点击几何体表面放置截面点';
            }
        }
    }

    // ========================
    // 显示/隐藏卡片
    // ========================
    show() {
        if (this.elements.geometryInfoCard) {
            this.elements.geometryInfoCard.style.display = 'block';
        }
    }

    hide() {
        if (this.elements.geometryInfoCard) {
            this.elements.geometryInfoCard.style.display = 'none';
        }
    }

    // ========================
    // 高亮显示变化的数字
    // ========================
    animateValueChange(element, newValue) {
        if (!element) return;

        const oldValue = element.textContent;
        if (oldValue !== String(newValue)) {
            element.textContent = newValue;
            element.classList.add('value-changed');
            setTimeout(() => {
                element.classList.remove('value-changed');
            }, 300);
        }
    }
}
