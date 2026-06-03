// Réseaux Mobile Money disponibles en République de Guinée
export const mobileNetworks = [
  {
    id: 'orange-money',
    name: 'Orange Money',
    color: '#FF7900',
    shortCode: 'OM',
    prefix: ['621', '622', '624', '625', '626', '628'],
  },
  {
    id: 'mtn-momo',
    name: 'MTN MoMo',
    color: '#FFCC00',
    shortCode: 'MTN',
    prefix: ['661', '662', '664', '665', '666', '668'],
  },
  {
    id: 'wave',
    name: 'Wave',
    color: '#1A75FF',
    shortCode: 'WV',
    prefix: ['610', '611', '612'],
  },
  {
    id: 'bank-transfer',
    name: 'Virement bancaire',
    color: '#475569',
    shortCode: 'BNK',
    prefix: [],
  },
];

export const getNetwork = (id) => mobileNetworks.find((n) => n.id === id);
