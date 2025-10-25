import type {
  Location,
  RocketConfig,
  ZoneValidation,
  FeasibilityScore,
  ResourcesAnalysis,
  LegalAnalysis,
  GeographicalAnalysis,
  GeopoliticalAnalysis,
  TimingAnalysis,
  PracticalityAnalysis,
  AnalysisResult,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { analyzeLocationWithAI } from "./openai-client";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OSMResponse {
  elements: OSMElement[];
}

async function queryOverpassAPI(lat: number, lon: number, radius: number): Promise<OSMResponse | null> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["aeroway"="aerodrome"](around:${radius},${lat},${lon});
        way["aeroway"="aerodrome"](around:${radius},${lat},${lon});
        relation["aeroway"="aerodrome"](around:${radius},${lat},${lon});
        
        node["aeroway"="airport"](around:${radius},${lat},${lon});
        way["aeroway"="airport"](around:${radius},${lat},${lon});
        relation["aeroway"="airport"](around:${radius},${lat},${lon});
        
        node["amenity"="school"](around:${radius},${lat},${lon});
        way["amenity"="school"](around:${radius},${lat},${lon});
        relation["amenity"="school"](around:${radius},${lat},${lon});
        
        node["amenity"="university"](around:${radius},${lat},${lon});
        way["amenity"="university"](around:${radius},${lat},${lon});
        relation["amenity"="university"](around:${radius},${lat},${lon});
        
        node["amenity"="college"](around:${radius},${lat},${lon});
        way["amenity"="college"](around:${radius},${lat},${lon});
        
        node["military"](around:${radius},${lat},${lon});
        way["military"](around:${radius},${lat},${lon});
        relation["military"](around:${radius},${lat},${lon});
        
        node["landuse"="military"](around:${radius},${lat},${lon});
        way["landuse"="military"](around:${radius},${lat},${lon});
        relation["landuse"="military"](around:${radius},${lat},${lon});
        
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        
        node["place"="city"](around:${radius},${lat},${lon});
        node["place"="town"](around:${radius},${lat},${lon});
        node["place"="suburb"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      console.error("Overpass API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error querying Overpass API:", error);
    return null;
  }
}

function isPointInUrbanArea(lat: number): boolean {
  return Math.abs(lat) < 60;
}

