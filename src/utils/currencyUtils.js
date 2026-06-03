// Formatage des montants pour affichage utilisateur
const SYMBOLS = { EUR: '€', USD: '$', CAD: 'C$', GBP: '£', GNF: 'GNF' };

export const formatCurrency = (value, currency = 'EUR', options = {}) => {
  const { compact = false, decimals } = options;
  const num = Number(value) || 0;
  const sym = SYMBOLS[currency] || currency;

  if (compact && num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M ${sym}`;
  }
  if (compact && num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k ${sym}`;
  }
  const fixed = decimals !== undefined ? decimals : currency === 'GNF' ? 0 : 2;
  const parts = num.toFixed(fixed).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts.join(',')} ${sym}`;
};

export const symbolOf = (currency) => SYMBOLS[currency] || currency;
