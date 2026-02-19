/**
 * app.js
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

// DOM Elements
const elUpdateTime    = document.getElementById('update-time');
const elManagersBody  = document.getElementById('managers-body');
const elOkBody        = document.getElementById('ok-body');
const elWarningBody   = document.getElementById('warning-body');
const elCriticalBody  = document.getElementById('critical-body');

const elOkCount       = document.getElementById('ok-count');
const elWarningCount  = document.getElementById('warning-count');
const elCriticalCount = document.getElementById('critical-count');

const elRefreshBtn    = document.getElementById('refresh-btn');

// Config
let refreshTimer = null;
const REFRESH_INTERVAL = 5 * 60 * 1000;

async function loadData(force = false) {
  if (force) clearCache();

  renderLoading(elOkBody, elWarningBody, elCriticalBody);
  elManagersBody.innerHTML = `<div class="state-loading"><div class="loading-spinner"></div></div>`;

  try {
    const { accounts, updatedAt, managers } = await fetchDashboardData();

    const ts = updatedAt ? formatDateTime(updatedAt) : nowFormatted();
    if (elUpdateTime) elUpdateTime.textContent = ts;

    renderManagers(managers, elManagersBody);
    renderOkPanel(accounts, elOkBody, elOkCount);
    renderWarningPanel(accounts, elWarningBody, elWarningCount);
    renderCriticalPanel(accounts, elCriticalBody, elCriticalCount);

  } catch (err) {
    console.error(err);
    renderError('Erro de conexão', elOkBody, elWarningBody, elCriticalBody);
    elManagersBody.innerHTML = `<div class="state-error">Erro</div>`;
  }
}

function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => loadData(true), REFRESH_INTERVAL);
}

// Events
elRefreshBtn?.addEventListener('click', () => loadData(true));
// Clique no relógio para atualizar também
document.querySelector('.header-update')?.addEventListener('click', () => loadData(true));

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    loadData(true);
    startAutoRefresh();
  } else {
    clearInterval(refreshTimer);
  }
});

(async function init() {
  await loadData();
  startAutoRefresh();
})();