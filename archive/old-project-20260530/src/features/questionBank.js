/**
 * 高考立体几何题库系统
 * 包含填空题、选择题、证明题、计算题的模板
 */

// 数学工具函数
const MathUtils = {
    // 生成指定范围内的随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 生成指定范围内的随机小数（保留指定位数）
    randomFloat(min, max, decimals = 2) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
    },

    // 生成随机的简洁边长（1-10的整数或简单小数）
    randomSide() {
        const options = [1, 2, 3, 4, 5, 6, 8, 10, 1.5, 2.5, 3.5];
        return options[Math.floor(Math.random() * options.length)];
    },

    // 计算正方体体积
    cubeVolume(a) {
        return a * a * a;
    },

    // 计算正方体表面积
    cubeSurfaceArea(a) {
        return 6 * a * a;
    },

    // 计算正方体体对角线
    cubeDiagonal(a) {
        return a * Math.sqrt(3);
    },

    // 计算正方体面对角线
    cubeFaceDiagonal(a) {
        return a * Math.sqrt(2);
    },

    // 计算长方体体积
    cuboidVolume(a, b, c) {
        return a * b * c;
    },

    // 计算长方体表面积
    cuboidSurfaceArea(a, b, c) {
        return 2 * (a * b + b * c + a * c);
    },

    // 计算长方体体对角线
    cuboidDiagonal(a, b, c) {
        return Math.sqrt(a * a + b * b + c * c);
    },

    // 计算圆柱体积
    cylinderVolume(r, h) {
        return Math.PI * r * r * h;
    },

    // 计算圆柱侧面积
    cylinderLateralArea(r, h) {
        return 2 * Math.PI * r * h;
    },

    // 计算圆柱表面积
    cylinderSurfaceArea(r, h) {
        return 2 * Math.PI * r * (r + h);
    },

    // 计算圆锥体积
    coneVolume(r, h) {
        return Math.PI * r * r * h / 3;
    },

    // 计算圆锥侧面积
    coneLateralArea(r, l) {
        return Math.PI * r * l;
    },

    // 计算圆锥母线长
    coneSlantHeight(r, h) {
        return Math.sqrt(r * r + h * h);
    },

    // 计算球体积
    sphereVolume(r) {
        return 4 * Math.PI * r * r * r / 3;
    },

    // 计算球表面积
    sphereSurfaceArea(r) {
        return 4 * Math.PI * r * r;
    },

    // 计算正棱柱体积
    regularPrismVolume(baseArea, h) {
        return baseArea * h;
    },

    // 计算正三棱柱底面积（正三角形）
    equilateralTriangleArea(a) {
        return Math.sqrt(3) * a * a / 4;
    },

    // 计算正四棱柱底面积（正方形）
    squareArea(a) {
        return a * a;
    },

    // 计算正六棱柱底面积（正六边形）
    regularHexagonArea(a) {
        return 3 * Math.sqrt(3) * a * a / 2;
    },

    // 计算正棱锥体积
    regularPyramidVolume(baseArea, h) {
        return baseArea * h / 3;
    },

    // 计算外接球半径（正方体）
    cubeCircumscribedSphere(a) {
        return a * Math.sqrt(3) / 2;
    },

    // 计算内切球半径（正方体）
    cubeInscribedSphere(a) {
        return a / 2;
    },

    // 计算外接球半径（长方体）
    cuboidCircumscribedSphere(a, b, c) {
        return Math.sqrt(a * a + b * b + c * c) / 2;
    },

    // 计算正四面体外接球半径
    tetrahedronCircumscribedSphere(a) {
        return a * Math.sqrt(6) / 4;
    },

    // 计算正四面体内切球半径
    tetrahedronInscribedSphere(a) {
        return a * Math.sqrt(6) / 12;
    },

    // 格式化数字（保留合理精度）
    formatNumber(num) {
        if (Number.isInteger(num)) return num.toString();
        if (Math.abs(num - Math.round(num)) < 0.001) return Math.round(num).toString();
        return parseFloat(num.toFixed(2)).toString();
    },

    // 格式化带π的数
    formatWithPi(num) {
        const piFactor = num / Math.PI;
        if (Math.abs(piFactor - Math.round(piFactor)) < 0.001) {
            const coeff = Math.round(piFactor);
            if (coeff === 1) return 'π';
            if (coeff === -1) return '-π';
            return coeff + 'π';
        }
        return this.formatNumber(num);
    },

    // 格式化带根号的数
    formatWithSqrt(num) {
        for (let i = 2; i <= 20; i++) {
            const sqrtVal = Math.sqrt(i);
            if (Math.abs(num - sqrtVal) < 0.001) {
                return `√${i}`;
            }
            for (let j = 2; j <= 10; j++) {
                if (Math.abs(num - j * sqrtVal) < 0.001) {
                    return `${j}√${i}`;
                }
            }
        }
        return this.formatNumber(num);
    }
};

