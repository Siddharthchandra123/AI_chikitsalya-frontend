"use client";

import Link from "next/link";
import { Heart, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                AI Chikitsalya
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("footerTagline")}</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              {t("services")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/ai-detection"
                  className="transition-colors hover:text-foreground"
                >
                  {t("aiDetection")}
                </Link>
              </li>
              <li>
                <Link
                  href="/opd-booking"
                  className="transition-colors hover:text-foreground"
                >
                  {t("opdBooking")}
                </Link>
              </li>
              <li>
                <Link
                  href="/ambulance"
                  className="transition-colors hover:text-foreground"
                >
                  {t("ambulance")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pharmacy"
                  className="transition-colors hover:text-foreground"
                >
                  {t("pharmacy")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/hospitals"
                  className="transition-colors hover:text-foreground"
                >
                  {t("findHospitals")}
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors"
                  className="transition-colors hover:text-foreground"
                >
                  {t("ourDoctors")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              {t("contact")}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@medicare.plus</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>123 Healthcare Ave, Medical District</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 AI Chikitsalya. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}

