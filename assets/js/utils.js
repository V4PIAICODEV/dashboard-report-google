/**
 * utils.js — Utilitários gerais do dashboard
 */

/**
 * Formata data/hora em pt-BR
 * @param {string|null} iso
 * @returns {string}
 */
export function formatDateTime(iso) {
  if (!iso) return '--/--/---- --:--';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--/--/---- --:--';
  }
}

/**
 * Retorna data/hora atual formatada
 */
export function nowFormatted() {
  return formatDateTime(new Date().toISOString());
}

/**
 * Escapa HTML para evitar XSS
 */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Retorna nome curto do gestor (primeiro nome)
 */
export function shortName(full) {
  if (!full) return '—';
  return full.split(' ')[0];
}

/**
 * Debounce
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
