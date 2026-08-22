"use client";

import { useLanguage } from "@/lib/language-context";

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: "50,000+", label: t("patientsServed") },
    { value: "200+", label: t("expertDoctors") },
    { value: "50+", label: t("partnerHospitals") },
    { value: "95%", label: t("aiAccuracy") },
  ];

  return (
    <section className="bg-primary px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

