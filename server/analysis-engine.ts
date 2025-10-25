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

const RESTRICTED_ZONES = {
  airports: [
    { name: "JFK International Airport", lat: 40.6413, lon: -73.7781, radius: 15000 },
    { name: "LAX Airport", lat: 33.9416, lon: -118.4085, radius: 15000 },
    { name: "Heathrow Airport", lat: 51.4700, lon: -0.4543, radius: 15000 },
    { name: "Dubai International", lat: 25.2532, lon: 55.3657, radius: 15000 },
    { name: "Tokyo Haneda", lat: 35.5494, lon: 139.7798, radius: 15000 },
    { name: "O'Hare International", lat: 41.9742, lon: -87.9073, radius: 15000 },
    { name: "Charles de Gaulle", lat: 49.0097, lon: 2.5479, radius: 15000 },
    { name: "Singapore Changi", lat: 1.3644, lon: 103.9915, radius: 15000 },
  ],
  military: [
    { name: "Pentagon", lat: 38.8719, lon: -77.0563, radius: 10000 },
    { name: "Edwards Air Force Base", lat: 34.9054, lon: -117.8840, radius: 20000 },
    { name: "RAF Lakenheath", lat: 52.4093, lon: 0.5610, radius: 10000 },
  ],
  schools: [
    { name: "Harvard University", lat: 42.3770, lon: -71.1167, radius: 2000 },
    { name: "Stanford University", lat: 37.4275, lon: -122.1697, radius: 2000 },
    { name: "MIT", lat: 42.3601, lon: -71.0942, radius: 2000 },
    { name: "Oxford University", lat: 51.7548, lon: -1.2544, radius: 2000 },
    { name: "Cambridge University", lat: 52.2043, lon: 0.1218, radius: 2000 },
    { name: "Tokyo University", lat: 35.7136, lon: 139.7625, radius: 2000 },
    { name: "Tsinghua University", lat: 40.0037, lon: 116.3261, radius: 2000 },
    { name: "UCLA", lat: 34.0689, lon: -118.4452, radius: 2000 },
    { name: "Columbia University", lat: 40.8075, lon: -73.9626, radius: 2000 },
    { name: "ETH Zurich", lat: 47.3769, lon: 8.5417, radius: 2000 },
  ],
};

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

