/**
 * sections/dashboard/managers.js
 * Renderiza o painel lateral de gestores
 */
import { esc } from '../../js/utils.js';
import { classifyStatus } from '../../js/api.js';

/**
 * Determina classe CSS de status para média de dias
 */
function avgClass(avg) {
  if (avg <= 2) return 'ok';
  if (avg <= 7) return 'warning';
  return 'critical';
}

/**
 * Calcula largura da barra (baseada em escala 0-15 dias)
 */
function barWidth(avg) {
  const MAX = 15;
  return Math.min((avg / MAX) * 100, 100).toFixed(1);
}

/**
 * Renderiza lista de gestores
 * @param {Array} managers [{name, avg, total}]
 * @param {HTMLElement} container
 */
export function renderManagers(managers, container) {
  if (!managers || managers.length === 0) {
    container.innerHTML = `<div class="state-empty"><span>Sem dados de gestores</span></div>`;
    return;
  }

  container.innerHTML = managers.map((m, i) => {
    const cls = avgClass(m.avg);
    const width = barWidth(m.avg);
    return `
      <div class="manager-row">
        <div class="manager-header">
          <span class="manager-rank">#${i + 1}</span>
          <span class="manager-name">${esc(m.name.split(' ')[0])}</span>
          <span class="manager-score score-${cls}">${m.avg}d</span>
        </div>
        <div class="manager-bar-track">
          <div class="manager-bar-fill ${cls}" style="width: ${width}%"></div>
        </div>
      </div>
    `;
  }).join('');
}
