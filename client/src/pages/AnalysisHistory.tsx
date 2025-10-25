import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Rocket, TrendingUp, ArrowRight } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function AnalysisHistory() {
  const { data: analyses, isLoading } = useQuery<AnalysisResult[]>({
    queryKey: ["/api/analyses"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70)
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Feasible
        </Badge>
      );
    if (score >= 40)
      return (
        <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
          Caution
        </Badge>
      );
    return (
      <Badge variant="destructive">
        Not Recommended
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Rocket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Analyses Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start analyzing rocket launch locations to build your history.
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-start-analysis">
              Start Your First Analysis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Analysis History
        </h1>
        <p className="text-muted-foreground">
          Review your previous rocket launch feasibility assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="p-6 hover-elevate cursor-pointer"
            data-testid={`card-analysis-${analysis.id}`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold truncate" data-testid={`text-location-${analysis.id}`}>
                      {analysis.location.city || "Unknown Location"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {analysis.location.displayName ||
                      `${analysis.location.latitude.toFixed(4)}, ${analysis.location.longitude.toFixed(4)}`}
                  </p>
                </div>
                {getScoreBadge(analysis.overallScore)}
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Overall Score</span>
                <span
                  className={cn("text-2xl font-bold font-mono", getScoreColor(analysis.overallScore))}
                  data-testid={`text-score-${analysis.id}`}
                >
                  {analysis.overallScore}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {analysis.rocketConfig.category === "model" ? "Model Rocket" : "Industrial Rocket"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link href={`/analysis/${analysis.id}`}>
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid={`button-view-${analysis.id}`}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
