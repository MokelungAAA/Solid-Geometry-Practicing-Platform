/**
 * ProofToolbar
 * 证明题工具栏
 */

export class ProofToolbar {
  constructor() {
    this.toolbar = null;
    this.steps = [];
    this.currentStep = 0;
  }

  create() {
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'proof-toolbar';
    this.toolbar.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--md-surface);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 1000;
      display: none;
    `;
    this.toolbar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <button id="proof-prev" style="padding: 8px 16px; border-radius: 8px; border: none; background: var(--md-primary); color: white; cursor: pointer;">上一步</button>
        <span id="proof-step-text" style="min-width: 200px; text-align: center;"></span>
        <button id="proof-next" style="padding: 8px 16px; border-radius: 8px; border: none; background: var(--md-primary); color: white; cursor: pointer;">下一步</button>
      </div>
    `;
    document.body.appendChild(this.toolbar);
    this.bindEvents();
    return this.toolbar;
  }

  bindEvents() {
    document.getElementById('proof-prev').addEventListener('click', () => this.prevStep());
    document.getElementById('proof-next').addEventListener('click', () => this.nextStep());
  }

  show() {
    if (!this.toolbar) this.create();
    this.toolbar.style.display = 'block';
  }

  hide() {
    if (this.toolbar) {
      this.toolbar.style.display = 'none';
    }
  }

  setSteps(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.updateDisplay();
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateDisplay();
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateDisplay();
    }
  }

  updateDisplay() {
    const text = document.getElementById('proof-step-text');
    if (text && this.steps.length > 0) {
      text.textContent = `步骤 ${this.currentStep + 1}/${this.steps.length}: ${this.steps[this.currentStep]}`;
    }
  }

  dispose() {
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
  }
}
