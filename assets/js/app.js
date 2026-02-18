/**
 * app.js — Controlador principal do dashboard Google Ads
 */
import { fetchDashboardData, clearCache } from './api.js';
import { nowFormatted, formatDateTime } from './utils.js';
import { renderManagers } from '../sections/dashboard/managers.js';
import {
  renderOkPanel,
  renderWarningPanel,
  renderCriticalPanel,
  renderLoading,
  renderError
} from '../sections/dashboard/panels.js';

// ─── DOM References ────────────────────────────────────────────────────────────
const elUpdateTime    = document.getElementById('update-time');
const elManagersBody  = document.getElementById('managers-body');
const elOkBody        = document.getElementById('ok-body');
const elWarningBody   = document.getElementById('warning-body');
const elCriticalBody  = document.getElementById('critical-body');
const elOkCount       = document.getElementById('ok-count');
const elWarningCount  = document.getElementById('warning-count');
const elCriticalCount = document.getElementById('critical-count');
const elRefreshBtn    = document.getElementById('refresh-btn');
const elFooterOk      = document.getElementById('footer-ok');
const elFooterWarning = document.getElementById('footer-warning');
const elFooterCritical= document.getElementById('footer-critical');
const elFooterInactive= document.getElementById('footer-inactive');

// ─── State ──────────────────────────────────────────────────────────────────────
let refreshTimer = null;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

// ─── Load & Render ──────────────────────────────────────────────────────────────
async function loadData(force = false) {
  if (force) clearCache();

  // Set loading states
  renderLoading(elOkBody, elWarningBody, elCriticalBody);
  elManagersBody.innerHTML = `<div class="state-loading"><div class="loading-spinner"></div></div>`;
  elRefreshBtn.classList.add('loading');

  try {
    const { accounts, updatedAt, managers } = await fetchDashboardData();

    // Update timestamp
    const ts = updatedAt ? formatDateTime(updatedAt) : nowFormatted();
    if (elUpdateTime) elUpdateTime.textContent = ts;

    // Render panels
    renderManagers(managers, elManagersBody);
    renderOkPanel(accounts, elOkBody, elOkCount);
    renderWarningPanel(accounts, elWarningBody, elWarningCount);
    renderCriticalPanel(accounts, elCriticalBody, elCriticalCount);

    // Footer counts
    const counts = {
      ok: accounts.filter(a => a.status === 'ok').length,
      warning: accounts.filter(a => a.status === 'warning').length,
      critical: accounts.filter(a => a.status === 'critical').length,
      inactive: accounts.filter(a => a.status === 'inactive').length,
    };
    if (elFooterOk)       elFooterOk.textContent       = `≤ 2d (${counts.ok})`;
    if (elFooterWarning)  elFooterWarning.textContent   = `3-7d (${counts.warning})`;
    if (elFooterCritical) elFooterCritical.textContent  = `8-15d (${counts.critical})`;
    if (elFooterInactive) elFooterInactive.textContent  = `> 15d (${counts.inactive})`;

  } catch (err) {
    console.error('[Dashboard] Erro ao carregar dados:', err);
    renderError(err.message || 'Erro ao carregar dados', elOkBody, elWarningBody, elCriticalBody);
    elManagersBody.innerHTML = `<div class="state-error"><span>Erro ao carregar</span></div>`;
  } finally {
    elRefreshBtn.classList.remove('loading');
  }
}

// ─── Auto-refresh ───────────────────────────────────────────────────────────────
function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => loadData(true), REFRESH_INTERVAL);
}

// ─── Event Listeners ────────────────────────────────────────────────────────────
elRefreshBtn?.addEventListener('click', () => loadData(true));

// Page visibility: pause when hidden, refresh when visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(refreshTimer);
  } else {
    loadData(true);
    startAutoRefresh();
  }
});

// ─── Init ───────────────────────────────────────────────────────────────────────
(async function init() {
  await loadData();
  startAutoRefresh();
})();