/**
 * 填空题模板库
 */
const FillQuestionTemplates = {
    // 正方体填空题
    cube: [
        {
            template: '已知正方体的棱长为{a}，则其体积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                return {
                    params: { a },
                    answer: MathUtils.formatNumber(MathUtils.cubeVolume(a)),
                    solution: `正方体体积公式：V = a³\nV = ${a}³ = ${MathUtils.formatNumber(MathUtils.cubeVolume(a))}`
                };
            }
        },
        {
            template: '已知正方体的棱长为{a}，则其表面积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                return {
                    params: { a },
                    answer: MathUtils.formatNumber(MathUtils.cubeSurfaceArea(a)),
                    solution: `正方体表面积公式：S = 6a²\nS = 6 × ${a}² = ${MathUtils.formatNumber(MathUtils.cubeSurfaceArea(a))}`
                };
            }
        },
        {
            template: '已知正方体的棱长为{a}，则其体对角线长为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const diagonal = MathUtils.cubeDiagonal(a);
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(diagonal),
                    solution: `正方体体对角线公式：d = √3 × a\nd = √3 × ${a} = ${MathUtils.formatWithSqrt(diagonal)}`
                };
            }
        },
        {
            template: '已知正方体的棱长为{a}，则其面对角线长为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const diagonal = MathUtils.cubeFaceDiagonal(a);
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(diagonal),
                    solution: `正方体面对角线公式：d = √2 × a\nd = √2 × ${a} = ${MathUtils.formatWithSqrt(diagonal)}`
                };
            }
        },
        {
            template: '已知正方体的棱长为{a}，则其外接球的半径为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const r = MathUtils.cubeCircumscribedSphere(a);
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(r),
                    solution: `正方体外接球半径公式：R = (√3/2) × a\nR = (√3/2) × ${a} = ${MathUtils.formatWithSqrt(r)}`
                };
            }
        },
        {
            template: '已知正方体的棱长为{a}，则其内切球的半径为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const r = MathUtils.cubeInscribedSphere(a);
                return {
                    params: { a },
                    answer: MathUtils.formatNumber(r),
                    solution: `正方体内切球半径公式：r = a/2\nr = ${a}/2 = ${MathUtils.formatNumber(r)}`
                };
            }
        }
    ],

    // 长方体填空题
    rectangularBox: [
        {
            template: '已知长方体的长、宽、高分别为{a}、{b}、{c}，则其体积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const b = MathUtils.randomSide();
                const c = MathUtils.randomSide();
                return {
                    params: { a, b, c },
                    answer: MathUtils.formatNumber(MathUtils.cuboidVolume(a, b, c)),
                    solution: `长方体体积公式：V = abc\nV = ${a} × ${b} × ${c} = ${MathUtils.formatNumber(MathUtils.cuboidVolume(a, b, c))}`
                };
            }
        },
        {
            template: '已知长方体的长、宽、高分别为{a}、{b}、{c}，则其体对角线长为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const b = MathUtils.randomSide();
                const c = MathUtils.randomSide();
                const diagonal = MathUtils.cuboidDiagonal(a, b, c);
                return {
                    params: { a, b, c },
                    answer: MathUtils.formatWithSqrt(diagonal),
                    solution: `长方体体对角线公式：d = √(a² + b² + c²)\nd = √(${a}² + ${b}² + ${c}²) = ${MathUtils.formatWithSqrt(diagonal)}`
                };
            }
        },
        {
            template: '已知长方体的长、宽、高分别为{a}、{b}、{c}，则其外接球的半径为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const b = MathUtils.randomSide();
                const c = MathUtils.randomSide();
                const r = MathUtils.cuboidCircumscribedSphere(a, b, c);
                return {
                    params: { a, b, c },
                    answer: MathUtils.formatWithSqrt(r),
                    solution: `长方体外接球半径公式：R = √(a² + b² + c²)/2\nR = √(${a}² + ${b}² + ${c}²)/2 = ${MathUtils.formatWithSqrt(r)}`
                };
            }
        }
    ],

    // 圆柱填空题
    cylinder: [
        {
            template: '已知圆柱的底面半径为{r}，高为{h}，则其体积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                const h = MathUtils.randomInt(2, 8);
                return {
                    params: { r, h },
                    answer: MathUtils.formatWithPi(MathUtils.cylinderVolume(r, h)),
                    solution: `圆柱体积公式：V = πr²h\nV = π × ${r}² × ${h} = ${MathUtils.formatWithPi(MathUtils.cylinderVolume(r, h))}`
                };
            }
        },
        {
            template: '已知圆柱的底面半径为{r}，高为{h}，则其侧面积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                const h = MathUtils.randomInt(2, 8);
                return {
                    params: { r, h },
                    answer: MathUtils.formatWithPi(MathUtils.cylinderLateralArea(r, h)),
                    solution: `圆柱侧面积公式：S = 2πrh\nS = 2π × ${r} × ${h} = ${MathUtils.formatWithPi(MathUtils.cylinderLateralArea(r, h))}`
                };
            }
        },
        {
            template: '已知圆柱的底面半径为{r}，高为{h}，则其全面积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                const h = MathUtils.randomInt(2, 8);
                return {
                    params: { r, h },
                    answer: MathUtils.formatWithPi(MathUtils.cylinderSurfaceArea(r, h)),
                    solution: `圆柱全面积公式：S = 2πr(r + h)\nS = 2π × ${r} × (${r} + ${h}) = ${MathUtils.formatWithPi(MathUtils.cylinderSurfaceArea(r, h))}`
                };
            }
        }
    ],

    // 圆锥填空题
    cone: [
        {
            template: '已知圆锥的底面半径为{r}，高为{h}，则其体积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                const h = MathUtils.randomInt(2, 8);
                return {
                    params: { r, h },
                    answer: MathUtils.formatWithPi(MathUtils.coneVolume(r, h)),
                    solution: `圆锥体积公式：V = (1/3)πr²h\nV = (1/3)π × ${r}² × ${h} = ${MathUtils.formatWithPi(MathUtils.coneVolume(r, h))}`
                };
            }
        },
        {
            template: '已知圆锥的底面半径为{r}，母线长为{l}，则其侧面积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 4);
                const l = MathUtils.randomInt(r + 1, r + 4);
                return {
                    params: { r, l },
                    answer: MathUtils.formatWithPi(MathUtils.coneLateralArea(r, l)),
                    solution: `圆锥侧面积公式：S = πrl\nS = π × ${r} × ${l} = ${MathUtils.formatWithPi(MathUtils.coneLateralArea(r, l))}`
                };
            }
        },
        {
            template: '已知圆锥的底面半径为{r}，高为{h}，则其母线长为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 4);
                const h = MathUtils.randomInt(2, 6);
                const l = MathUtils.coneSlantHeight(r, h);
                return {
                    params: { r, h },
                    answer: MathUtils.formatWithSqrt(l),
                    solution: `圆锥母线公式：l = √(r² + h²)\nl = √(${r}² + ${h}²) = ${MathUtils.formatWithSqrt(l)}`
                };
            }
        }
    ],

    // 球填空题
    sphere: [
        {
            template: '已知球的半径为{r}，则其体积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                return {
                    params: { r },
                    answer: MathUtils.formatWithPi(MathUtils.sphereVolume(r)),
                    solution: `球体积公式：V = (4/3)πr³\nV = (4/3)π × ${r}³ = ${MathUtils.formatWithPi(MathUtils.sphereVolume(r))}`
                };
            }
        },
        {
            template: '已知球的半径为{r}，则其表面积为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                return {
                    params: { r },
                    answer: MathUtils.formatWithPi(MathUtils.sphereSurfaceArea(r)),
                    solution: `球表面积公式：S = 4πr²\nS = 4π × ${r}² = ${MathUtils.formatWithPi(MathUtils.sphereSurfaceArea(r))}`
                };
            }
        },
        {
            template: '已知球的体积为{V}π，则其半径为______。',
            generate: () => {
                const r = MathUtils.randomInt(1, 5);
                const V = 4 * r * r * r / 3;
                return {
                    params: { V: MathUtils.formatNumber(V) },
                    answer: MathUtils.formatNumber(r),
                    solution: `由体积公式 V = (4/3)πr³\n得 r³ = 3V/(4π) = ${r}³\n所以 r = ${r}`
                };
            }
        }
    ],

    // 正三棱柱填空题
    hexagonalPrism: [
        {
            template: '已知正三棱柱的底面边长为{a}，高为{h}，则其体积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const h = MathUtils.randomInt(2, 8);
                const V = MathUtils.regularPrismVolume(MathUtils.equilateralTriangleArea(a), h);
                return {
                    params: { a, h },
                    answer: MathUtils.formatWithSqrt(V),
                    solution: `正三棱柱体积公式：V = (√3/4)a²h\nV = (√3/4) × ${a}² × ${h} = ${MathUtils.formatWithSqrt(V)}`
                };
            }
        },
        {
            template: '已知正三棱柱的底面边长为{a}，侧棱长为{l}，则其侧面积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const l = MathUtils.randomInt(2, 8);
                const S = 3 * a * l;
                return {
                    params: { a, l },
                    answer: MathUtils.formatNumber(S),
                    solution: `正三棱柱侧面积公式：S = 3al\nS = 3 × ${a} × ${l} = ${MathUtils.formatNumber(S)}`
                };
            }
        }
    ],

    // 正四棱锥填空题
    squarePyramid: [
        {
            template: '已知正四棱锥的底面边长为{a}，高为{h}，则其体积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const h = MathUtils.randomInt(2, 8);
                const V = MathUtils.regularPyramidVolume(MathUtils.squareArea(a), h);
                return {
                    params: { a, h },
                    answer: MathUtils.formatNumber(V),
                    solution: `正四棱锥体积公式：V = (1/3)a²h\nV = (1/3) × ${a}² × ${h} = ${MathUtils.formatNumber(V)}`
                };
            }
        },
        {
            template: '已知正四棱锥的底面边长为{a}，斜高为{h}，则其侧面积为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const h = MathUtils.randomInt(2, 6);
                const S = 2 * a * h;
                return {
                    params: { a, h },
                    answer: MathUtils.formatNumber(S),
                    solution: `正四棱锥侧面积公式：S = 2ah\nS = 2 × ${a} × ${h} = ${MathUtils.formatNumber(S)}`
                };
            }
        }
    ],

    // 正四面体填空题
    triangularPyramid: [
        {
            template: '已知正四面体的棱长为{a}，则其外接球半径为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const R = MathUtils.tetrahedronCircumscribedSphere(a);
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(R),
                    solution: `正四面体外接球半径公式：R = (√6/4)a\nR = (√6/4) × ${a} = ${MathUtils.formatWithSqrt(R)}`
                };
            }
        },
        {
            template: '已知正四面体的棱长为{a}，则其内切球半径为______。',
            generate: () => {
                const a = MathUtils.randomSide();
                const r = MathUtils.tetrahedronInscribedSphere(a);
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(r),
                    solution: `正四面体内切球半径公式：r = (√6/12)a\nr = (√6/12) × ${a} = ${MathUtils.formatWithSqrt(r)}`
                };
            }
        }
    ]
};