export async function validateZone(location: Location): Promise<ZoneValidation> {
  const warnings: ZoneValidation["warnings"] = [];

  const searchRadius = 20000;
  const osmData = await queryOverpassAPI(location.latitude, location.longitude, searchRadius);

  if (!osmData) {
    warnings.push({
      type: "other",
      message: "Unable to verify restricted zones due to data service unavailability. Exercise extreme caution and manually verify airspace and local restrictions before any launch activities.",
    });
  }

  if (osmData && osmData.elements) {
    const processed = new Set<string>();

    for (const element of osmData.elements) {
      const elementLat = element.lat ?? element.center?.lat;
      const elementLon = element.lon ?? element.center?.lon;

      if (elementLat === null || elementLat === undefined || elementLon === null || elementLon === undefined) continue;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        elementLat,
        elementLon
      );

      const name = element.tags?.name || "Unnamed facility";
      const elementId = `${element.type}-${element.id}`;

      if (processed.has(elementId)) continue;
      processed.add(elementId);

      if (element.tags?.aeroway === "aerodrome" || element.tags?.aeroway === "airport") {
        const criticalRadius = 8000;
        const cautionRadius = 15000;

        if (distance < criticalRadius) {
          warnings.push({
            type: "airport",
            message: `CRITICAL: Inside or very close to ${name} airport. Rocket launches are strictly prohibited within ${(criticalRadius / 1000).toFixed(1)}km of airports.`,
            distance,
          });
        } else if (distance < cautionRadius) {
          warnings.push({
            type: "airport",
            message: `Near ${name} airport (${(distance / 1000).toFixed(1)}km away). Airspace restrictions apply. FAA/CAA approval required.`,
            distance,
          });
        }
      } else if (element.tags?.amenity === "school" || element.tags?.amenity === "university" || element.tags?.amenity === "college") {
        const criticalRadius = 500;
        const cautionRadius = 2000;

        if (distance < criticalRadius) {
          warnings.push({
            type: "school",
            message: `CRITICAL: Inside or adjacent to ${name}. Launching rockets near schools poses extreme safety risks and is prohibited.`,
            distance,
          });
        } else if (distance < cautionRadius) {
          warnings.push({
            type: "school",
            message: `Near ${name} (${(distance / 1000).toFixed(2)}km away). Exercise extreme caution and ensure proper safety protocols.`,
            distance,
          });
        }
      } else if (element.tags?.military || element.tags?.landuse === "military") {
        const criticalRadius = 5000;
        const cautionRadius = 10000;

        if (distance < criticalRadius) {
          warnings.push({
            type: "military",
            message: `CRITICAL: Inside or near ${name} military zone. Unauthorized launches in military areas are strictly prohibited.`,
            distance,
          });
        } else if (distance < cautionRadius) {
          warnings.push({
            type: "military",
            message: `Near ${name} military facility (${(distance / 1000).toFixed(1)}km away). Security restrictions may apply.`,
            distance,
          });
        }
      } else if (element.tags?.amenity === "hospital") {
        const cautionRadius = 1500;

        if (distance < cautionRadius) {
          warnings.push({
            type: "other",
            message: `Near ${name} hospital (${(distance / 1000).toFixed(2)}km away). Consider impact on emergency services and patient safety.`,
            distance,
          });
        }
      }
    }
  }

  const lat = Math.abs(location.latitude);
  if (lat > 60) {
    warnings.push({
      type: "other",
      message: "High latitude location may have challenging weather conditions and limited infrastructure.",
    });
  }

  if (osmData && osmData.elements) {
    const urbanAreas = osmData.elements.filter(
      (e) => e.tags?.place === "city" || e.tags?.place === "town" || e.tags?.place === "suburb"
    );

    for (const urban of urbanAreas) {
      const elementLat = urban.lat ?? urban.center?.lat;
      const elementLon = urban.lon ?? urban.center?.lon;

      if (elementLat === null || elementLat === undefined || elementLon === null || elementLon === undefined) continue;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        elementLat,
        elementLon
      );

      const population = urban.tags?.population ? parseInt(urban.tags.population) : 0;
      const name = urban.tags?.name || "Urban area";

      if (population > 100000 && distance < 10000) {
        warnings.push({
          type: "urban_dense",
          message: `Inside or near dense urban area of ${name} (population: ${population.toLocaleString()}). Rocket launches in populated areas pose significant safety risks.`,
          distance,
        });
      } else if (population > 50000 && distance < 5000) {
        warnings.push({
          type: "urban_dense",
          message: `Within populated area of ${name} (${distance.toFixed(0)}m from center). Consider safety protocols for nearby residents.`,
          distance,
        });
      } else if (distance < 2000 && urban.tags?.place === "suburb") {
        warnings.push({
          type: "urban_dense",
          message: `Within residential suburb of ${name}. Ensure compliance with local ordinances regarding rocket activities.`,
          distance,
        });
      }
    }
  }

  const hasCriticalViolation = warnings.some((w) => {
    if (!w.distance) return w.message.includes("CRITICAL");
    if (w.type === "airport" && w.distance < 8000) return true;
    if (w.type === "military" && w.distance < 5000) return true;
    if (w.type === "school" && w.distance < 500) return true;
    return false;
  });

  const hasDataServiceWarning = warnings.some((w) => w.message.includes("Unable to verify restricted zones"));
  
  const isValid = !hasCriticalViolation && !hasDataServiceWarning && warnings.filter((w) => w.type === "airport" || w.type === "military" || w.type === "school").length === 0;

  const severity = hasCriticalViolation
    ? "danger"
    : (warnings.length > 0 || hasDataServiceWarning)
    ? "caution"
    : "safe";

  return {
    isValid,
    warnings,
    severity,
  };
}

function createFeasibilityScore(
  score: number,
  details: string
): FeasibilityScore {
  const status = score >= 70 ? "feasible" : score >= 40 ? "caution" : "not_recommended";
  return { score, status, details };
}

