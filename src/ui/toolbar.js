/**
 * ToolbarManager
 * 底部工具栏管理器
 */

export class ToolbarManager {
  constructor() {
    this.toolbar = document.getElementById('toolbar');
    this.buttons = [];
    this.activeButton = null;
    this.buttonGroups = {};
  }

  init(options = []) {
    this.toolbar.innerHTML = '';
    options.forEach(option => {
      const button = this.createButton(option);
      this.toolbar.appendChild(button);
      this.buttons.push({ element: button, ...option });
    });
  }

  addButtonGroup(groupName, options) {
    const group = document.createElement('div');
    group.className = 'toolbar-group';
    group.setAttribute('data-group', groupName);
    options.forEach(option => {
      const button = this.createButton(option);
      group.appendChild(button);
      this.buttons.push({ element: button, ...option });
    });
    this.toolbar.appendChild(group);
    this.buttonGroups[groupName] = group;
  }

  createButton(option) {
    const button = document.createElement('button');
    button.className = 'toolbar-btn';
    button.setAttribute('data-action', option.action);
    button.setAttribute('title', option.tooltip || option.label);
    if (option.icon) {
      button.innerHTML = option.icon;
    } else {
      button.textContent = option.label;
    }
    if (option.onClick) {
      button.addEventListener('click', option.onClick);
    }
    return button;
  }

  setActive(action) {
    this.buttons.forEach(btn => {
      if (btn.action === action) {
        btn.element.classList.add('active');
        this.activeButton = btn;
      } else {
        btn.element.classList.remove('active');
      }
    });
  }

  disable(action) {
    const btn = this.buttons.find(b => b.action === action);
    if (btn) {
      btn.element.disabled = true;
      btn.element.classList.add('disabled');
    }
  }

  enable(action) {
    const btn = this.buttons.find(b => b.action === action);
    if (btn) {
      btn.element.disabled = false;
      btn.element.classList.remove('disabled');
    }
  }

  show() {
    this.toolbar.style.display = 'flex';
  }

  hide() {
    this.toolbar.style.display = 'none';
  }

  dispose() {
    this.toolbar.innerHTML = '';
    this.buttons = [];
    this.buttonGroups = {};
  }
}
