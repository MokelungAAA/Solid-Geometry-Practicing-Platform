/**
 * 做题记录管理器
 * 负责记录的存储、导出、导入等功能
 */

export class RecordsManager {
    constructor() {
        this.storageKey = 'solid-geometry-records';
        this.records = [];

        // 加载已有记录
        this.loadRecords();
    }

    /**
     * 从localStorage加载记录
     */
    loadRecords() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.records = JSON.parse(data);
            }
        } catch (error) {
            console.error('加载记录失败:', error);
            this.records = [];
        }
    }

    /**
     * 保存记录到localStorage
     */
    saveRecords() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.records));
        } catch (error) {
            console.error('保存记录失败:', error);
        }
    }

    /**
     * 添加记录
     */
    addRecord(record) {
        this.records.unshift(record); // 新记录添加到开头
        this.saveRecords();
        return record;
    }

    /**
     * 删除记录
     */
    deleteRecord(index) {
        if (index >= 0 && index < this.records.length) {
            this.records.splice(index, 1);
            this.saveRecords();
            return true;
        }
        return false;
    }

    /**
     * 清空记录
     */
    clearRecords() {
        this.records = [];
        this.saveRecords();
    }

    /**
     * 获取所有记录
     */
    getRecords() {
        return this.records;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        if (this.records.length === 0) {
            return {
                totalPractices: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                avgAccuracy: 0,
                totalTime: 0
            };
        }

        let totalQuestions = 0;
        let correctAnswers = 0;
        let totalTime = 0;

        this.records.forEach(record => {
            if (record.stats) {
                totalQuestions += record.stats.total || 0;
                correctAnswers += record.stats.correct || 0;
            }
            if (record.totalTime) {
                totalTime += record.totalTime;
            }
        });

        return {
            totalPractices: this.records.length,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            avgAccuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0,
            totalTime: totalTime
        };
    }

    /**
     * 导出记录为JSON
     */
    exportToJSON() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            records: this.records
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = `立体几何练习记录_${this.formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    /**
     * 从JSON导入记录
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // 验证数据格式
                    if (!data.records || !Array.isArray(data.records)) {
                        reject(new Error('无效的记录文件格式'));
                        return;
                    }

                    // 合并记录（避免重复）
                    const existingDates = new Set(this.records.map(r => r.date));
                    const newRecords = data.records.filter(r => !existingDates.has(r.date));

                    this.records = [...newRecords, ...this.records];
                    this.saveRecords();

                    resolve({
                        imported: newRecords.length,
                        total: this.records.length
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}`;
    }

    /**
     * 获取正确率趋势数据
     */
    getAccuracyTrend(days = 7) {
        const trend = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            // 筛选当天的记录
            const dayRecords = this.records.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= date && recordDate < nextDate;
            });

            // 计算当天的平均正确率
            let accuracy = 0;
            if (dayRecords.length > 0) {
                let totalQuestions = 0;
                let correctAnswers = 0;

                dayRecords.forEach(record => {
                    if (record.stats) {
                        totalQuestions += record.stats.total || 0;
                        correctAnswers += record.stats.correct || 0;
                    }
                });

                accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;
            }

            trend.push({
                date: date.toISOString().split('T')[0],
                accuracy: accuracy,
                count: dayRecords.length
            });
        }

        return trend;
    }
}