export async function analyzeLocation(
  location: Location,
  rocketConfig: RocketConfig
): Promise<AnalysisResult> {
  const zoneValidation = await validateZone(location);

  const isModelRocket = rocketConfig.category === "model";
  const baseMultiplier = isModelRocket ? 1.2 : 0.8;

  const developmentLevel = await assessDevelopmentLevel(location);
  const climateFactors = assessClimate(location);
  const politicalStability = await assessPoliticalStability(location);

  const rocketTypeLabel = isModelRocket 
    ? `Model Rocket (${rocketConfig.modelType || 'hobby'}, ${rocketConfig.safetyLevel || 'beginner'} level)` 
    : 'Industrial Rocket';

  const aiInsights = await analyzeLocationWithAI({
    latitude: location.latitude,
    longitude: location.longitude,
    country: location.country,
    city: location.city,
    state: location.state,
    displayName: location.displayName,
    rocketType: rocketTypeLabel,
    zoneWarnings: zoneValidation.warnings.map(w => w.message),
  });

  const resources: ResourcesAnalysis = {
    materials: createFeasibilityScore(
      Math.min(95, 60 + developmentLevel * 0.3 + (isModelRocket ? 20 : 0)),
      aiInsights.resourcesInsight
    ),
    expertise: createFeasibilityScore(
      Math.min(95, 50 + developmentLevel * 0.4 + (rocketConfig.safetyLevel === "advanced" ? 15 : 0)),
      aiInsights.resourcesInsight
    ),
    facilities: createFeasibilityScore(
      Math.min(95, 40 + developmentLevel * 0.5 + (isModelRocket ? 25 : 0)),
      aiInsights.resourcesInsight
    ),
    overall: createFeasibilityScore(0, ""),
  };
  resources.overall = createFeasibilityScore(
    Math.round((resources.materials.score + resources.expertise.score + resources.facilities.score) / 3),
    aiInsights.resourcesInsight
  );

  const legal: LegalAnalysis = {
    permits: createFeasibilityScore(
      Math.max(30, 70 - (zoneValidation.warnings.length * 15) + (isModelRocket ? 10 : -20)),
      aiInsights.legalInsight
    ),
    regulations: createFeasibilityScore(
      Math.max(25, 65 + politicalStability * 0.2 - (isModelRocket ? 0 : 15)),
      aiInsights.legalInsight
    ),
    restrictions: createFeasibilityScore(
      zoneValidation.severity === "safe" ? 85 : zoneValidation.severity === "caution" ? 55 : 20,
      aiInsights.legalInsight
    ),
    overall: createFeasibilityScore(0, ""),
  };
  legal.overall = createFeasibilityScore(
    Math.round((legal.permits.score + legal.regulations.score + legal.restrictions.score) / 3),
    aiInsights.legalInsight
  );

  const geographical: GeographicalAnalysis = {
    terrain: createFeasibilityScore(
      Math.min(90, 70 + (Math.abs(location.latitude) < 30 ? 10 : -5)),
      aiInsights.geographicalInsight
    ),
    weather: createFeasibilityScore(
      climateFactors.weatherScore,
      aiInsights.geographicalInsight
    ),
    accessibility: createFeasibilityScore(
      Math.min(95, 55 + developmentLevel * 0.35),
      aiInsights.geographicalInsight
    ),
    overall: createFeasibilityScore(0, ""),
  };
  geographical.overall = createFeasibilityScore(
    Math.round((geographical.terrain.score + geographical.weather.score + geographical.accessibility.score) / 3),
    aiInsights.geographicalInsight
  );

  const geopolitical: GeopoliticalAnalysis = {
    stability: createFeasibilityScore(
      politicalStability,
      aiInsights.geopoliticalInsight
    ),
    cooperation: createFeasibilityScore(
      Math.min(90, 50 + politicalStability * 0.4),
      aiInsights.geopoliticalInsight
    ),
    risks: createFeasibilityScore(
      Math.min(95, 85 - (100 - politicalStability) * 0.3),
      aiInsights.geopoliticalInsight
    ),
    overall: createFeasibilityScore(0, ""),
  };
  geopolitical.overall = createFeasibilityScore(
    Math.round((geopolitical.stability.score + geopolitical.cooperation.score + geopolitical.risks.score) / 3),
    aiInsights.geopoliticalInsight
  );

  const currentMonth = new Date().getMonth();
  const isSummerNorthern = currentMonth >= 5 && currentMonth <= 8;
  const isSummer = location.latitude >= 0 ? isSummerNorthern : !isSummerNorthern;

  const timing: TimingAnalysis = {
    seasonality: createFeasibilityScore(
      isSummer ? 80 : 60,
      isSummer
        ? "Current season generally favorable for launch activities with stable weather patterns."
        : "Off-season may present weather challenges. Consider scheduling for warmer months."
    ),
    currentConditions: createFeasibilityScore(
      75,
      "Real-time conditions should be verified closer to launch date. Monitor weather forecasts."
    ),
    optimalWindow: location.latitude >= 0
      ? "June through September offers the most stable conditions for this location."
      : "December through March provides optimal weather windows in the Southern Hemisphere.",
    overall: createFeasibilityScore(0, ""),
  };
  timing.overall = createFeasibilityScore(
    Math.round((timing.seasonality.score + timing.currentConditions.score) / 2),
    "Timing assessment based on seasonal patterns and current conditions."
  );

  const practicality: PracticalityAnalysis = {
    cost: createFeasibilityScore(
      isModelRocket ? 85 : Math.max(30, 40 + developmentLevel * 0.3),
      isModelRocket
        ? "Model rockets are highly cost-effective, with kits starting under $100."
        : "Industrial rockets require significant capital investment in millions of dollars."
    ),
    timeline: createFeasibilityScore(
      isModelRocket ? 90 : 50 + (politicalStability * 0.3),
      isModelRocket
        ? "Model rocket projects can be completed in weeks to months."
        : "Industrial rocket development typically requires 2-5 years from planning to launch."
    ),
    successProbability: createFeasibilityScore(
      Math.max(
        35,
        60 +
          (rocketConfig.safetyLevel === "advanced" ? 15 : rocketConfig.safetyLevel === "intermediate" ? 5 : -5) +
          (zoneValidation.severity === "safe" ? 10 : -10) +
          (isModelRocket ? 10 : -15)
      ),
      "Success probability based on experience level, location suitability, and project scope."
    ),
    overall: createFeasibilityScore(0, ""),
  };
  practicality.overall = createFeasibilityScore(
    Math.round((practicality.cost.score + practicality.timeline.score + practicality.successProbability.score) / 3),
    "Practical feasibility considering cost, timeline, and success factors."
  );

  const overallScore = Math.round(
    (resources.overall.score +
      legal.overall.score +
      geographical.overall.score +
      geopolitical.overall.score +
      timing.overall.score +
      practicality.overall.score) /
      6
  );

  const recommendation = aiInsights.recommendation || "Unable to generate specific recommendation. Please consult with local authorities and aerospace experts.";

  return {
    id: randomUUID(),
    location,
    rocketConfig,
    zoneValidation,
    resources,
    legal,
    geographical,
    geopolitical,
    timing,
    practicality,
    overallScore,
    recommendation,
    createdAt: new Date().toISOString(),
  };
}

