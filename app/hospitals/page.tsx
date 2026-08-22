"use client";

import { useState, useEffect } from "react";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Star,
  Phone,
  Clock,
  Bed,
  Navigation as NavIcon,
  Search,
  Filter,
} from "lucide-react";

const filters = ["All", "Emergency", "Multispeciality", "Clinic", "General"];


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}



interface Hospital {
  id: string | number;
  name: string;
  type: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  phone: string;
  emergency: boolean;
  beds: { total: number; available: number };
  departments: string[];
  timing: string;
  lat?: number;
  lon?: number;
}

export default function HospitalsPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  useEffect(() => {
    // Auto-load local data on mount
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/hospitals?lat=28.6139&lon=77.2090'); // Default to Delhi for initial feed
        const data = await res.json();
        setHospitalsList(data);
      } catch (error) {
        console.error("Initial load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const scanNearby = () => {

    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`/api/hospitals?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("API failed");
            const data = await res.json();
            
            // Calculate real distances
            const withDistances = data.map((h: any) => {
              if (h.lat && h.lon) {
                const d = calculateDistance(latitude, longitude, h.lat, h.lon);
                return { ...h, distance: `${d.toFixed(1)} km` };
              }
              return h;
            });

            setHospitalsList(withDistances);
          } catch (error) {
            console.error("Scan error:", error);
            alert("Failed to fetch nearby hospitals. Using local data only.");
          } finally {
            setLoading(false);
          }

        },
        (error) => {
          console.error("Location error:", error);
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation not supported");
      setLoading(false);
    }
  };

  const filteredHospitals = hospitalsList.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Emergency" && hospital.emergency) ||
      hospital.type.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });



  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Nearby Hospitals
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Find hospitals near you with real-time bed availability and
            emergency services information.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hospitals by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button 
              onClick={scanNearby} 
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MapPin className={`mr-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              {loading ? "Scanning..." : "Scan Environment"}
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>

          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {filteredHospitals.map((hospital: Hospital) => (
              <Card
                key={hospital.id}
                className={`cursor-pointer p-6 transition-all hover:shadow-md ${
                  selectedHospital?.id === hospital.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {hospital.name}
                      </h3>
                      {hospital.emergency && (
                        <span className="rounded-full bg-emergency/10 px-2 py-0.5 text-xs font-medium text-emergency">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hospital.type} • {hospital.address}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">
                          {hospital.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({hospital.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {hospital.distance}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {hospital.timing}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hospital.departments.slice(0, 3).map((dept: string) => (
                        <span
                          key={dept}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {dept}
                        </span>
                      ))}

                      {hospital.departments.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{hospital.departments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-accent" />
                      <span className="text-lg font-bold text-accent">
                        {hospital.beds.available}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">beds available</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {selectedHospital ? (
              <Card className="sticky top-24 p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  {selectedHospital.name}
                </h3>

                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-secondary">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Map View
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedHospital.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${selectedHospital.phone}`}
                      className="text-primary hover:underline"
                    >
                      {selectedHospital.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedHospital.timing}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-secondary p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Bed Availability
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedHospital.beds.available} /{" "}
                      {selectedHospital.beds.total}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${
                          (selectedHospital.beds.available /
                            selectedHospital.beds.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <NavIcon className="mr-2 h-4 w-4" />
                    Directions
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Select a hospital to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

