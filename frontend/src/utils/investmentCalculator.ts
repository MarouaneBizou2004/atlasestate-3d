/**
 * Real Estate Investment Yield & ROI Calculator for Marrakech, Morocco
 * 
 * Accurately models dual-strategy returns:
 * 1. Short-Term Vacation / Airbnb Tourism Rental
 * 2. Long-Term 12-Month Residential Lease
 */

import { Property } from '../types';

export interface InvestmentMetrics {
  askingPrice: number;
  
  // Short-Term (Airbnb / Tourism)
  shortTerm: {
    adrMad: number; // Average Daily Rate in MAD
    occupancyPercent: number; // e.g. 68%
    bookedNightsYear: number; // e.g. 248 nights
    grossAnnualRevenue: number;
    platformOtaFees: number; // 14%
    cleaningTurnoverCosts: number; // 6%
    utilitiesMaintenanceCosts: number; // 5%
    localTourismTax: number; // 4%
    totalAnnualExpenses: number;
    netOperatingIncome: number; // NOI
    grossYieldPercent: number;
    netRoiPercent: number;
    paybackYears: number;
  };

  // Long-Term (Annual Lease)
  longTerm: {
    monthlyRentMad: number;
    grossAnnualRent: number;
    vacancyReserve: number; // 4%
    syndicManagementFees: number; // 5%
    maintenanceReserve: number; // 3%
    totalAnnualExpenses: number;
    netAnnualIncome: number;
    grossYieldPercent: number;
    netCapRatePercent: number;
    paybackYears: number;
  };

  // Comparative Strategy Insights
  comparison: {
    optimalStrategy: 'short_term' | 'long_term';
    annualCashFlowSpread: number; // Difference in net MAD/yr
    yieldSpreadPercent: number; // Short-Term Net ROI % minus Long-Term Net Cap Rate %
    breakevenOccupancyPercent: number; // Occupancy where short-term equals long-term net
    investmentScorecard: 'PREMIER CASH FLOW' | 'BALANCED YIELD' | 'CAPITAL PRESERVATION';
    recommendationReason: string;
  };
}

// Typical ADR in MAD based on district and typology in Marrakech
const NEIGHBORHOOD_BASE_ADR: Record<string, number> = {
  palmeraie: 4500,
  hivernage: 1600,
  gueliz: 1250,
  medina: 2200,
  agdal: 950,
  targa: 2400,
  menara: 850,
  semlalia: 900,
  massira: 600,
  daoudiate: 650,
  mhamid: 500,
  ennakhil: 2800,
  'sidi youssef ben ali': 550,
};

// Typical Long-Term Rent in MAD per m² per month
const NEIGHBORHOOD_RENT_PER_M2: Record<string, number> = {
  gueliz: 95,
  hivernage: 125,
  palmeraie: 110,
  medina: 85,
  agdal: 70,
  targa: 65,
  menara: 65,
  semlalia: 70,
  massira: 48,
  daoudiate: 50,
  mhamid: 42,
  ennakhil: 80,
  'sidi youssef ben ali': 45,
};

