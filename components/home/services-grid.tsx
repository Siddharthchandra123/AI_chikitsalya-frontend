"use client";

import Link from "next/link";
import {
  Brain,
  Calendar,
  Truck,
  MapPin,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Video,
  UserCheck,
  Bus,
  Plane,
  LogOut,
  PackageOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

export function ServicesGrid() {
  const { t } = useLanguage();

  const services = [
    {
      title: t("aiDiseaseDetection"),
      description: t("aiDiseaseDesc"),
      icon: Brain,
      href: "/ai-detection",
      color: "bg-primary/10 text-primary",
      featured: true,
    },
    {
      title: t("opdBookingTitle"),
      description: t("opdBookingDesc"),
      icon: Calendar,
      href: "/opd-booking",
      color: "bg-accent/10 text-accent",
    },
    {
      title: t("ambulanceTracking"),
      description: t("ambulanceDesc"),
      icon: Truck,
      href: "/ambulance",
      color: "bg-emergency/10 text-emergency",
    },
    {
      title: t("nearbyHospitals"),
      description: t("hospitalsDesc"),
      icon: MapPin,
      href: "/hospitals",
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("doctorProfiles"),
      description: t("doctorsDesc"),
      icon: Users,
      href: "/doctors",
      color: "bg-accent/10 text-accent",
    },
    {
      title: t("medicalShops"),
      description: t("pharmacyDesc"),
      icon: ShoppingBag,
      href: "/pharmacy",
      color: "bg-success/10 text-success",
    },
    {
      title: t("patientDischarge"),
      description: t("patientDischargeDesc"),
      icon: PackageOpen,
      href: "/insurance/login",
      color: "bg-primary/10 text-primary",
    },
  ];

  const ruralServices = [
    {
      title: t("teleconsultation"),
      description: t("teleconsultDesc"),
      icon: Video,
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("healthWorkerConnect"),
      description: t("healthWorkerDesc"),
      icon: UserCheck,
      color: "bg-accent/10 text-accent",
    },
    {
      title: t("mobileClinic"),
      description: t("mobileClinicDesc"),
      icon: Bus,
      color: "bg-success/10 text-success",
    },
    {
      title: t("medicineDroneDelivery"),
      description: t("droneDeliveryDesc"),
      icon: Plane,
      color: "bg-emergency/10 text-emergency",
    },
  ];

  return (
    <section className="bg-secondary/30 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {t("ourServices")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("servicesDescription")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href}>
                <Card
                  className={`group relative h-full overflow-hidden p-6 transition-all hover:shadow-lg ${
                    service.featured ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${service.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Rural-Specific Services */}
        <div className="mt-16">
          <h3 className="mb-6 text-center text-2xl font-bold text-foreground">
            {t("ruralHealthFeatures")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ruralServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.color} mb-3`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {service.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