/**
 * 选择题模板库
 */
const ChoiceQuestionTemplates = {
    // 正方体选择题
    cube: [
        {
            template: '关于正方体，下列说法正确的是',
            options: [
                '正方体的任意两条棱都是异面直线',
                '正方体的任意两个面都是平行的',
                '正方体的体对角线与任意一条棱都不垂直',
                '正方体的体对角线与任意一个面都不垂直'
            ],
            answer: 3,
            solution: '正方体的体对角线与任意一个面都不垂直，这是正确的。其他选项都存在反例。'
        },
        {
            template: '已知正方体ABCD-A₁B₁C₁D₁，下列直线与AB₁垂直的是',
            options: ['BC', 'CC₁', 'A₁D', 'BD'],
            answer: 2,
            solution: 'A₁D与AB₁垂直，因为A₁D在平面ABCD上的投影是AD，而AD⊥AB。'
        },
        {
            template: '正方体的外接球与内切球的半径之比为',
            options: ['1:1', '√2:1', '√3:1', '2:1'],
            answer: 2,
            solution: '正方体外接球半径R = (√3/2)a，内切球半径r = a/2，所以R:r = √3:1。'
        }
    ],

    // 长方体选择题
    rectangularBox: [
        {
            template: '关于长方体，下列说法错误的是',
            options: [
                '长方体的任意两个面都是平行或垂直的',
                '长方体的体对角线与任意一条棱都不垂直',
                '长方体的任意一条棱都与4个面平行',
                '长方体的体对角线长度都相等'
            ],
            answer: 1,
            solution: '长方体的体对角线可能与某些棱垂直，当长方体有两个面是正方形时。'
        }
    ],

    // 圆柱选择题
    cylinder: [
        {
            template: '关于圆柱，下列说法正确的是',
            options: [
                '圆柱的任意两条母线都是平行的',
                '圆柱的母线与底面圆的直径不一定相等',
                '圆柱的侧面展开图一定是正方形',
                '圆柱的轴截面一定是正方形'
            ],
            answer: 0,
            solution: '圆柱的任意两条母线都是平行的，这是圆柱的定义性质。'
        }
    ],

    // 球选择题
    sphere: [
        {
            template: '关于球，下列说法错误的是',
            options: [
                '球的任意截面都是圆',
                '球的大圆是球的最大的截面',
                '球的表面积与体积之比等于半径的3倍',
                '球的内接长方体的体对角线等于球的直径'
            ],
            answer: 2,
            solution: '球的表面积S = 4πr²，体积V = (4/3)πr³，S/V = 3/r，不是3倍。'
        }
    ],

    // 正棱锥选择题
    squarePyramid: [
        {
            template: '关于正四棱锥，下列说法正确的是',
            options: [
                '正四棱锥的侧面都是等腰三角形',
                '正四棱锥的侧棱都相等',
                '正四棱锥的底面是菱形',
                '正四棱锥的高一定等于侧棱长'
            ],
            answer: 1,
            solution: '正四棱锥的侧棱都相等，这是正棱锥的定义性质。'
        }
    ]
};

