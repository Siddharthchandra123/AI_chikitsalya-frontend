"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Navigation as NavIcon,
} from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (to avoid SSR issues)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

// Lazy load Leaflet to avoid SSR issues
let L: any = null;
let ambulanceIcon: any = null;
let userIcon: any = null;

const initLeafletIcons = () => {
  if (typeof window !== 'undefined' && !L) {
    L = require('leaflet');
    ambulanceIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448327.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    userIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/10421/10421771.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }
};


const ambulances = [
  {
    id: "AMB-001",
    type: "Advanced Life Support",
    distance: "1.2 km",
    eta: "4 min",
    driver: "John Smith",
    phone: "+1 555-0101",
    status: "available",
  },
  {
    id: "AMB-002",
    type: "Basic Life Support",
    distance: "2.5 km",
    eta: "8 min",
    driver: "Sarah Wilson",
    phone: "+1 555-0102",
    status: "available",
  },
  {
    id: "AMB-003",
    type: "Patient Transport",
    distance: "3.1 km",
    eta: "12 min",
    driver: "Mike Johnson",
    phone: "+1 555-0103",
    status: "en-route",
  },
];

export default function AmbulancePage() {
  const [isEmergency, setIsEmergency] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "searching" | "assigned" | "arriving"
  >("idle");
  const [assignedAmbulance, setAssignedAmbulance] = useState<
    (typeof ambulances)[0] | null
  >(null);
  const [countdown, setCountdown] = useState(0);
  const [ambulancePos, setAmbulancePos] = useState<[number, number]>([28.6139, 77.2090]); // Delhi Start
  const [userPos, setUserPos] = useState<[number, number]>([28.6239, 77.2190]); // Near Delhi

  useEffect(() => {
    initLeafletIcons();
  }, []);

  useEffect(() => {
    if (bookingStatus === "assigned" && countdown > 0) {
      const interval = setInterval(() => {
        setAmbulancePos(prev => {
          const latDiff = (userPos[0] - prev[0]) * 0.1;
          const lonDiff = (userPos[1] - prev[1]) * 0.1;
          return [prev[0] + latDiff, prev[1] + lonDiff];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [bookingStatus, countdown, userPos]);

  useEffect(() => {
    if (bookingStatus === "searching") {

      const timer = setTimeout(() => {
        setAssignedAmbulance(ambulances[0]);
        setBookingStatus("assigned");
        setCountdown(4 * 60);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && bookingStatus === "assigned") {
      setBookingStatus("arriving");
    }
  }, [countdown, bookingStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEmergencyCall = () => {
    setIsEmergency(true);
    setBookingStatus("searching");
  };

  const resetBooking = () => {
    setIsEmergency(false);
    setBookingStatus("idle");
    setAssignedAmbulance(null);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emergency/10">
            <Truck className="h-8 w-8 text-emergency" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Ambulance Services
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Request emergency medical transport or track your assigned ambulance
            in real-time.
          </p>
        </div>

        {bookingStatus === "idle" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Emergency Request
              </h2>
              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Your Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your address"
                      className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      defaultValue="123 Main Street, Downtown"
                    />
                    <Button variant="outline" size="icon">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Emergency Type
                  </label>
                  <select className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Medical Emergency</option>
                    <option>Accident</option>
                    <option>Cardiac Issue</option>
                    <option>Pregnancy/Labor</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button
                onClick={handleEmergencyCall}
                className="w-full bg-emergency text-white hover:bg-emergency/90"
                size="lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Request Ambulance Now
              </Button>

              <div className="mt-4 rounded-lg bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    For life-threatening emergencies, please also call your
                    local emergency number (911).
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Available Ambulances Nearby
              </h2>
              {ambulances.map((amb) => (
                <Card key={amb.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          amb.status === "available"
                            ? "bg-green-100"
                            : "bg-amber-100"
                        }`}
                      >
                        <Truck
                          className={`h-6 w-6 ${
                            amb.status === "available"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{amb.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {amb.type}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {amb.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {amb.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        amb.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {amb.status === "available" ? "Available" : "En Route"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {bookingStatus === "searching" && (
          <Card className="mx-auto max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 animate-ping rounded-full bg-emergency/30" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emergency/10">
                  <Truck className="h-10 w-10 text-emergency" />
                </div>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Finding Nearest Ambulance
            </h2>
            <p className="text-muted-foreground">
              Please wait while we locate the closest available unit...
            </p>
          </Card>
        )}

        {(bookingStatus === "assigned" || bookingStatus === "arriving") &&
          assignedAmbulance && (
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <div className="bg-primary p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-foreground/80">
                        Ambulance Assigned
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary-foreground">
                        {assignedAmbulance.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary-foreground/80">ETA</p>
                      <p className="mt-1 text-3xl font-bold text-primary-foreground">
                        {formatTime(countdown)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 rounded-lg bg-secondary p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <NavIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {bookingStatus === "arriving"
                              ? "Ambulance Arrived!"
                              : "On the way"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignedAmbulance.distance} away
                          </p>
                        </div>
                      </div>
                      {bookingStatus === "arriving" && (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {assignedAmbulance.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Driver
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {assignedAmbulance.driver}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Contact
                      </span>
                      <a
                        href={`tel:${assignedAmbulance.phone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {assignedAmbulance.phone}
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Driver
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MapPin className="mr-2 h-4 w-4" />
                      Track Live
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="h-fit p-6">
                <h3 className="mb-4 font-semibold text-foreground">
                  Live Tracking Prototype
                </h3>
                <div className="aspect-video overflow-hidden rounded-lg bg-secondary relative z-0">
                  {typeof window !== 'undefined' && (
                    <MapContainer 
                      center={userPos} 
                      zoom={13} 
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {ambulanceIcon && (
                        <Marker position={ambulancePos} icon={ambulanceIcon}>
                          <Popup>Ambulance {assignedAmbulance.id}</Popup>
                        </Marker>
                      )}
                      {userIcon && (
                        <Marker position={userPos} icon={userIcon}>
                          <Popup>Your Location</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  )}
                </div>
                <Button onClick={resetBooking} variant="outline" className="mt-4 w-full">
                  Cancel Request
                </Button>
              </Card>

            </div>
          )}
      </main>
      <Footer />
    </div>
  );
}

