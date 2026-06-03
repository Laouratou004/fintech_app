// Service simulant l'API officielle de la Banque Centrale de la République de Guinée (BCRG)
// Renvoie des taux de change officiels devise étrangère -> Franc Guinéen (GNF)
// Dans une intégration réelle, remplacer par un appel HTTPS authentifié vers l'API BCRG

const BASE_RATES = {
  EUR: 9500,
  USD: 8650,
  CAD: 6320,
  GBP: 10980,
  GNF: 1, // Transfert local: pas de conversion
};

// Simule une légère variation intra-journée pour rendre l'expérience réaliste
const jitter = (rate) => {
  const delta = (Math.random() - 0.5) * 0.01; // ±0.5%
  return Math.round(rate * (1 + delta));
};

export const getOfficialRates = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    EUR: jitter(BASE_RATES.EUR),
    USD: jitter(BASE_RATES.USD),
    CAD: jitter(BASE_RATES.CAD),
    GBP: jitter(BASE_RATES.GBP),
    GNF: 1,
    fetchedAt: new Date().toISOString(),
  };
};

export const getOfficialRate = async (currency = 'EUR') => {
  const rates = await getOfficialRates();
  return rates[currency] || BASE_RATES.EUR;
};
