// Validations métier et conformité AML/KYC
const KYC_THRESHOLD = 3000;       // EUR équivalent: déclenche KYC renforcé
const HARD_LIMIT = 10000;         // Plafond de transaction unique
const MIN_TRANSFER = 5;

export const validateTransfer = ({ amount, receiverName, receiverPhone, network, monthlyUsed = 0, monthlyLimit = 5000 }) => {
  const errors = {};
  const warnings = [];
  const value = Number(amount) || 0;

  if (!receiverName || receiverName.trim().length < 2) {
    errors.receiverName = 'Nom du bénéficiaire requis';
  }
  if (network !== 'bank-transfer' && (!receiverPhone || receiverPhone.replace(/\s+/g, '').length < 8)) {
    errors.receiverPhone = 'Numéro Mobile Money invalide';
  }
  if (value < MIN_TRANSFER) {
    errors.amount = `Montant minimum: ${MIN_TRANSFER}`;
  }
  if (value > HARD_LIMIT) {
    errors.amount = `Plafond unique dépassé (${HARD_LIMIT})`;
  }
  if (monthlyUsed + value > monthlyLimit) {
    errors.amount = 'Plafond mensuel dépassé';
  }
  if (value >= KYC_THRESHOLD && value <= HARD_LIMIT) {
    warnings.push('Vérification KYC renforcée requise pour ce montant');
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const KYC_THRESHOLDS = { KYC_THRESHOLD, HARD_LIMIT, MIN_TRANSFER };
