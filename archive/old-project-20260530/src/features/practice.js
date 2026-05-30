/**
 * 练习模式管理器
 * 负责出题、答题、评分等功能
 */

import { QuestionGenerator } from './questionBank.js';

export class PracticeManager {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.correctCount = 0;
        this.startTime = null;
        this.endTime = null;

        // 题目类型
        this.questionTypes = ['fill', 'choice', 'proof', 'calculation'];

        // 难度级别
        this.difficulties = ['easy', 'medium', 'hard'];

        // 题目生成器
        this.questionGenerator = new QuestionGenerator();
    }

    /**
     * 生成题目
     */
    generateQuestions(geometryType, count = 5, difficulty = 'mixed') {
        this.questions = [];
        this.currentIndex = 0;
        this.correctCount = 0;

        for (let i = 0; i < count; i++) {
            const question = this.generateSingleQuestion(geometryType, difficulty);
            this.questions.push(question);
        }

        return this.questions;
    }

    /**
     * 生成单道题目
     */
    generateSingleQuestion(geometryType, difficulty) {
        // 随机选择题目类型
        const type = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];

        // 根据难度选择
        let actualDifficulty = difficulty;
        if (difficulty === 'mixed') {
            const rand = Math.random();
            if (rand < 0.4) actualDifficulty = 'easy';
            else if (rand < 0.8) actualDifficulty = 'medium';
            else actualDifficulty = 'hard';
        }

        // 根据几何体类型和题目类型生成题目
        const question = this.createQuestionByType(geometryType, type, actualDifficulty);

        return {
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            difficulty: actualDifficulty,
            geometryType: geometryType,
            ...question,
            userAnswer: null,
            isCorrect: null,
            timeSpent: 0
        };
    }

    /**
     * 根据类型创建题目
     */
    createQuestionByType(geometryType, type, difficulty) {
        // 使用题库生成器生成题目
        switch (type) {
            case 'fill':
                return this.questionGenerator.generateFillQuestion(geometryType, difficulty);
            case 'choice':
                return this.questionGenerator.generateChoiceQuestion(geometryType, difficulty);
            case 'proof':
                return this.questionGenerator.generateProofQuestion(geometryType, difficulty);
            case 'calculation':
                return this.questionGenerator.generateCalculationQuestion(geometryType, difficulty);
            default:
                return this.questionGenerator.generateFillQuestion(geometryType, difficulty);
        }
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.startTime = Date.now();
        this.endTime = null;
    }

    /**
     * 停止计时
     */
    stopTimer() {
        this.endTime = Date.now();
    }

    /**
     * 提交答案
     */
    submitAnswer(answer) {
        if (this.currentIndex >= this.questions.length) return null;

        const question = this.questions[this.currentIndex];
        question.userAnswer = answer;
        question.timeSpent = Date.now() - this.startTime;

        // 判断答案是否正确
        question.isCorrect = this.checkAnswer(question, answer);
        if (question.isCorrect) {
            this.correctCount++;
        }

        this.currentIndex++;

        return {
            isCorrect: question.isCorrect,
            correctAnswer: question.answer,
            solution: question.solution
        };
    }

    /**
     * 检查答案
     */
    checkAnswer(question, userAnswer) {
        // 根据题目类型检查答案
        switch (question.type) {
            case 'fill':
                return this.checkFillAnswer(question, userAnswer);
            case 'choice':
                return this.checkChoiceAnswer(question, userAnswer);
            case 'proof':
                return this.checkProofAnswer(question, userAnswer);
            case 'calculation':
                return this.checkCalculationAnswer(question, userAnswer);
            default:
                return false;
        }
    }

    /**
     * 检查填空题答案
     */
    checkFillAnswer(question, userAnswer) {
        // 简单的字符串比较，后续可以加入更智能的判断
        return userAnswer.toString().trim() === question.answer.toString().trim();
    }

    /**
     * 检查选择题答案
     */
    checkChoiceAnswer(question, userAnswer) {
        return parseInt(userAnswer) === question.answer;
    }

    /**
     * 检查证明题答案
     */
    checkProofAnswer(question, userAnswer) {
        // 证明题需要人工判断或更复杂的逻辑
        // 这里暂时返回true，后续可以加入关键词匹配
        return true;
    }

    /**
     * 检查计算题答案
     */
    checkCalculationAnswer(question, userAnswer) {
        // 计算题需要数值比较，允许一定的误差
        const correct = parseFloat(question.answer);
        const user = parseFloat(userAnswer);
        return Math.abs(correct - user) < 0.01;
    }

    /**
     * 获取当前题目
     */
    getCurrentQuestion() {
        if (this.currentIndex >= this.questions.length) return null;
        return this.questions[this.currentIndex];
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            total: this.questions.length,
            answered: this.currentIndex,
            correct: this.correctCount,
            accuracy: this.currentIndex > 0 ? (this.correctCount / this.currentIndex * 100).toFixed(1) : 0
        };
    }

    /**
     * 获取练习记录
     */
    getRecord() {
        return {
            date: new Date().toISOString(),
            questions: this.questions,
            stats: this.getStats(),
            totalTime: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime
        };
    }
}