export function validateZone(location: Location): ZoneValidation {
  const warnings: ZoneValidation["warnings"] = [];

  for (const airport of RESTRICTED_ZONES.airports) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      airport.lat,
      airport.lon
    );

    if (distance < airport.radius) {
      warnings.push({
        type: "airport",
        message: `Within ${(airport.radius / 1000).toFixed(1)}km restricted zone of ${airport.name}. Launch activities prohibited.`,
        distance,
      });
    } else if (distance < airport.radius * 2) {
      warnings.push({
        type: "airport",
        message: `Near ${airport.name} (${(distance / 1000).toFixed(1)}km away). Exercise caution and check airspace regulations.`,
        distance,
      });
    }
  }

  for (const military of RESTRICTED_ZONES.military) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      military.lat,
      military.lon
    );

    if (distance < military.radius) {
      warnings.push({
        type: "military",
        message: `Within ${(military.radius / 1000).toFixed(1)}km of ${military.name}. Military restricted zone - launches strictly prohibited.`,
        distance,
      });
    }
  }

  for (const school of RESTRICTED_ZONES.schools) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      school.lat,
      school.lon
    );

    if (distance < school.radius) {
      warnings.push({
        type: "school",
        message: `Within ${(school.radius / 1000).toFixed(1)}km of ${school.name}. Launch activities near educational facilities pose safety risks.`,
        distance,
      });
    } else if (distance < school.radius * 2.5) {
      warnings.push({
        type: "school",
        message: `Near ${school.name} (${(distance / 1000).toFixed(1)}km away). Ensure proper safety protocols for nearby educational institutions.`,
        distance,
      });
    }
  }

  const lat = Math.abs(location.latitude);
  if (lat > 60) {
    warnings.push({
      type: "other",
      message: "High latitude location may have challenging weather conditions and limited infrastructure.",
    });
  }

  const isValid = warnings.filter((w) => w.type === "airport" || w.type === "military" || w.type === "school").length === 0;
  
  const hasCriticalViolation = warnings.some((w) => {
    if (!w.distance) return false;
    if (w.type === "airport" && w.distance < 15000) return true;
    if (w.type === "military" && w.distance < 10000) return true;
    if (w.type === "school" && w.distance < 2000) return true;
    return false;
  });

  const severity = hasCriticalViolation
    ? "danger"
    : warnings.length > 0
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
  const zoneValidation = validateZone(location);

  const isModelRocket = rocketConfig.category === "model";
  const baseMultiplier = isModelRocket ? 1.2 : 0.8;

  const developmentLevel = await assessDevelopmentLevel(location);
  const climateFactors = assessClimate(location);
  const politicalStability = await assessPoliticalStability(location);

  const resources: ResourcesAnalysis = {
    materials: createFeasibilityScore(
      Math.min(95, 60 + developmentLevel * 0.3 + (isModelRocket ? 20 : 0)),
      isModelRocket
        ? "Model rocket materials are widely available through hobby suppliers and online retailers."
        : "Industrial rocket components require specialized suppliers and manufacturing facilities."
    ),
    expertise: createFeasibilityScore(
      Math.min(95, 50 + developmentLevel * 0.4 + (rocketConfig.safetyLevel === "advanced" ? 15 : 0)),
      "Technical expertise availability varies by location. Consider proximity to aerospace hubs or universities."
    ),
    facilities: createFeasibilityScore(
      Math.min(95, 40 + developmentLevel * 0.5 + (isModelRocket ? 25 : 0)),
      isModelRocket
        ? "Model rockets require minimal facilities - open space and basic launch equipment."
        : "Industrial rockets need extensive infrastructure including launch pads and mission control."
    ),
    overall: createFeasibilityScore(0, ""),
  };
  resources.overall = createFeasibilityScore(
    Math.round((resources.materials.score + resources.expertise.score + resources.facilities.score) / 3),
    "Overall resource availability assessment based on location development and rocket type."
  );

  const legal: LegalAnalysis = {
    permits: createFeasibilityScore(
      Math.max(30, 70 - (zoneValidation.warnings.length * 15) + (isModelRocket ? 10 : -20)),
      isModelRocket
        ? "Model rockets typically require minimal permits for hobby use, but check local regulations."
        : "Industrial launches require extensive permits from aviation, space, and environmental agencies."
    ),
    regulations: createFeasibilityScore(
      Math.max(25, 65 + politicalStability * 0.2 - (isModelRocket ? 0 : 15)),
      "Regulatory framework varies significantly by country. Some regions have established space laws."
    ),
    restrictions: createFeasibilityScore(
      zoneValidation.severity === "safe" ? 85 : zoneValidation.severity === "caution" ? 55 : 20,
      zoneValidation.warnings.length > 0
        ? "Location has proximity restrictions that may limit launch activities."
        : "No major restrictions identified for this location."
    ),
    overall: createFeasibilityScore(0, ""),
  };
  legal.overall = createFeasibilityScore(
    Math.round((legal.permits.score + legal.regulations.score + legal.restrictions.score) / 3),
    "Legal and regulatory assessment for rocket launch activities at this location."
  );

  const geographical: GeographicalAnalysis = {
    terrain: createFeasibilityScore(
      Math.min(90, 70 + (Math.abs(location.latitude) < 30 ? 10 : -5)),
      "Terrain suitability based on latitude and regional characteristics."
    ),
    weather: createFeasibilityScore(
      climateFactors.weatherScore,
      climateFactors.weatherDetails
    ),
    accessibility: createFeasibilityScore(
      Math.min(95, 55 + developmentLevel * 0.35),
      "Accessibility depends on local infrastructure and transportation networks."
    ),
    overall: createFeasibilityScore(0, ""),
  };
  geographical.overall = createFeasibilityScore(
    Math.round((geographical.terrain.score + geographical.weather.score + geographical.accessibility.score) / 3),
    "Geographical suitability assessment including terrain, weather, and access."
  );

  const geopolitical: GeopoliticalAnalysis = {
    stability: createFeasibilityScore(
      politicalStability,
      "Political stability affects long-term project viability and regulatory consistency."
    ),
    cooperation: createFeasibilityScore(
      Math.min(90, 50 + politicalStability * 0.4),
      "International cooperation level influences technology transfer and partnerships."
    ),
    risks: createFeasibilityScore(
      Math.min(95, 85 - (100 - politicalStability) * 0.3),
      "Geopolitical risk assessment for aerospace activities in the region."
    ),
    overall: createFeasibilityScore(0, ""),
  };
  geopolitical.overall = createFeasibilityScore(
    Math.round((geopolitical.stability.score + geopolitical.cooperation.score + geopolitical.risks.score) / 3),
    "Geopolitical environment assessment for sustained rocket operations."
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

  let recommendation = "";
  if (overallScore >= 70) {
    recommendation = `This location shows strong feasibility for ${
      isModelRocket ? "model rocket" : "industrial rocket"
    } activities. The combination of favorable conditions, adequate resources, and manageable regulatory requirements makes this a viable launch site. Proceed with detailed planning and ensure all permits are obtained before launch.`;
  } else if (overallScore >= 40) {
    recommendation = `This location presents moderate feasibility with some challenges that need to be addressed. ${
      zoneValidation.warnings.length > 0
        ? "Zone restrictions require careful navigation. "
        : ""
    }Consider developing mitigation strategies for identified risks and consulting with local authorities to ensure compliance. Additional resources or partnerships may be needed.`;
  } else {
    recommendation = `This location faces significant challenges for rocket launch activities. ${
      zoneValidation.severity === "danger"
        ? "Critical zone violations make this location unsuitable. "
        : ""
    }Multiple factors including ${
      legal.overall.score < 50 ? "regulatory barriers, " : ""
    }${
      resources.overall.score < 50 ? "resource limitations, " : ""
    }and ${
      geographical.overall.score < 50 ? "geographical constraints " : "other challenges "
    }suggest exploring alternative locations would be advisable.`;
  }

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
