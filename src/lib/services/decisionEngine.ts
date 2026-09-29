import type { WeatherSnapshot } from './weather';
import type { RainfallSnapshot } from './rainfall';
import type { SoilProfile } from './soil';
import type { MarketSnapshot } from './market';
import type { CropStageInfo } from './cropCalendar';

export type RiskLevel = 'low' | 'moderate' | 'high';
export type OverallStatus = 'good' | 'attention_required' | 'urgent';

export interface DecisionResult {
  weatherRisk: RiskLevel;
  droughtRisk: RiskLevel;
  marketOpportunity: 'favorable' | 'moderate' | 'unfavorable' | 'unknown';
  overallStatus: OverallStatus;
  recommendations: string[];
}

/** Weather + drought risk only — cheap enough to run per-farm on a list view (2 external calls, no soil/market/crop-stage needed). */
export function evaluateWeatherRisk(
  weather: WeatherSnapshot,
  rainfall: RainfallSnapshot
): Pick<DecisionResult, 'weatherRisk' | 'droughtRisk' | 'overallStatus'> & { recommendations: string[] } {
  const recommendations: string[] = [];

  let weatherRisk: RiskLevel = 'low';
  if (weather.warnings.length >= 2) weatherRisk = 'high';
  else if (weather.warnings.length === 1) weatherRisk = 'moderate';
  weather.warnings.forEach((w) => recommendations.push(w));

  const next48hRain = weather.daily.slice(0, 2).reduce((s, d) => s + d.precipitationSum, 0);
  if (next48hRain >= 10) {
    recommendations.push('Delay fertilizer application until rainfall decreases.');
  }

  let droughtRisk: RiskLevel = 'low';
  if (rainfall.status === 'drought') droughtRisk = 'high';
  else if (rainfall.status === 'below_normal') droughtRisk = 'moderate';
  else if (rainfall.status === 'excessive') droughtRisk = 'moderate';

  if (rainfall.status === 'drought' || rainfall.status === 'below_normal') {
    recommendations.push('Monitor plants for water stress; prioritize irrigation if available.');
  }
  if (rainfall.status === 'excessive') {
    recommendations.push('Check drainage — excess rainfall raises the risk of waterlogging and root disease.');
  }

  let overallStatus: OverallStatus = 'good';
  if (weatherRisk === 'high' || droughtRisk === 'high') overallStatus = 'urgent';
  else if (weatherRisk === 'moderate' || droughtRisk === 'moderate') overallStatus = 'attention_required';

  return { weatherRisk, droughtRisk, overallStatus, recommendations };
}

/**
 * The Decision Engine — the source of truth for risk and recommendations.
 * It is deterministic and rule-based; the AI assistant (Gemini) only
 * explains these outputs in Swahili, it does not decide them (see project
 * notes, section 26).
 */
export function evaluateFarm(inputs: {
  weather: WeatherSnapshot;
  rainfall: RainfallSnapshot;
  soil: SoilProfile;
  market: MarketSnapshot;
  cropStage: CropStageInfo;
}): DecisionResult {
  const { weather, rainfall, soil, market, cropStage } = inputs;
  const { weatherRisk, droughtRisk, recommendations } = evaluateWeatherRisk(weather, rainfall);

  // Soil-informed guidance (only when data is available — never invent numbers)
  if (soil.available && soil.ph !== undefined) {
    if (soil.ph < 5.5) {
      recommendations.push('Soil pH is acidic — consider liming before the next fertilizer application.');
    } else if (soil.ph > 7.5) {
      recommendations.push('Soil pH is alkaline — some nutrients may be less available to the crop.');
    }
  }

  // Crop-stage guidance
  if (cropStage.stage === 'flowering') {
    recommendations.push('The crop is flowering — this is a critical water-demand stage, avoid moisture stress.');
  }
  if (cropStage.stage === 'grain_filling' || cropStage.stage === 'maturity') {
    recommendations.push('Begin planning harvest logistics and monitor market prices before selling.');
  }

  // Market opportunity
  let marketOpportunity: DecisionResult['marketOpportunity'] = 'unknown';
  if (market.trend === 'up') {
    marketOpportunity = 'favorable';
    recommendations.push('Prices are rising at your nearest market — consider timing your sale to benefit.');
  } else if (market.trend === 'down') {
    marketOpportunity = 'unfavorable';
    recommendations.push('Prices are declining at your nearest market — selling sooner may fetch better returns.');
  } else if (market.trend === 'flat') {
    marketOpportunity = 'moderate';
  }
  if (market.nearbyMarkets.length > 1) {
    const best = [...market.nearbyMarkets].sort((a, b) => b.price - a.price)[0];
    if (market.nearest && best.market !== market.nearest.market && best.price > market.nearest.price * 1.03) {
      recommendations.push(
        `${best.market} currently offers a higher price than your nearest market — weigh this against transport cost.`
      );
    }
  }

  const overallStatus: OverallStatus =
    weatherRisk === 'high' || droughtRisk === 'high'
      ? 'urgent'
      : weatherRisk === 'moderate' || droughtRisk === 'moderate'
        ? 'attention_required'
        : 'good';

  if (recommendations.length === 0) {
    recommendations.push('No immediate risks detected — continue routine monitoring.');
  }

  return { weatherRisk, droughtRisk, marketOpportunity, overallStatus, recommendations };
}
