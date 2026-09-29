export type CropType = 'MAIZE' | 'RICE' | 'CASSAVA' | 'BEANS' | 'TOMATO';

export const CROP_LABELS: Record<CropType, string> = {
  MAIZE: 'Maize / Mahindi',
  RICE: 'Rice / Mpunga',
  CASSAVA: 'Cassava / Muhogo',
  BEANS: 'Beans / Maharage',
  TOMATO: 'Tomato / Nyanya',
};

export interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sizeHectares: number;
  crop: CropType;
  plantingDate: string;
  createdAt: string;
}

export interface FarmSummary {
  farm: Farm;
  weather: {
    current: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      cloudCover: number;
    };
    daily: Array<{
      date: string;
      tempMax: number;
      tempMin: number;
      precipitationSum: number;
      precipitationProbability: number;
      windSpeedMax: number;
    }>;
    warnings: string[];
  };
  rainfall: {
    last30DaysMm: number;
    historicalAverageMm: number;
    anomalyPercent: number;
    status: 'drought' | 'below_normal' | 'normal' | 'above_normal' | 'excessive';
  };
  soil: {
    available: boolean;
    ph?: number;
    organicCarbonPercent?: number;
    clayPercent?: number;
    sandPercent?: number;
    nitrogenGKg?: number;
    cecMmolKg?: number;
    approximated?: boolean;
    distanceKm?: number;
    message?: string;
  };
  cropStage: {
    stage: string;
    daysAfterPlanting: number;
    currentStage: string;
    daysIntoCurrentStage: number;
    nextStage: string | null;
    daysToNextStage: number | null;
    stages: Array<{ stage: string; daysFromSow: number }>;
  };
  market: {
    commodity: CropType;
    nearest: {
      market: string;
      region: string;
      distanceKm: number;
      price: number;
      unit: string;
      currency: string;
      priceType: string;
      date: string;
    } | null;
    history: Array<{ date: string; price: number }>;
    trend: 'up' | 'down' | 'flat' | 'unknown';
    nearbyMarkets: Array<{
      market: string;
      region: string;
      distanceKm: number;
      price: number;
      unit: string;
      currency: string;
      priceType: string;
      date: string;
    }>;
  };
  nationalContext: {
    year: number;
    productionTonnes: number | null;
    yieldKgPerHa: number | null;
    areaHarvestedHa: number | null;
    productionTrend: 'up' | 'down' | 'flat' | 'unknown';
  } | null;
  decision: {
    weatherRisk: 'low' | 'moderate' | 'high';
    droughtRisk: 'low' | 'moderate' | 'high';
    marketOpportunity: 'favorable' | 'moderate' | 'unfavorable' | 'unknown';
    overallStatus: 'good' | 'attention_required' | 'urgent';
    recommendations: string[];
  };
}
