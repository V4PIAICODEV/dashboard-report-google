/**
 * sections/dashboard/panels.js
 * Renderiza os painéis de contas no estilo Meta Ads Dashboard
 */
import { esc, shortName } from '../../js/utils.js';
import { formatDaysAgo } from '../../js/api.js';

// Ícones SVG minimalistas (Filled/Stroke style)
const ICONS = {
  ok: `<svg class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  
  warning: `<svg class="icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  
  critical: `<svg class="icon-critical" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  
  inactive: `<span style="font-size: 16px; display: flex; align-items: center; justify-content: center;" title="> 15 Dias">💀</span>`,
  
  person: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px;opacity:0.7"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};

/**
 * Renderiza uma linha de conta (Layout: Icone | Nome | Gestor | Tempo)
 */
function accountRow(acc) {
  const status = acc.status || 'inactive';
  // Mapeia ícone baseado no status
  let iconHtml = ICONS.inactive;
  if (status === 'ok') iconHtml = ICONS.ok;
  if (status === 'warning') iconHtml = ICONS.warning;
  if (status === 'critical') iconHtml = ICONS.critical;

  const manager = shortName(acc.GT);
  const timeAgo = formatDaysAgo(acc.days_since_update ?? 0);
  const name = acc.name || acc.account_name || 'Sem nome';

  return `
    <div class="account-row">
      <div class="acc-icon">${iconHtml}</div>
      <div class="acc-name" title="${esc(name)}">${esc(name)}</div>
      <div class="acc-manager">
        ${ICONS.person}
        ${esc(manager)}
      </div>
      <div class="acc-date">${timeAgo}</div>
    </div>
  `;
}

export function renderOkPanel(accounts, container, countEl) {
  const filtered = accounts
    .filter(a => a.status === 'ok')
    .sort((a, b) => (a.days_since_update ?? 0) - (b.days_since_update ?? 0));
    
  if (countEl) countEl.textContent = filtered.length;
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty">Tudo limpo</div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

export function renderWarningPanel(accounts, container, countEl) {
  const filtered = accounts
    .filter(a => a.status === 'warning')
    .sort((a, b) => (a.days_since_update ?? 0) - (b.days_since_update ?? 0));
    
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty">-</div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

export function renderCriticalPanel(accounts, container, countEl) {
  // Inclui inactive nos críticos para mostrar tudo que está > 7d
  const filtered = accounts
    .filter(a => a.status === 'critical' || a.status === 'inactive')
    .sort((a, b) => (a.days_since_update ?? 0) - (b.days_since_update ?? 0));
    
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty">-</div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

export function renderLoading(...containers) {
  for (const c of containers) {
    c.innerHTML = `<div class="state-loading"><div class="loading-spinner"></div></div>`;
  }
}

export function renderError(msg, ...containers) {
  for (const c of containers) {
    c.innerHTML = `<div class="state-error"><span>${esc(msg)}</span></div>`;
  }
}