/**
 * 证明题模板库
 */
const ProofQuestionTemplates = {
    // 正方体证明题
    cube: [
        {
            template: '在正方体ABCD-A₁B₁C₁D₁中，证明：AC₁⊥BD',
            keyPoints: ['连接AC', '证明BD⊥平面ACC₁', '得出AC₁⊥BD'],
            solution: `证明：
1. 连接AC，在正方体中，AC是底面ABCD的对角线
2. 因为ABCD是正方形，所以AC⊥BD
3. 因为AA₁⊥平面ABCD，BD⊂平面ABCD
4. 所以AA₁⊥BD
5. 又AC∩AA₁=A，所以BD⊥平面ACC₁
6. 因为AC₁⊂平面ACC₁
7. 所以AC₁⊥BD`
        },
        {
            template: '在正方体ABCD-A₁B₁C₁D₁中，证明：平面AB₁D₁∥平面BC₁D',
            keyPoints: ['证明AB₁∥BC₁', '证明AD₁∥BD', '应用面面平行判定'],
            solution: `证明：
1. 因为AB∥C₁D₁且AB=C₁D₁，所以四边形ABC₁D₁是平行四边形
2. 所以AB₁∥BC₁
3. 同理可证AD₁∥BD
4. 因为AB₁∩AD₁=A，BC₁∩BD=B
5. 所以平面AB₁D₁∥平面BC₁D`
        }
    ],

    // 三棱锥证明题
    triangularPyramid: [
        {
            template: '在三棱锥P-ABC中，PA⊥平面ABC，AB⊥BC，证明：BC⊥平面PAB',
            keyPoints: ['应用线面垂直的判定', '证明BC⊥PA', '证明BC⊥AB'],
            solution: `证明：
1. 因为PA⊥平面ABC，BC⊂平面ABC
2. 所以PA⊥BC
3. 又已知AB⊥BC
4. 因为PA∩AB=A
5. 所以BC⊥平面PAB`
        }
    ],

    // 四棱锥证明题
    squarePyramid: [
        {
            template: '在正四棱锥P-ABCD中，O是底面中心，证明：PO⊥平面ABCD',
            keyPoints: ['利用正棱锥的性质', '证明PO⊥底面', '应用正棱锥定义'],
            solution: `证明：
1. 因为P-ABCD是正四棱锥
2. 所以顶点P在底面ABCD上的射影是底面正方形的中心O
3. 根据正棱锥的定义，顶点与底面中心的连线垂直于底面
4. 所以PO⊥平面ABCD`
        }
    ]
};

