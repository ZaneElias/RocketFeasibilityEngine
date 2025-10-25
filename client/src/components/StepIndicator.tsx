import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative flex-1">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                  currentStep > step.id && "border-primary bg-primary",
                  currentStep === step.id && "border-primary scale-110",
                  currentStep < step.id && "border-border"
                )}
                data-testid={`step-indicator-${step.id}`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      currentStep === step.id ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <div className="mt-3 text-center max-w-32">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                  data-testid={`text-step-${step.id}-label`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1 hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-border mx-2 mb-12 relative">
                <div
                  className={cn(
                    "absolute inset-0 bg-primary transition-all duration-500",
                    currentStep > step.id ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
