/**
 * FullscreenPracticeManager
 * 全屏练习管理
 */

export class FullscreenPracticeManager {
  constructor() {
    this.container = null;
    this.isActive = false;
    this.onExit = null;
  }

  create() {
    this.container = document.createElement('div');
    this.container.id = 'fullscreen-practice';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--md-surface);
      z-index: 10000;
      display: none;
      flex-direction: column;
    `;
    this.container.innerHTML = `
      <div id="fullscreen-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--md-outline-variant);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button id="fullscreen-back" style="background: none; border: none; cursor: pointer; color: var(--md-on-surface);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 id="fullscreen-title" style="margin: 0; font-size: 20px;">全屏练习</h2>
        </div>
        <div id="fullscreen-stats" style="display: flex; gap: 24px; font-size: 14px; color: var(--md-on-surface-variant);">
          <span id="fullscreen-timer">00:00</span>
          <span id="fullscreen-progress">0/0</span>
          <span id="fullscreen-score">得分: 0</span>
        </div>
      </div>
      <div id="fullscreen-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <div id="fullscreen-3d" style="flex: 1; position: relative;"></div>
        <div id="fullscreen-question" style="padding: 24px; border-top: 1px solid var(--md-outline-variant);">
          <div id="fullscreen-question-text" style="font-size: 18px; margin-bottom: 16px;"></div>
          <div id="fullscreen-options" style="display: flex; flex-wrap: wrap; gap: 12px;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    document.getElementById('fullscreen-back').addEventListener('click', () => this.exit());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.exit();
      }
    });
  }

  show() {
    if (!this.container) this.create();
    this.container.style.display = 'flex';
    this.isActive = true;
    this.startTimer();
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  exit() {
    this.isActive = false;
    this.stopTimer();
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    if (this.onExit) {
      this.onExit();
    }
  }

  setTitle(title) {
    const el = document.getElementById('fullscreen-title');
    if (el) el.textContent = title;
  }

  setProgress(current, total) {
    const el = document.getElementById('fullscreen-progress');
    if (el) el.textContent = `${current}/${total}`;
  }

  setScore(score) {
    const el = document.getElementById('fullscreen-score');
    if (el) el.textContent = `得分: ${score}`;
  }

  setQuestion(question) {
    const textEl = document.getElementById('fullscreen-question-text');
    const optionsEl = document.getElementById('fullscreen-options');
    if (textEl) textEl.textContent = question.questionText;
    if (optionsEl) {
      optionsEl.innerHTML = '';
      if (question.options) {
        question.options.forEach(option => {
          const btn = document.createElement('button');
          btn.textContent = option;
          btn.style.cssText = `
            padding: 12px 24px;
            border-radius: 12px;
            border: 2px solid var(--md-outline);
            background: var(--md-surface);
            color: var(--md-on-surface);
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
          `;
          btn.addEventListener('click', () => {
            if (this.onAnswer) {
              this.onAnswer(option);
            }
          });
          optionsEl.appendChild(btn);
        });
      }
    }
  }

  get3DContainer() {
    return document.getElementById('fullscreen-3d');
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      const el = document.getElementById('fullscreen-timer');
      if (el) {
        el.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  dispose() {
    this.exit();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
