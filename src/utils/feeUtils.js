// Calcul intelligent des frais de transfert
// Les frais dépendent: du montant, du réseau, du pays d'origine et de la devise

const BASE_FEE_BY_TIER = [
  { max: 100, fee: 2.5 },
  { max: 500, fee: 5 },
  { max: 1000, fee: 9 },
  { max: 3000, fee: 18 },
  { max: Infinity, fee: 30 },
];

const NETWORK_MULTIPLIER = {
  'orange-money': 1,
  'mtn-momo': 1.05,
  wave: 0.85, // Wave est connu pour des frais réduits
  'bank-transfer': 1.4,
};

const COUNTRY_DISCOUNT = {
  FR: 0,
  BE: 0,
  DE: 0,
  US: 0.05,
  CA: 0.05,
  GB: 0.05,
  default: 0.08,
};

export const calculateFees = (amount, network = 'orange-money', countryCode = 'FR') => {
  const value = Number(amount) || 0;
  if (value <= 0) return 0;

  const tier = BASE_FEE_BY_TIER.find((t) => value <= t.max);
  const baseFee = tier.fee;
  const networkMult = NETWORK_MULTIPLIER[network] ?? 1;
  const surcharge = COUNTRY_DISCOUNT[countryCode] ?? COUNTRY_DISCOUNT.default;

  return Math.round((baseFee * networkMult + value * surcharge / 10) * 100) / 100;
};

export const calculateBreakdown = ({ amount, network, countryCode, rate }) => {
  const value = Number(amount) || 0;
  const fees = calculateFees(value, network, countryCode);
  const totalDebit = Math.round((value + fees) * 100) / 100;
  const receivedGNF = Math.round(value * rate);
  return { amount: value, fees, totalDebit, receivedGNF };
};
