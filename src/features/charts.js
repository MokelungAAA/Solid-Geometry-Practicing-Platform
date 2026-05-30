/**
 * ChartsManager
 * 统计图表管理
 */

export class ChartsManager {
  constructor() {
    this.charts = {};
    this.chartTypes = ['bar', 'line', 'pie', 'radar'];
  }

  createChart(containerId, type, data, options = {}) {
    const canvas = document.getElementById(containerId);
    if (!canvas || canvas.tagName !== 'CANVAS') {
      return null;
    }
    const ctx = canvas.getContext('2d');
    const chart = {
      canvas,
      ctx,
      type,
      data,
      options,
      width: canvas.width,
      height: canvas.height
    };
    this.charts[containerId] = chart;
    this.renderChart(chart);
    return chart;
  }

  renderChart(chart) {
    const { ctx, type, data, width, height } = chart;
    ctx.clearRect(0, 0, width, height);
    switch (type) {
      case 'bar':
        this.renderBarChart(ctx, data, width, height);
        break;
      case 'line':
        this.renderLineChart(ctx, data, width, height);
        break;
      case 'pie':
        this.renderPieChart(ctx, data, width, height);
        break;
      case 'radar':
        this.renderRadarChart(ctx, data, width, height);
        break;
    }
  }

  renderBarChart(ctx, data, width, height) {
    const { labels, values, colors } = data;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / labels.length * 0.8;
    const gap = chartWidth / labels.length * 0.2;
    const maxValue = Math.max(...values);
    ctx.fillStyle = '#6200ee';
    labels.forEach((label, i) => {
      const x = padding + i * (barWidth + gap);
      const barHeight = (values[i] / maxValue) * chartHeight;
      const y = height - padding - barHeight;
      ctx.fillStyle = colors ? colors[i % colors.length] : '#6200ee';
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + barWidth / 2, height - padding + 20);
      ctx.fillText(values[i].toString(), x + barWidth / 2, y - 5);
    });
  }

  renderLineChart(ctx, data, width, height) {
    const { labels, values } = data;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...values);
    ctx.strokeStyle = '#6200ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    labels.forEach((label, i) => {
      const x = padding + (i / (labels.length - 1)) * chartWidth;
      const y = height - padding - (values[i] / maxValue) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      ctx.fillStyle = '#6200ee';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, height - padding + 20);
      ctx.fillText(values[i].toString(), x, y - 10);
    });
    ctx.stroke();
  }

  renderPieChart(ctx, data, width, height) {
    const { labels, values, colors } = data;
    const total = values.reduce((sum, v) => sum + v, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    let currentAngle = 0;
    values.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors ? colors[i % colors.length] : `hsl(${i * 360 / values.length}, 70%, 60%)`;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], labelX, labelY);
      currentAngle += sliceAngle;
    });
  }

  renderRadarChart(ctx, data, width, height) {
    const { labels, values } = data;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const maxValue = Math.max(...values);
    const angleStep = (Math.PI * 2) / labels.length;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const r = (radius / 5) * (i + 1);
      ctx.beginPath();
      for (let j = 0; j <= labels.length; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.strokeStyle = '#6200ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(98, 0, 238, 0.2)';
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 20);
      const y = centerY + Math.sin(angle) * (radius + 20);
      ctx.fillText(label, x, y);
    });
  }

  updateChart(containerId, newData) {
    const chart = this.charts[containerId];
    if (chart) {
      chart.data = newData;
      this.renderChart(chart);
    }
  }

  destroyChart(containerId) {
    delete this.charts[containerId];
  }

  destroyAll() {
    this.charts = {};
  }
}
