import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeLocationWithAI(locationData: {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  state?: string;
  displayName?: string;
  rocketType: string;
  zoneWarnings: string[];
}): Promise<{
  resourcesInsight: string;
  legalInsight: string;
  geographicalInsight: string;
  geopoliticalInsight: string;
  recommendation: string;
}> {
  try {
    const prompt = `You are an expert aerospace consultant analyzing rocket launch feasibility. 

Location Details:
- Coordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}
- Location: ${locationData.displayName || 'Unknown'}
- City: ${locationData.city || 'N/A'}
- State/Region: ${locationData.state || 'N/A'}
- Country: ${locationData.country || 'N/A'}

Rocket Type: ${locationData.rocketType}

Zone Safety Warnings:
${locationData.zoneWarnings.length > 0 ? locationData.zoneWarnings.join('\n') : 'No major safety warnings detected'}

Provide a realistic, detailed feasibility analysis in JSON format with these fields:
{
  "resourcesInsight": "Brief analysis of local availability of materials, expertise, and facilities specific to this location",
  "legalInsight": "Analysis of regulatory environment, permits, and legal requirements for this country/region",
  "geographicalInsight": "Analysis of terrain, weather patterns, and accessibility specific to these coordinates",
  "geopoliticalInsight": "Analysis of political stability, international cooperation, and regional factors for this location",
  "recommendation": "Overall recommendation considering all factors for this specific location (2-3 sentences)"
}

Be specific to the actual location. Reference real geographical features, climate, political situation, and infrastructure of the area. Do not mention airports or facilities unless they were identified in the zone warnings.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert aerospace consultant specializing in rocket launch site feasibility analysis. Provide accurate, location-specific insights based on real geographical, political, and infrastructure data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      resourcesInsight: result.resourcesInsight || "Analysis unavailable",
      legalInsight: result.legalInsight || "Analysis unavailable",
      geographicalInsight: result.geographicalInsight || "Analysis unavailable",
      geopoliticalInsight: result.geopoliticalInsight || "Analysis unavailable",
      recommendation: result.recommendation || "Unable to generate recommendation",
    };
  } catch (error: any) {
    console.error("OpenAI analysis error:", error);
    return {
      resourcesInsight: "AI analysis temporarily unavailable. Using standard assessment.",
      legalInsight: "AI analysis temporarily unavailable. Consult local regulations.",
      geographicalInsight: "AI analysis temporarily unavailable. Standard geographical factors apply.",
      geopoliticalInsight: "AI analysis temporarily unavailable. Standard regional assessment applies.",
      recommendation: "AI analysis temporarily unavailable. Recommend manual review of location suitability.",
    };
  }
}
