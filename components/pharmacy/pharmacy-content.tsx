"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  MapPin,
  Phone,
  Navigation as NavIcon,
  Search,
  Pill,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pharmacies } from "@/components/pharmacy/pharmacy_1";



// Custom marker icon
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${isSelected ? "#4f46e5" : "#10b981"};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-9-1h4v1h-4V5zm0 10h-2v2H6v-2H4v-2h2v-2h2v2h2v2zm8 0h-6v-2h6v2z"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

function MapUpdater({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function PharmacyContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<
    (typeof pharmacies)[number] | null
  >(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.9734, 78.6569]);
  const [displayLimit, setDisplayLimit] = useState(50);

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      (pharmacy.name && pharmacy.name.toLowerCase().includes(query)) ||
      (pharmacy.address && pharmacy.address.toLowerCase().includes(query)) ||
      (pharmacy.state && pharmacy.state.toLowerCase().includes(query)) ||
      (pharmacy.district && pharmacy.district.toLowerCase().includes(query)) ||
      (pharmacy.pincode && String(pharmacy.pincode).includes(query)) ||
      (pharmacy.kendraCode && pharmacy.kendraCode.toLowerCase().includes(query))
    );
  });

  const handleSelectPharmacy = (pharmacy: (typeof pharmacies)[number]) => {
    setSelectedPharmacy(pharmacy);
    if (pharmacy.lat != null && pharmacy.lng != null) {
      setMapCenter([pharmacy.lat, pharmacy.lng]);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <ShoppingBag className="h-8 w-8 text-success" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Jan Aushadhi Kendras
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Find Government of India Jan Aushadhi Kendras across India by name,
          address, district, state, PIN code, or Kendra code.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pharmacies or medicines..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayLimit(50);
            }}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Map Section */}
        <Card className="h-[500px] overflow-hidden lg:h-[600px]">
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            {filteredPharmacies
              .filter((pharmacy) => pharmacy.lat != null && pharmacy.lng != null)
              .map((pharmacy) => (
                <Marker
                  key={pharmacy.id}
                  position={[pharmacy.lat!, pharmacy.lng!]}
                  icon={createCustomIcon(selectedPharmacy?.id === pharmacy.id)}
                  eventHandlers={{
                    click: () => handleSelectPharmacy(pharmacy),
                  }}
                >
                  <Popup>
                    <div className="min-w-[240px]">
                      <h3 className="font-semibold">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600">{pharmacy.address}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {pharmacy.district}, {pharmacy.state} • PIN {pharmacy.pincode}
                      </p>
                      {pharmacy.phone && (
                        <p className="mt-2 text-sm">
                          <Phone className="mr-1 inline h-3 w-3" />
                          {pharmacy.phone}
                        </p>
                      )}
                      <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        Jan Aushadhi Kendra
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </Card>

        {/* Pharmacy List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Nearby Pharmacies
            </h2>
            <span className="text-sm text-muted-foreground">
              Showing {Math.min(displayLimit, filteredPharmacies.length)} of {filteredPharmacies.length} found
            </span>
          </div>

          <div className="max-h-[540px] space-y-4 overflow-y-auto pr-2">
            {filteredPharmacies.slice(0, displayLimit).map((pharmacy) => (
              <Card
                key={pharmacy.id}
                className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                  selectedPharmacy?.id === pharmacy.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => handleSelectPharmacy(pharmacy)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <Pill className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {pharmacy.name}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Jan Aushadhi
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {pharmacy.address}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {pharmacy.district}, {pharmacy.state}
                      </div>

                      <span className="text-muted-foreground">
                        PIN: {pharmacy.pincode}
                      </span>

                      {pharmacy.kendraCode && (
                        <span className="text-muted-foreground">
                          Kendra: {pharmacy.kendraCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredPharmacies.length > displayLimit && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setDisplayLimit((prev) => prev + 50)}
              >
                Load More Pharmacies
              </Button>
            )}
          </div>

          {/* Selected Pharmacy Details */}
          {selectedPharmacy && (
            <Card className="mt-4 bg-secondary/30 p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                {selectedPharmacy.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedPharmacy.address}
                </div>

                <div className="text-muted-foreground">
                  {selectedPharmacy.district}, {selectedPharmacy.state} • PIN{" "}
                  {selectedPharmacy.pincode}
                </div>

                {selectedPharmacy.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${selectedPharmacy.phone}`}
                      className="text-primary hover:underline"
                    >
                      {selectedPharmacy.phone}
                    </a>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Kendra Code: {selectedPharmacy.kendraCode}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {selectedPharmacy.phone && (
                  <Button className="flex-1" size="sm" asChild>
                    <a href={`tel:${selectedPharmacy.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </a>
                  </Button>
                )}

                {selectedPharmacy.lat != null &&
                  selectedPharmacy.lng != null && (
                    <Button variant="outline" className="flex-1" size="sm" asChild>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <NavIcon className="mr-2 h-4 w-4" />
                        Directions
                      </a>
                    </Button>
                  )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
