"use client";

import {
  ArrowRight,
  Shield,
  Clock,
  Award,
  Phone,
  Video,
  MessageSquare,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background px-4 py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-4 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-4 bottom-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <span className="text-muted-foreground">
                {t("aiPoweredHealthcare")}
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("yourComplete")}{" "}
              <span className="text-primary">{t("healthcareCompanion")}</span>
            </h1>

            <p className="max-w-lg text-pretty text-lg text-muted-foreground">
              {t("heroDescription")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/ai-detection">
                  {t("tryAIDiagnosis")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/opd-booking">{t("bookAppointment")}</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t("hipaaCompliant")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("yourDataSecure")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t("available247")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("alwaysHere")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t("aiAccuracy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("aiDetectionLabel")}
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20" />
              <div className="absolute inset-4 rounded-2xl bg-card shadow-2xl">
                <div className="flex h-full flex-col items-center justify-center p-8">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-10 w-10 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    AI Chikitsalya
                  </h3>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("footerTagline")}
                  </p>
                  <div className="mt-6 grid w-full grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <p className="text-lg font-bold text-primary">50K+</p>
                      <p className="text-xs text-muted-foreground">
                        {t("patients")}
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <p className="text-lg font-bold text-accent">200+</p>
                      <p className="text-xs text-muted-foreground">
                        {t("doctorsLabel")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rural Health Quick Access */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
            {t("ruralHealthFeatures")}
          </h2>
          <p className="mb-8 text-center text-muted-foreground">
            {t("ruralDescription")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emergency/10 shrink-0">
                  <Phone className="h-5 w-5 text-emergency" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("emergencyHelpline")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("tollFreeNumber")}
                  </p>
                  <Button size="sm" variant="destructive" className="w-full">
                    <Phone className="h-4 w-4 mr-1" />
                    {t("callNow")}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("teleconsultation")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("teleconsultDesc")}
                  </p>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href="/doctors">{t("bookNow")}</Link>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                  <MessageSquare className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("smsService")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("healthWorkerDesc")}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    {t("sendSMS")}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0">
                  <MapPin className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("nearestCenter")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    2.5 {t("kmAway")}
                  </p>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href="/hospitals">{t("findHospitals")}</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

