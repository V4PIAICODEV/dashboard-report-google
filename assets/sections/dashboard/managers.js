/**
 * sections/dashboard/managers.js
 * Renderiza o sidebar de gestores
 */
import { esc } from '../../js/utils.js';

function getScoreClass(avg) {
  if (avg <= 2) return { text: 'score-ok', bg: 'bg-ok' };
  if (avg <= 7) return { text: 'score-warning', bg: 'bg-warning' };
  return { text: 'score-critical', bg: 'bg-critical' };
}

export function renderManagers(managers, container) {
  if (!managers || managers.length === 0) {
    container.innerHTML = `<div class="state-empty">Sem dados</div>`;
    return;
  }

  // Ordenar do pior para o melhor (opcional, mas comum em monitoramento)
  // Mas vamos manter a ordem que vem da API (assumindo ordenação por avg)

  container.innerHTML = managers.map((m, i) => {
    const { text, bg } = getScoreClass(m.avg);
    // Calculo largura barra (escala max 15d)
    const pct = Math.min((m.avg / 15) * 100, 100).toFixed(1);

    return `
      <div class="manager-row">
        <div class="manager-info">
          <span class="mgr-rank">#${i + 1}</span>
          <span class="mgr-name">${esc(m.name.split(' ')[0])}</span>
          <span class="mgr-score ${text}">${m.avg} d</span>
        </div>
        <div class="mgr-bar-bg">
          <div class="mgr-bar-fill ${bg}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}