import { Currency } from '../types';

export const EXCHANGE_RATE_USD_TO_IDR = 16250;

/**
 * Format currency amount based on selected primary and secondary currencies
 */
export function formatCurrency(
  amountUSD: number,
  currency: Currency = 'USD',
  showBoth: boolean = false
): string {
  const amountIDR = amountUSD * EXCHANGE_RATE_USD_TO_IDR;

  const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUSD);

  const idrFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amountIDR);

  if (showBoth) {
    if (currency === 'USD') {
      return `${usdFormatted} (${idrFormatted})`;
    } else {
      return `${idrFormatted} (${usdFormatted})`;
    }
  }

  return currency === 'USD' ? usdFormatted : idrFormatted;
}

export function convertUSDToIDR(usd: number): number {
  return usd * EXCHANGE_RATE_USD_TO_IDR;
}

export function convertIDRToUSD(idr: number): number {
  return idr / EXCHANGE_RATE_USD_TO_IDR;
}

/**
 * Calculate cross-border breakdown for any item price and weight
 */
export function calculateBorderBreakdown(
  basePriceUSD: number,
  weightKg: number = 1,
  originCity: string = 'Kupang',
  destinationMunicipality: string = 'Dili'
) {
  // 1. Domestic Indonesian Freight (Supplier -> Atambua Border Hub)
  let domesticFreightUSD = 2.50 + weightKg * 0.90;
  if (originCity.toLowerCase().includes('surabaya') || originCity.toLowerCase().includes('java')) {
    domesticFreightUSD = 5.50 + weightKg * 2.20;
  } else if (originCity.toLowerCase().includes('atambua')) {
    domesticFreightUSD = 1.00;
  }

  // 2. Atambua Border Hub Handling & Export Clearance (PEB)
  const borderHubUSD = Math.max(3.00, weightKg * 0.75);

  // 3. Timor-Leste Import Customs/Tax (Alfándega TL)
  // 2.5% Import Duty + 2.5% Sales Tax on CIF
  const cifUSD = basePriceUSD + domesticFreightUSD + borderHubUSD;
  const dutyUSD = cifUSD * 0.025;
  const salesTaxUSD = (cifUSD + dutyUSD) * 0.025;
  const borderAdminUSD = 2.00;
  const customsTaxUSD = Number((dutyUSD + salesTaxUSD + borderAdminUSD).toFixed(2));

  // 4. Last-Mile Delivery (Batugade Border -> Destination)
  let lastMileUSD = 3.50;
  if (destinationMunicipality.toLowerCase().includes('baucau')) {
    lastMileUSD = 6.50;
  } else if (destinationMunicipality.toLowerCase().includes('oecusse')) {
    lastMileUSD = 5.50;
  } else if (destinationMunicipality.toLowerCase().includes('maliana')) {
    lastMileUSD = 4.00;
  }

  const totalUSD = Number((basePriceUSD + domesticFreightUSD + borderHubUSD + customsTaxUSD + lastMileUSD).toFixed(2));

  return {
    basePriceUSD,
    domesticFreightUSD: Number(domesticFreightUSD.toFixed(2)),
    borderHubUSD: Number(borderHubUSD.toFixed(2)),
    customsTaxUSD,
    lastMileUSD: Number(lastMileUSD.toFixed(2)),
    totalUSD,
    totalIDR: Math.round(totalUSD * EXCHANGE_RATE_USD_TO_IDR),
    dutyUSD: Number(dutyUSD.toFixed(2)),
    salesTaxUSD: Number(salesTaxUSD.toFixed(2)),
    borderAdminUSD,
  };
}
