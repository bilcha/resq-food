export const CURRENCY = {
  CODE: 'UAH',
  SYMBOL: '₴',
  NAME: 'Ukrainian Hryvna',
} as const;

export const formatPrice = (price: number, isFree: boolean = false): string => {
  if (isFree) {
    return 'Безкоштовно'; // Free in Ukrainian
  }
  return `${CURRENCY.SYMBOL}${price.toFixed(2)}`;
};

export const formatPriceWithCurrency = (
  price: number,
  isFree: boolean = false,
): string => {
  if (isFree) {
    return 'Безкоштовно'; // Free in Ukrainian
  }
  return `${price.toFixed(2)} ${CURRENCY.CODE}`;
};
