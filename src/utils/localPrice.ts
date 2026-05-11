import { getLocales } from 'expo-localization';

// Prices per currency (mock — replace with real backend prices later)
const PRICES: Record<string, { amount: number; currency: string }> = {
  USD: { amount: 6.99,  currency: 'USD' },
  EUR: { amount: 6.49,  currency: 'EUR' },
  GBP: { amount: 5.99,  currency: 'GBP' },
  JPY: { amount: 980,   currency: 'JPY' },
  AUD: { amount: 10.99, currency: 'AUD' },
  CAD: { amount: 9.49,  currency: 'CAD' },
  CHF: { amount: 6.49,  currency: 'CHF' },
  SEK: { amount: 74,    currency: 'SEK' },
  NOK: { amount: 74,    currency: 'NOK' },
  DKK: { amount: 49,    currency: 'DKK' },
  NZD: { amount: 11.49, currency: 'NZD' },
  SGD: { amount: 9.49,  currency: 'SGD' },
  HKD: { amount: 54,    currency: 'HKD' },
  KRW: { amount: 9900,  currency: 'KRW' },
  CNY: { amount: 48,    currency: 'CNY' },
  BRL: { amount: 34.99, currency: 'BRL' },
  MXN: { amount: 129,   currency: 'MXN' },
  INR: { amount: 579,   currency: 'INR' },
};

// Region code → currency code
const REGION_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP',
  AU: 'AUD', NZ: 'NZD',
  JP: 'JPY', KR: 'KRW', CN: 'CNY', HK: 'HKD', SG: 'SGD',
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
  FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
  PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
  BR: 'BRL', MX: 'MXN', IN: 'INR',
};

export interface LocalPrice {
  formatted: string;  // e.g. "$6.99" or "¥980"
  perMonth: string;   // e.g. "/ month"
}

export function getLocalPrice(): LocalPrice {
  const locales = getLocales();
  const locale  = locales[0];
  const region  = locale.regionCode ?? 'US';
  const currencyCode = REGION_CURRENCY[region] ?? 'USD';
  const price = PRICES[currencyCode] ?? PRICES['USD'];

  const formatted = new Intl.NumberFormat(locale.languageTag, {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: price.currency === 'JPY' || price.currency === 'KRW' ? 0 : 2,
  }).format(price.amount);

  return { formatted, perMonth: '/ month' };
}
