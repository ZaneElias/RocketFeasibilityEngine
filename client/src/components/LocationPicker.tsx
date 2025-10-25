import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Locate,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Location, ZoneValidation } from "@shared/schema";

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [zoneValidation, setZoneValidation] = useState<ZoneValidation | null>(null);

  const validateLocationMutation = useMutation({
    mutationFn: async (location: Location) => {
      return await apiRequest<ZoneValidation>("POST", "/api/validate-zone", { location });
    },
    onSuccess: (data) => {
      setZoneValidation(data);
    },
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
      
      const location: Location = {
        latitude: lat,
        longitude: lng,
      };
      
      setSelectedLocation(location);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarker = (lat: number, lng: number) => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div class="flex items-center justify-center">
            <div class="h-8 w-8 bg-primary rounded-full border-4 border-background shadow-lg animate-pulse"></div>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.setView([lat, lng], 13);
  };

  useEffect(() => {
    if (selectedLocation) {
      validateLocationMutation.mutate(selectedLocation);
    }
  }, [selectedLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarker(latitude, longitude);
        setSelectedLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        updateMarker(latitude, longitude);
        setSelectedLocation({
          latitude,
          longitude,
          displayName: display_name,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityIcon = () => {
    if (!zoneValidation) return null;
    
    switch (zoneValidation.severity) {
      case "safe":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "caution":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "danger":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getSeverityColor = () => {
    if (!zoneValidation) return "bg-muted";
    
    switch (zoneValidation.severity) {
      case "safe":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "caution":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "danger":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">Select Launch Location</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Click anywhere on the map or search for a specific location. We'll analyze the exact
          coordinates for safety zones and feasibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search for a city or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-location-search"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  data-testid="button-search-location"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleUseMyLocation}
                data-testid="button-use-my-location"
                className="sm:w-auto w-full"
              >
                <Locate className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </div>
            <div
              ref={mapRef}
              className="h-[500px] md:h-[600px] w-full"
              data-testid="map-container"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Selected Location
            </div>

            {selectedLocation ? (
              <div className="space-y-4">
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-semibold" data-testid="text-latitude">
                      {selectedLocation.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-semibold" data-testid="text-longitude">
                      {selectedLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>

                {selectedLocation.displayName && (
                  <div className="text-sm text-muted-foreground">
                    {selectedLocation.displayName}
                  </div>
                )}

                {validateLocationMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating location safety...
                  </div>
                )}

                {zoneValidation && (
                  <div className={cn("p-4 rounded-lg border space-y-3", getSeverityColor())}>
                    <div className="flex items-center gap-2 font-semibold">
                      {getSeverityIcon()}
                      <span className="capitalize">{zoneValidation.severity} Zone</span>
                    </div>

                    {zoneValidation.warnings.length > 0 && (
                      <div className="space-y-2">
                        {zoneValidation.warnings.map((warning, index) => (
                          <div key={index} className="text-sm space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {warning.type.replace("_", " ")}
                            </Badge>
                            <p className="text-foreground/90">{warning.message}</p>
                            {warning.distance !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Distance: {(warning.distance / 1000).toFixed(2)} km
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {zoneValidation.isValid && zoneValidation.warnings.length === 0 && (
                      <p className="text-sm text-foreground/90">
                        This location appears suitable for rocket launch activities based on initial
                        zone validation.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => onLocationSelect(selectedLocation)}
                  disabled={!selectedLocation}
                  data-testid="button-analyze-location"
                  className="w-full"
                  size="lg"
                >
                  Analyze This Location
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Click on the map or search for a location to begin analysis
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-accent/30 border-accent-border">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-accent-foreground">Precision Analysis</p>
              <p className="text-muted-foreground text-xs">
                Our system validates the exact coordinates against restricted zones including
                airports, schools, military bases, and urban areas to ensure compliance and safety.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
