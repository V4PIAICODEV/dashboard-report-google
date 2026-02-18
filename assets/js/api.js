/**
 * api.js — Serviço de dados Google Ads
 * Busca e processa dados do webhook de otimizações
 */

const API_URL = 'https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/report-otimizacao-contas-googleads';

const CACHE_KEY = 'gads_dashboard_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

/**
 * Classifica uma conta por dias desde a última atualização
 * @param {number} days
 * @returns {'ok'|'warning'|'critical'|'inactive'}
 */
export function classifyStatus(days) {
  if (days <= 2) return 'ok';
  if (days <= 7) return 'warning';
  if (days <= 15) return 'critical';
  return 'inactive'; // > 15d
}

/**
 * Formata o tempo desde a atualização
 * @param {number} days
 * @returns {string}
 */
export function formatDaysAgo(days) {
  if (days === 0) return 'Hoje';
  if (days === 1) return '1d atrás';
  return `${days}d atrás`;
}

/**
 * Agrupa contas por gestor e calcula ciclo médio
 * @param {Array} accounts
 * @returns {Array} Gestores ordenados por ciclo médio
 */
export function buildManagerStats(accounts) {
  const map = {};
  for (const acc of accounts) {
    const gt = acc.GT || 'N/A';
    if (!map[gt]) {
      map[gt] = { name: gt, totalDays: 0, count: 0 };
    }
    map[gt].totalDays += acc.days_since_update || 0;
    map[gt].count += 1;
  }

  return Object.values(map)
    .map(m => ({
      name: m.name,
      avg: m.count > 0 ? +(m.totalDays / m.count).toFixed(1) : 0,
      total: m.count
    }))
    .sort((a, b) => a.avg - b.avg);
}

/**
 * Busca dados do webhook com cache local
 * @returns {Promise<{accounts: Array, updatedAt: string, managers: Array}>}
 */
export async function fetchDashboardData() {
  // Cache check
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
      }
    }
  } catch (_) {}

  const res = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

  const json = await res.json();

  // Suporte a envelope { atualização, data } ou array direto
  let raw = Array.isArray(json) ? json : null;
  let updatedAt = null;

  if (!raw && json && json.data) {
    raw = json.data;
    updatedAt = json['atualização'] || json.atualizacao || null;
  }

  if (!raw) {
    // Tenta extrair de array de objetos com atualização
    if (Array.isArray(json) && json[0] && json[0].data) {
      updatedAt = json[0]['atualização'] || null;
      raw = json[0].data;
    } else {
      raw = json;
    }
  }

  if (!Array.isArray(raw)) raw = [];

  const accounts = raw.map(item => ({
    ...item,
    status: classifyStatus(item.days_since_update ?? 0)
  }));

  const managers = buildManagerStats(accounts);

  const data = { accounts, updatedAt, managers };

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}

  return data;
}

/**
 * Limpa cache e força nova busca
 */
export function clearCache() {
  sessionStorage.removeItem(CACHE_KEY);
}