/**
 * 计算题模板库
 */
const CalculationQuestionTemplates = {
    // 正方体计算题
    cube: [
        {
            template: '已知正方体ABCD-A₁B₁C₁D₁的棱长为{a}，求二面角A-BD-C的大小。',
            generate: () => {
                const a = MathUtils.randomSide();
                return {
                    params: { a },
                    answer: '120°',
                    solution: `解：
1. 连接AC交BD于O，连接A₁O
2. 因为ABCD是正方形，所以AC⊥BD
3. 因为AA₁⊥平面ABCD，BD⊂平面ABCD
4. 所以AA₁⊥BD
5. 又AC∩AA₁=A，所以BD⊥平面ACC₁A₁
6. 所以BD⊥A₁O，BD⊥CO
7. 所以∠A₁OC是二面角A-BD-C的平面角
8. 在△A₁OC中，A₁O = CO = √2a/2，A₁C = √3a
9. 由余弦定理：cos∠A₁OC = (A₁O² + CO² - A₁C²)/(2×A₁O×CO)
10. 代入计算得cos∠A₁OC = -1/2
11. 所以∠A₁OC = 120°`
                };
            }
        },
        {
            template: '已知正方体ABCD-A₁B₁C₁D₁的棱长为{a}，求点B₁到平面A₁BD的距离。',
            generate: () => {
                const a = MathUtils.randomSide();
                const distance = a * Math.sqrt(3) / 3;
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(distance),
                    solution: `解：
1. 建立空间直角坐标系，以D为原点
2. D(0,0,0), A(a,0,0), B(a,a,0), A₁(a,0,a), B₁(a,a,a)
3. 向量DA₁ = (a,0,a), 向量DB = (a,a,0), 向量DB₁ = (a,a,a)
4. 设平面A₁BD的法向量n = (x,y,z)
5. 由n·DA₁ = 0得ax + az = 0
6. 由n·DB = 0得ax + ay = 0
7. 令x = 1，则y = -1，z = -1，所以n = (1,-1,-1)
8. 点B₁到平面A₁BD的距离d = |向量DB₁·n|/|n|
9. d = |a×1 + a×(-1) + a×(-1)|/√3 = a/√3 = √3a/3`
                };
            }
        }
    ],

    // 圆锥计算题
    cone: [
        {
            template: '已知圆锥的底面半径为{r}，母线长为{l}，求圆锥侧面展开图的圆心角。',
            generate: () => {
                const r = MathUtils.randomInt(1, 4);
                const l = MathUtils.randomInt(r + 1, r + 3);
                const angle = 360 * r / l;
                return {
                    params: { r, l },
                    answer: `${MathUtils.formatNumber(angle)}°`,
                    solution: `解：
1. 圆锥侧面展开图是扇形
2. 扇形的弧长等于底面圆的周长：l = 2πr
3. 扇形的半径等于母线长：R = l
4. 圆心角公式：θ = (弧长/半径) × (180/π)
5. θ = (2πr/l) × (180/π) = 360r/l
6. 代入数据：θ = 360 × ${r} / ${l} = ${MathUtils.formatNumber(angle)}°`
                };
            }
        }
    ],

    // 三棱锥计算题
    triangularPyramid: [
        {
            template: '已知正四面体的棱长为{a}，求其体积。',
            generate: () => {
                const a = MathUtils.randomSide();
                const V = Math.sqrt(2) * a * a * a / 12;
                return {
                    params: { a },
                    answer: MathUtils.formatWithSqrt(V),
                    solution: `解：
1. 正四面体是特殊的三棱锥
2. 底面是边长为a的正三角形，面积S = (√3/4)a²
3. 正四面体的高h = (√6/3)a
4. 体积公式：V = (1/3)Sh
5. V = (1/3) × (√3/4)a² × (√6/3)a
6. V = (√18/36)a³ = (√2/12)a³
7. 代入数据：V = (√2/12) × ${a}³ = ${MathUtils.formatWithSqrt(V)}`
                };
            }
        }
    ],

    // 球与几何体组合计算题
    sphere: [
        {
            template: '已知正方体的棱长为{a}，求其外接球的体积。',
            generate: () => {
                const a = MathUtils.randomSide();
                const R = MathUtils.cubeCircumscribedSphere(a);
                const V = MathUtils.sphereVolume(R);
                return {
                    params: { a },
                    answer: MathUtils.formatWithPi(V),
                    solution: `解：
1. 正方体的外接球直径等于正方体的体对角线
2. 正方体体对角线长：d = √3 × a
3. 外接球半径：R = d/2 = (√3/2) × a
4. 代入数据：R = (√3/2) × ${a} = ${MathUtils.formatWithSqrt(R)}
5. 球体积公式：V = (4/3)πR³
6. V = (4/3)π × [${MathUtils.formatWithSqrt(R)}]³
7. V = ${MathUtils.formatWithPi(V)}`
                };
            }
        }
    ]
};