async function assessDevelopmentLevel(location: Location): Promise<number> {
  const developed = [
    { lat: 40.7128, lon: -74.0060, score: 95 },
    { lat: 51.5074, lon: -0.1278, score: 95 },
    { lat: 35.6762, lon: 139.6503, score: 95 },
    { lat: 48.8566, lon: 2.3522, score: 90 },
    { lat: -33.8688, lon: 151.2093, score: 90 },
    { lat: 1.3521, lon: 103.8198, score: 92 },
  ];

  let closestScore = 60;
  let minDistance = Infinity;

  for (const city of developed) {
    const distance = calculateDistance(location.latitude, location.longitude, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestScore = city.score;
    }
  }

  const distanceFactor = Math.max(0, 1 - minDistance / 5000000);
  return Math.round(closestScore * distanceFactor + 60 * (1 - distanceFactor));
}

function assessClimate(location: Location): { weatherScore: number; weatherDetails: string } {
  const lat = Math.abs(location.latitude);

  if (lat < 23.5) {
    return {
      weatherScore: 70,
      weatherDetails:
        "Tropical climate with consistent temperatures but potential for heavy rainfall and storms during wet season.",
    };
  } else if (lat < 40) {
    return {
      weatherScore: 85,
      weatherDetails:
        "Temperate climate generally favorable for launches with seasonal variations to consider.",
    };
  } else if (lat < 60) {
    return {
      weatherScore: 65,
      weatherDetails:
        "Mid-latitude location with variable weather patterns. Winter conditions may limit launch windows.",
    };
  } else {
    return {
      weatherScore: 45,
      weatherDetails:
        "High-latitude location with extreme weather conditions and limited favorable launch windows.",
    };
  }
}

async function assessPoliticalStability(location: Location): Promise<number> {
  const stable = [
    { lat: 60, lon: 10, score: 95 },
    { lat: 46, lon: 8, score: 95 },
    { lat: 52, lon: 5, score: 90 },
    { lat: 35.6, lon: 139.6, score: 88 },
    { lat: -33.8, lon: 151.2, score: 90 },
    { lat: 43.6, lon: -79.3, score: 92 },
    { lat: 38.9, lon: -77.0, score: 85 },
  ];

  let closestScore = 65;
  let minDistance = Infinity;

  for (const region of stable) {
    const distance = calculateDistance(location.latitude, location.longitude, region.lat, region.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestScore = region.score;
    }
  }

  const distanceFactor = Math.max(0, 1 - minDistance / 8000000);
  return Math.round(closestScore * distanceFactor + 65 * (1 - distanceFactor));
}
