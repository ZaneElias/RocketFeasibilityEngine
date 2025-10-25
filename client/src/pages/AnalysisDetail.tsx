import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Home as HomeIcon } from "lucide-react";
import { AnalysisResults } from "@/components/AnalysisResults";
import type { AnalysisResult } from "@shared/schema";

export default function AnalysisDetail() {
  const params = useParams<{ id: string }>();
  const analysisId = params.id;
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<AnalysisResult>({
    queryKey: [`/api/analyses/${analysisId}`],
    enabled: !!analysisId,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested analysis could not be found.
          </p>
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-4 mb-8">
        <Link href="/history">
          <Button variant="ghost" data-testid="button-back-to-history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" data-testid="button-back-to-home">
            <HomeIcon className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      <AnalysisResults
        result={analysis}
        onReset={() => {
          setLocation("/");
        }}
      />
    </div>
  );
}
