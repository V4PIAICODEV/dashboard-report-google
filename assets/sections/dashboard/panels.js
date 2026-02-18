/**
 * sections/dashboard/panels.js
 * Renderiza os painéis de contas por status
 */
import { esc, shortName, formatDateTime } from '../../js/utils.js';
import { formatDaysAgo } from '../../js/api.js';

/* SVG icons inline */
const ICONS = {
  ok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  critical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  inactive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  person: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};

/**
 * Renderiza uma linha de conta
 */
function accountRow(acc) {
  const status = acc.status || 'inactive';
  const icon = ICONS[status] || ICONS.inactive;
  const manager = shortName(acc.GT);
  const timeAgo = formatDaysAgo(acc.days_since_update ?? 0);
  const updateType = acc.update_type ? acc.update_type.replace(/[()]/g, '').replace(/_/g, ' ') : '';

  return `
    <div class="account-row" data-status="${status}" data-id="${esc(acc.id_ekyte || '')}">
      <div class="account-icon ${status}">${icon}</div>
      <div class="account-info">
        <div class="account-name">${esc(acc.name || acc.account_name || '—')}</div>
        ${updateType ? `<div class="account-type">${esc(updateType)}</div>` : ''}
      </div>
      <div class="account-manager">
        ${ICONS.person}
        ${esc(manager)}
      </div>
      <div class="account-time">${timeAgo}</div>
    </div>
  `;
}

/**
 * Renderiza painel de contas OK (≤ 2 dias)
 */
export function renderOkPanel(accounts, container, countEl) {
  const filtered = accounts.filter(a => a.status === 'ok');
  if (countEl) {
    countEl.textContent = filtered.length;
    countEl.className = 'panel-count ok';
  }
  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty"><span>Nenhuma conta em dia</span></div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

/**
 * Renderiza painel de contas em atenção (3-7 dias)
 */
export function renderWarningPanel(accounts, container, countEl) {
  const filtered = accounts.filter(a => a.status === 'warning');
  if (countEl) {
    countEl.textContent = filtered.length;
    countEl.className = 'panel-count warning';
  }
  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty"><span>Nenhuma conta requer atenção</span></div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

/**
 * Renderiza painel de contas críticas (> 7 dias)
 */
export function renderCriticalPanel(accounts, container, countEl) {
  const filtered = accounts.filter(a => a.status === 'critical' || a.status === 'inactive');
  if (countEl) {
    countEl.textContent = filtered.length;
    countEl.className = 'panel-count critical';
  }
  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-empty"><span>Nenhuma conta crítica</span></div>`;
    return;
  }
  container.innerHTML = filtered.map(accountRow).join('');
}

/**
 * Renderiza loading em múltiplos containers
 */
export function renderLoading(...containers) {
  for (const c of containers) {
    c.innerHTML = `<div class="state-loading"><div class="loading-spinner"></div><span>Carregando...</span></div>`;
  }
}

/**
 * Renderiza erro em múltiplos containers
 */
export function renderError(msg, ...containers) {
  for (const c of containers) {
    c.innerHTML = `<div class="state-error"><span>⚠ ${esc(msg)}</span></div>`;
  }
}
