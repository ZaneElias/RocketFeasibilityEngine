import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Scale,
  Mountain,
  Globe,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult, FeasibilityScore } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  score: FeasibilityScore;
  details: { label: string; score: FeasibilityScore }[];
}

function CategoryCard({ title, icon, score, details }: CategoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "feasible":
        return "text-green-600 dark:text-green-400";
      case "caution":
        return "text-yellow-600 dark:text-yellow-400";
      case "not_recommended":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "feasible":
        return <CheckCircle2 className="h-4 w-4" />;
      case "caution":
        return <AlertCircle className="h-4 w-4" />;
      case "not_recommended":
        return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6 space-y-4 hover-elevate">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">Overall Assessment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono">{score.score}</div>
          <div className={cn("text-xs font-medium flex items-center gap-1", getStatusColor(score.status))}>
            {getStatusIcon(score.status)}
            {score.status.replace("_", " ").toUpperCase()}
          </div>
        </div>
      </div>

      <Progress value={score.score} className="h-2" />

      <div className="pt-2 space-y-2">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md"
          >
            <span className="text-sm">{detail.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold">{detail.score.score}</span>
              <div className={cn("", getStatusColor(detail.score.status))}>
                {getStatusIcon(detail.score.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground pt-2">{score.details}</p>
    </Card>
  );
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const getOverallStatus = () => {
    if (result.overallScore >= 70) return "feasible";
    if (result.overallScore >= 40) return "caution";
    return "not_recommended";
  };

  const getOverallStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case "feasible":
        return "text-green-600 dark:text-green-400 border-green-600 dark:border-green-400";
      case "caution":
        return "text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400";
      case "not_recommended":
        return "text-red-600 dark:text-red-400 border-red-600 dark:border-red-400";
    }
  };

  const categories = [
    {
      title: "Resources & Availability",
      icon: <Package className="h-6 w-6 text-primary" />,
      score: result.resources.overall,
      details: [
        { label: "Materials", score: result.resources.materials },
        { label: "Expertise", score: result.resources.expertise },
        { label: "Facilities", score: result.resources.facilities },
      ],
    },
    {
      title: "Government & Legality",
      icon: <Scale className="h-6 w-6 text-primary" />,
      score: result.legal.overall,
      details: [
        { label: "Permits", score: result.legal.permits },
        { label: "Regulations", score: result.legal.regulations },
        { label: "Restrictions", score: result.legal.restrictions },
      ],
    },
    {
      title: "Geographical Status",
      icon: <Mountain className="h-6 w-6 text-primary" />,
      score: result.geographical.overall,
      details: [
        { label: "Terrain", score: result.geographical.terrain },
        { label: "Weather", score: result.geographical.weather },
        { label: "Accessibility", score: result.geographical.accessibility },
      ],
    },
    {
      title: "Geopolitical Status",
      icon: <Globe className="h-6 w-6 text-primary" />,
      score: result.geopolitical.overall,
      details: [
        { label: "Stability", score: result.geopolitical.stability },
        { label: "Cooperation", score: result.geopolitical.cooperation },
        { label: "Risks", score: result.geopolitical.risks },
      ],
    },
    {
      title: "Best Time & Seasonality",
      icon: <Clock className="h-6 w-6 text-primary" />,
      score: result.timing.overall,
      details: [
        { label: "Seasonality", score: result.timing.seasonality },
        { label: "Current Conditions", score: result.timing.currentConditions },
      ],
    },
    {
      title: "Practicality Assessment",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      score: result.practicality.overall,
      details: [
        { label: "Cost", score: result.practicality.cost },
        { label: "Timeline", score: result.practicality.timeline },
        { label: "Success Probability", score: result.practicality.successProbability },
      ],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8 pb-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">Feasibility Analysis Results</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive assessment of your rocket launch site based on location, resources,
          regulations, and environmental factors.
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-semibold text-muted-foreground">Overall Feasibility Score</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {result.location.city && result.location.country
                ? `${result.location.city}, ${result.location.country}`
                : result.location.displayName || "Selected Location"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {result.location.latitude.toFixed(6)}, {result.location.longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-40 w-40 rounded-full border-8 flex items-center justify-center bg-background">
                <div className="text-center">
                  <div
                    className={cn("text-5xl font-bold font-mono", getOverallStatusColor())}
                    data-testid="text-overall-score"
                  >
                    {result.overallScore}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">out of 100</div>
                </div>
              </div>
              <svg className="absolute inset-0 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={cn("transition-all duration-1000", getOverallStatusColor())}
                  strokeDasharray={`${(result.overallScore / 100) * 477.5} 477.5`}
                />
              </svg>
            </div>

            <div className="space-y-2">
              <Badge
                variant={getOverallStatus() === "feasible" ? "default" : "outline"}
                className={cn("text-sm px-4 py-1.5", getOverallStatusColor())}
              >
                {getOverallStatus().replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {result.zoneValidation.warnings.length > 0 && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Zone Validation Warnings
              </h4>
              <div className="space-y-2">
                {result.zoneValidation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                    <Badge variant="outline" className="text-xs mb-1">
                      {warning.type.replace("_", " ")}
                    </Badge>
                    <p>{warning.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <CategoryCard key={index} {...category} />
        ))}
      </div>

      {result.timing.optimalWindow && (
        <Card className="p-6 bg-accent/30 border-accent-border">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-accent-foreground">Optimal Launch Window</h4>
              <p className="text-sm text-muted-foreground">{result.timing.optimalWindow}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h4 className="font-semibold mb-3">Final Recommendation</h4>
        <p className="text-muted-foreground leading-relaxed">{result.recommendation}</p>
      </Card>

      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          data-testid="button-new-analysis"
          aria-label="Start new analysis"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <Button
          variant="outline"
          size="lg"
          data-testid="button-export-report"
          aria-label="Export report"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
}
