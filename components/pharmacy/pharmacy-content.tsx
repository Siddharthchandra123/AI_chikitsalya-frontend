"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  MapPin,
  Star,
  Clock,
  Phone,
  Navigation as NavIcon,
  Search,
  Pill,
  CheckCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pharmacies = [
  {
    id: 1,
    name: "HealthPlus Pharmacy",
    address: "123 Main Street, Downtown",
    distance: "0.3 km",
    rating: 4.8,
    reviews: 156,
    phone: "+1 555-0301",
    timing: "8:00 AM - 10:00 PM",
    open: true,
    lat: 40.7128,
    lng: -74.006,
    medicines: ["Paracetamol", "Ibuprofen", "Amoxicillin", "Vitamins"],
    hasDelivery: true,
  },
  {
    id: 2,
    name: "MediCare Drugs",
    address: "456 Oak Avenue, Midtown",
    distance: "0.8 km",
    rating: 4.6,
    reviews: 98,
    phone: "+1 555-0302",
    timing: "24/7",
    open: true,
    lat: 40.7148,
    lng: -74.004,
    medicines: ["Insulin", "Blood Pressure Meds", "Antibiotics"],
    hasDelivery: true,
  },
  {
    id: 3,
    name: "Wellness Pharmacy",
    address: "789 Elm Street, Uptown",
    distance: "1.2 km",
    rating: 4.9,
    reviews: 234,
    phone: "+1 555-0303",
    timing: "9:00 AM - 9:00 PM",
    open: true,
    lat: 40.7108,
    lng: -74.008,
    medicines: ["Vitamins", "Supplements", "Organic Products"],
    hasDelivery: false,
  },
  {
    id: 4,
    name: "City Drugstore",
    address: "321 Pine Road, East Side",
    distance: "1.5 km",
    rating: 4.5,
    reviews: 67,
    phone: "+1 555-0304",
    timing: "7:00 AM - 11:00 PM",
    open: true,
    lat: 40.7168,
    lng: -74.002,
    medicines: ["Generic Medicines", "OTC Drugs", "First Aid"],
    hasDelivery: true,
  },
  {
    id: 5,
    name: "Family Health Pharmacy",
    address: "567 Cedar Lane, West End",
    distance: "2.0 km",
    rating: 4.7,
    reviews: 145,
    phone: "+1 555-0305",
    timing: "8:00 AM - 8:00 PM",
    open: false,
    lat: 40.7088,
    lng: -74.01,
    medicines: ["Pediatric Medicines", "Elderly Care", "Wellness Products"],
    hasDelivery: true,
  },
];

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
    (typeof pharmacies)[0] | null
  >(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);

  const filteredPharmacies = pharmacies.filter(
    (pharmacy) =>
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPharmacy = (pharmacy: (typeof pharmacies)[0]) => {
    setSelectedPharmacy(pharmacy);
    setMapCenter([pharmacy.lat, pharmacy.lng]);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <ShoppingBag className="h-8 w-8 text-success" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Medical Shops
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Find pharmacies near you with medicine availability, pricing, and home
          delivery options.
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredPharmacies.map((pharmacy) => (
              <Marker
                key={pharmacy.id}
                position={[pharmacy.lat, pharmacy.lng]}
                icon={createCustomIcon(selectedPharmacy?.id === pharmacy.id)}
                eventHandlers={{
                  click: () => handleSelectPharmacy(pharmacy),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold">{pharmacy.name}</h3>
                    <p className="text-sm text-gray-600">{pharmacy.address}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{pharmacy.rating}</span>
                      <span
                        className={`ml-2 ${pharmacy.open ? "text-green-600" : "text-red-600"}`}
                      >
                        {pharmacy.open ? "Open" : "Closed"}
                      </span>
                    </div>
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
              {filteredPharmacies.length} found
            </span>
          </div>

          <div className="max-h-[540px] space-y-4 overflow-y-auto pr-2">
            {filteredPharmacies.map((pharmacy) => (
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
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      pharmacy.open ? "bg-success/10" : "bg-muted"
                    }`}
                  >
                    <Pill
                      className={`h-6 w-6 ${pharmacy.open ? "text-success" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {pharmacy.name}
                      </h3>
                      {pharmacy.hasDelivery && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Delivery
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pharmacy.address}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{pharmacy.rating}</span>
                        <span className="text-muted-foreground">
                          ({pharmacy.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {pharmacy.distance}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {pharmacy.timing}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pharmacy.medicines.slice(0, 3).map((med) => (
                        <span
                          key={med}
                          className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        pharmacy.open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                      {pharmacy.open ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedPharmacy.timing}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${selectedPharmacy.phone}`}
                    className="text-primary hover:underline"
                  >
                    {selectedPharmacy.phone}
                  </a>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <NavIcon className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

