import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Building2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RocketCategory, ModelRocketType, SafetyLevel } from "@shared/schema";
import modelRocketImg from "@assets/generated_images/Model_hobby_rocket_illustration_66d30598.png";
import industrialRocketImg from "@assets/generated_images/Industrial_rocket_illustration_fe00cf57.png";

interface RocketTypeSelectorProps {
  onSelect: (config: {
    category: RocketCategory;
    modelType?: ModelRocketType;
    safetyLevel?: SafetyLevel;
  }) => void;
}

export function RocketTypeSelector({ onSelect }: RocketTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<RocketCategory | null>(null);
  const [selectedModelType, setSelectedModelType] = useState<ModelRocketType | null>(null);
  const [selectedSafety, setSelectedSafety] = useState<SafetyLevel | null>(null);

  const handleCategorySelect = (category: RocketCategory) => {
    setSelectedCategory(category);
    setSelectedModelType(null);
    setSelectedSafety(null);
  };

  const handleContinue = () => {
    if (!selectedCategory) return;
    
    if (selectedCategory === "model" && selectedModelType && selectedSafety) {
      onSelect({
        category: selectedCategory,
        modelType: selectedModelType,
        safetyLevel: selectedSafety,
      });
    } else if (selectedCategory === "industrial") {
      onSelect({ category: selectedCategory });
    }
  };

  const canContinue =
    selectedCategory === "industrial" ||
    (selectedCategory === "model" && selectedModelType && selectedSafety);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">Select Rocket Type</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the type of rocket project you're planning to evaluate the feasibility and
          requirements for your specific use case.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className={cn(
            "p-8 cursor-pointer transition-all hover-elevate border-2",
            selectedCategory === "model"
              ? "border-primary shadow-lg"
              : "border-border"
          )}
          onClick={() => handleCategorySelect("model")}
          data-testid="card-rocket-model"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-48 w-48 flex items-center justify-center">
              <img
                src={modelRocketImg}
                alt="Model Rocket"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Model Rocket</h3>
              </div>
              <p className="text-muted-foreground">
                For hobby projects, educational purposes, and small-scale launches with safety
                considerations and basic requirements.
              </p>
            </div>
            {selectedCategory === "model" && (
              <Badge variant="default" className="text-sm px-4 py-1">
                Selected
              </Badge>
            )}
          </div>
        </Card>

        <Card
          className={cn(
            "p-8 cursor-pointer transition-all hover-elevate border-2",
            selectedCategory === "industrial"
              ? "border-primary shadow-lg"
              : "border-border"
          )}
          onClick={() => handleCategorySelect("industrial")}
          data-testid="card-rocket-industrial"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-48 w-48 flex items-center justify-center">
              <img
                src={industrialRocketImg}
                alt="Industrial Rocket"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Industrial Rocket</h3>
              </div>
              <p className="text-muted-foreground">
                For commercial, research, or large-scale applications requiring extensive
                infrastructure, permits, and regulatory compliance.
              </p>
            </div>
            {selectedCategory === "industrial" && (
              <Badge variant="default" className="text-sm px-4 py-1">
                Selected
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {selectedCategory === "model" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 bg-accent/50 rounded-lg border border-accent-border">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-accent-foreground">Model Rocket Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Please specify your project type and safety level to ensure accurate feasibility
                  analysis and regulatory requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Project Type</label>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedModelType === "hobby" ? "default" : "outline"}
                  onClick={() => setSelectedModelType("hobby")}
                  data-testid="button-model-hobby"
                  className="flex-1 min-w-32"
                >
                  Hobby Rocket
                </Button>
                <Button
                  variant={selectedModelType === "solo_project" ? "default" : "outline"}
                  onClick={() => setSelectedModelType("solo_project")}
                  data-testid="button-model-solo"
                  className="flex-1 min-w-32"
                >
                  Solo Project
                </Button>
                <Button
                  variant={selectedModelType === "team_project" ? "default" : "outline"}
                  onClick={() => setSelectedModelType("team_project")}
                  data-testid="button-model-team"
                  className="flex-1 min-w-32"
                >
                  Team Project
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Safety & Knowledge Level</label>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedSafety === "beginner" ? "default" : "outline"}
                  onClick={() => setSelectedSafety("beginner")}
                  data-testid="button-safety-beginner"
                  className="flex-1 min-w-32"
                >
                  Beginner
                </Button>
                <Button
                  variant={selectedSafety === "intermediate" ? "default" : "outline"}
                  onClick={() => setSelectedSafety("intermediate")}
                  data-testid="button-safety-intermediate"
                  className="flex-1 min-w-32"
                >
                  Intermediate
                </Button>
                <Button
                  variant={selectedSafety === "advanced" ? "default" : "outline"}
                  onClick={() => setSelectedSafety("advanced")}
                  data-testid="button-safety-advanced"
                  className="flex-1 min-w-32"
                >
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!canContinue}
          data-testid="button-continue-rocket"
          className="min-w-48"
        >
          Continue to Location Selection
        </Button>
      </div>
    </div>
  );
}
