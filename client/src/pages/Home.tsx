import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { RocketTypeSelector } from "@/components/RocketTypeSelector";
import { LocationPicker } from "@/components/LocationPicker";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type {
  RocketConfig,
  Location,
  AnalysisResult,
  AnalyzeLocationRequest,
} from "@shared/schema";
import heroBackground from "@assets/generated_images/Space_technology_hero_background_e4a533f4.png";

const steps = [
  { id: 1, label: "Rocket Type", description: "Select configuration" },
  { id: 2, label: "Location", description: "Choose launch site" },
  { id: 3, label: "Analysis", description: "Processing data" },
  { id: 4, label: "Results", description: "View assessment" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [rocketConfig, setRocketConfig] = useState<RocketConfig | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (request: AnalyzeLocationRequest) => {
      const response = await apiRequest("POST", "/api/analyze", request);
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setCurrentStep(4);
    },
    onError: (error: any) => {
      console.error("Analysis failed:", error);
      setCurrentStep(2);
    },
  });

  const handleRocketSelect = (config: RocketConfig) => {
    setRocketConfig(config);
    setCurrentStep(2);
  };

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    
    try {
      const response = await apiRequest("POST", "/api/reverse-geocode", {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      const geocodeData = await response.json();
      
      const enrichedLocation: Location = {
        ...location,
        country: geocodeData.country,
        city: geocodeData.city,
        state: geocodeData.state,
        displayName: geocodeData.displayName,
      };

      if (rocketConfig) {
        setCurrentStep(3);
        await analyzeMutation.mutateAsync({
          location: enrichedLocation,
          rocketConfig,
        });
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      if (rocketConfig) {
        setCurrentStep(3);
        await analyzeMutation.mutateAsync({
          location,
          rocketConfig,
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setRocketConfig(null);
    setSelectedLocation(null);
    setAnalysisResult(null);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Rocket Feasibility Analyzer</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Precision Launch Site Analysis
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {currentStep === 1 && (
        <div
          className="relative py-20 px-4 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroBackground})`,
          }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Launch Your Vision with Confidence
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Comprehensive feasibility analysis for rocket launches anywhere in the world. Get
              detailed insights on resources, regulations, geography, and optimal timing.
            </p>
          </div>
        </div>
      )}

      <div className="py-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      <main className="pb-16">
        {currentStep > 1 && currentStep < 4 && (
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              data-testid="button-back"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}

        {currentStep === 1 && <RocketTypeSelector onSelect={handleRocketSelect} />}

        {currentStep === 2 && <LocationPicker onLocationSelect={handleLocationSelect} />}

        {currentStep === 3 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Analyzing Location</h3>
              <p className="text-muted-foreground max-w-md">
                Processing comprehensive feasibility assessment across all categories...
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && analysisResult && (
          <AnalysisResults result={analysisResult} onReset={handleReset} />
        )}
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Rocket Feasibility Analyzer. Precision analysis for
            safe and compliant rocket launches.
          </p>
        </div>
      </footer>
    </div>
  );
}
