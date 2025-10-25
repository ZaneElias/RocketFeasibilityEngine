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
    
    const locationDesc = locationData.displayName || `${locationData.latitude.toFixed(2)}, ${locationData.longitude.toFixed(2)}`;
    const hasWarnings = locationData.zoneWarnings.length > 0;
    
    return {
      resourcesInsight: `Standard assessment for ${locationDesc}. ${locationData.country ? `In ${locationData.country}, ` : ''}resource availability depends on local infrastructure and proximity to aerospace suppliers.`,
      legalInsight: hasWarnings 
        ? `Zone restrictions detected at this location. Regulatory approval required. Consult local aviation authorities and obtain necessary permits before any launch activities.`
        : `Standard regulatory requirements apply. Check local aviation regulations and obtain necessary permits for ${locationData.rocketType} launches.`,
      geographicalInsight: `Location at ${locationData.latitude.toFixed(4)}°, ${locationData.longitude.toFixed(4)}°. Geographical assessment based on regional climate patterns and terrain characteristics.`,
      geopoliticalInsight: locationData.country 
        ? `Regional analysis for ${locationData.country}. Political and regulatory environment affects launch feasibility and permit requirements.`
        : `Regional stability and regulatory framework should be evaluated for long-term operations.`,
      recommendation: hasWarnings
        ? `This location has zone restrictions that significantly impact launch feasibility. Review all safety warnings and consult with local authorities before proceeding.`
        : `Standard feasibility applies to this location. Verify local regulations and ensure all safety protocols are followed for ${locationData.rocketType} activities.`,
    };
  }
}