export function computeInvestmentMetrics(
  property: Property,
  options?: {
    customOccupancyRate?: number; // 0.35 to 0.95
    customAdr?: number;
    customMonthlyRent?: number;
  }
): InvestmentMetrics {
  const price = Math.max(100000, property.price || 1500000);
  const surface = Math.max(20, property.surface_m2 || (property as any).surface || 100);
  const bedrooms = property.bedrooms || 2;
  const neighKey = (property.neighborhood || 'gueliz').toLowerCase().trim();
  const propType = (property.property_type || 'Apartment').toLowerCase();

  // 1. Calculate realistic Baseline ADR (Short-Term)
  let baseAdr = NEIGHBORHOOD_BASE_ADR[neighKey] || 1100;

  // Typology scaling
  if (propType.includes('villa')) {
    baseAdr = Math.max(baseAdr * 1.8, 3500);
  } else if (propType.includes('riad')) {
    baseAdr = Math.max(baseAdr * 1.4, 2200);
  } else if (propType.includes('penthouse') || propType.includes('duplex')) {
    baseAdr = Math.max(baseAdr * 1.35, 1800);
  } else if (propType.includes('commercial')) {
    baseAdr = Math.max(baseAdr * 1.2, 1400);
  }

  // Bedroom factor (+12% for each additional bedroom above 1)
  const bedroomMultiplier = 1 + Math.max(0, bedrooms - 1) * 0.12;

  // Amenities premium
  let amenityMultiplier = 1.0;
  if (property.pool) amenityMultiplier += 0.20;
  if (property.terrace) amenityMultiplier += 0.10;
  if (property.air_conditioning) amenityMultiplier += 0.08;
  if (property.garden) amenityMultiplier += 0.08;
  if (property.parking) amenityMultiplier += 0.04;

  const calculatedAdr = Math.round(baseAdr * bedroomMultiplier * amenityMultiplier);
  const activeAdr = options?.customAdr && options.customAdr > 0 ? options.customAdr : calculatedAdr;

  // Occupancy rate (Default: 68% for Marrakech tourism)
  const occupancy = options?.customOccupancyRate !== undefined
    ? Math.max(0.2, Math.min(0.95, options.customOccupancyRate))
    : 0.68;

  const bookedNights = Math.round(365 * occupancy);
  const grossStRevenue = Math.round(activeAdr * bookedNights);

  // Short-Term Cost Structure
  const platformOtaFees = Math.round(grossStRevenue * 0.14); // 14% Airbnb/Booking commission
  const cleaningCosts = Math.round(grossStRevenue * 0.06);   // 6% cleaning & linen
  const utilitiesCosts = Math.round(grossStRevenue * 0.05);  // 5% electricity, high-speed WiFi
  const tourismTaxCosts = Math.round(grossStRevenue * 0.04); // 4% local tourism tax & concierge
  const totalStExpenses = platformOtaFees + cleaningCosts + utilitiesCosts + tourismTaxCosts;
  const netStOperatingIncome = grossStRevenue - totalStExpenses;

  const grossStYield = (grossStRevenue / price) * 100;
  const netStRoi = (netStOperatingIncome / price) * 100;
  const stPayback = netStOperatingIncome > 0 ? price / netStOperatingIncome : 99;

  // 2. Long-Term Lease Calculation
  const rentPerM2 = NEIGHBORHOOD_RENT_PER_M2[neighKey] || 75;
  const calculatedMonthlyRent = Math.round(surface * rentPerM2 * (1 + (bedrooms > 2 ? 0.1 : 0)));
  const activeMonthlyRent = options?.customMonthlyRent && options.customMonthlyRent > 0
    ? options.customMonthlyRent
    : calculatedMonthlyRent;

  const grossLtRent = activeMonthlyRent * 12;
  const vacancyReserve = Math.round(grossLtRent * 0.04);       // 4% vacancy reserve
  const syndicFees = Math.round(grossLtRent * 0.05);           // 5% building syndic & management
  const ltMaintenanceReserve = Math.round(grossLtRent * 0.03); // 3% repairs reserve
  const totalLtExpenses = vacancyReserve + syndicFees + ltMaintenanceReserve;
  const netLtIncome = grossLtRent - totalLtExpenses;

  const grossLtYield = (grossLtRent / price) * 100;
  const netLtCapRate = (netLtIncome / price) * 100;
  const ltPayback = netLtIncome > 0 ? price / netLtIncome : 99;

  // 3. Strategy Comparison
  const cashFlowSpread = netStOperatingIncome - netLtIncome;
  const yieldSpread = netStRoi - netLtCapRate;
  const isShortTermOptimal = netStOperatingIncome >= netLtIncome;

  // Breakeven Occupancy: netSt = grossSt * 0.71 = ADR * 365 * Occ * 0.71 = netLtIncome
  // Occ = netLtIncome / (ADR * 365 * 0.71)
  const breakevenOccupancy = activeAdr > 0
    ? Math.round((netLtIncome / (activeAdr * 365 * 0.71)) * 100)
    : 50;

  let scorecard: 'PREMIER CASH FLOW' | 'BALANCED YIELD' | 'CAPITAL PRESERVATION' = 'BALANCED YIELD';
  if (Math.max(netStRoi, netLtCapRate) >= 8.5) {
    scorecard = 'PREMIER CASH FLOW';
  } else if (Math.max(netStRoi, netLtCapRate) < 5.5) {
    scorecard = 'CAPITAL PRESERVATION';
  }

  let recommendationReason = '';
  if (isShortTermOptimal) {
    recommendationReason = `Short-Term generates +${cashFlowSpread.toLocaleString()} MAD/yr extra cash flow (${yieldSpread.toFixed(1)}% yield spread) driven by high tourism demand in ${property.neighborhood}.`;
  } else {
    recommendationReason = `Long-Term lease provides superior net stability with zero seasonal turnover risk and steady passive rental yield in ${property.neighborhood}.`;
  }

  return {
    askingPrice: price,
    shortTerm: {
      adrMad: activeAdr,
      occupancyPercent: Math.round(occupancy * 100),
      bookedNightsYear: bookedNights,
      grossAnnualRevenue: grossStRevenue,
      platformOtaFees,
      cleaningTurnoverCosts: cleaningCosts,
      utilitiesMaintenanceCosts: utilitiesCosts,
      localTourismTax: tourismTaxCosts,
      totalAnnualExpenses: totalStExpenses,
      netOperatingIncome: netStOperatingIncome,
      grossYieldPercent: Math.round(grossStYield * 10) / 10,
      netRoiPercent: Math.round(netStRoi * 10) / 10,
      paybackYears: Math.round(stPayback * 10) / 10,
    },
    longTerm: {
      monthlyRentMad: activeMonthlyRent,
      grossAnnualRent: grossLtRent,
      vacancyReserve,
      syndicManagementFees: syndicFees,
      maintenanceReserve: ltMaintenanceReserve,
      totalAnnualExpenses: totalLtExpenses,
      netAnnualIncome: netLtIncome,
      grossYieldPercent: Math.round(grossLtYield * 10) / 10,
      netCapRatePercent: Math.round(netLtCapRate * 10) / 10,
      paybackYears: Math.round(ltPayback * 10) / 10,
    },
    comparison: {
      optimalStrategy: isShortTermOptimal ? 'short_term' : 'long_term',
      annualCashFlowSpread: cashFlowSpread,
      yieldSpreadPercent: Math.round(yieldSpread * 10) / 10,
      breakevenOccupancyPercent: Math.min(99, Math.max(15, breakevenOccupancy)),
      investmentScorecard: scorecard,
      recommendationReason,
    },
  };
}