/**
 * 题目生成器
 */
export class QuestionGenerator {
    constructor() {
        this.fillTemplates = FillQuestionTemplates;
        this.choiceTemplates = ChoiceQuestionTemplates;
        this.proofTemplates = ProofQuestionTemplates;
        this.calculationTemplates = CalculationQuestionTemplates;
    }

    /**
     * 生成填空题
     */
    generateFillQuestion(geometryType, difficulty) {
        const templates = this.fillTemplates[geometryType] || this.fillTemplates['cube'];
        const template = templates[Math.floor(Math.random() * templates.length)];
        const generated = template.generate();

        // 根据难度调整
        let questionText = template.template;
        for (const [key, value] of Object.entries(generated.params)) {
            questionText = questionText.replace(`{${key}}`, value);
        }

        return {
            question: questionText,
            answer: generated.answer,
            hint: '请根据几何体的参数进行计算',
            solution: generated.solution
        };
    }

    /**
     * 生成选择题
     */
    generateChoiceQuestion(geometryType, difficulty) {
        const templates = this.choiceTemplates[geometryType] || this.choiceTemplates['cube'];
        const template = templates[Math.floor(Math.random() * templates.length)];

        return {
            question: template.template,
            options: template.options,
            answer: template.answer,
            hint: '请仔细分析每个选项',
            solution: template.solution
        };
    }

    /**
     * 生成证明题
     */
    generateProofQuestion(geometryType, difficulty) {
        const templates = this.proofTemplates[geometryType] || this.proofTemplates['cube'];
        const template = templates[Math.floor(Math.random() * templates.length)];

        return {
            question: template.template,
            keyPoints: template.keyPoints,
            answer: 'proof',
            hint: '请使用线面平行或垂直的判定定理',
            solution: template.solution
        };
    }

    /**
     * 生成计算题
     */
    generateCalculationQuestion(geometryType, difficulty) {
        const templates = this.calculationTemplates[geometryType] || this.calculationTemplates['cube'];
        const template = templates[Math.floor(Math.random() * templates.length)];
        const generated = template.generate();

        // 替换模板中的参数
        let questionText = template.template;
        for (const [key, value] of Object.entries(generated.params)) {
            questionText = questionText.replace(`{${key}}`, value);
        }

        return {
            question: questionText,
            answer: generated.answer,
            hint: '请使用向量法或几何法进行计算',
            solution: generated.solution
        };
    }

    /**
     * 获取支持的几何体类型
     */
    getSupportedGeometryTypes() {
        return Object.keys(this.fillTemplates);
    }
}
