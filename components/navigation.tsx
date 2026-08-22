"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  Truck,
  MapPin,
  Users,
  ShoppingBag,
  Menu,
  X,
  Heart,
  Sun,
  Moon,
  Monitor,
  Globe,
  Phone,
  Wifi,
  WifiOff,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, languages, Language } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navItems = [
    { href: "/", label: t("home"), icon: Heart },
    { href: "/ai-detection", label: t("aiDetection"), icon: Brain },
    { href: "/opd-booking", label: t("opdBooking"), icon: Calendar },
    { href: "/ambulance", label: t("ambulance"), icon: Truck },
    { href: "/hospitals", label: t("hospitals"), icon: MapPin },
    { href: "/doctors", label: t("doctors"), icon: Users },
    { href: "/pharmacy", label: t("pharmacy"), icon: ShoppingBag },
    { href: "/insurance", label: t("insurance"), icon: Shield },
  ];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      {/* Rural Feature Banner - Emergency Helpline */}
      <div className="bg-emergency/10 border-b border-emergency/20 px-4 py-1.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a
              href="tel:1800XXXXXXX"
              className="flex items-center gap-1.5 font-medium text-emergency hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{t("tollFreeNumber")}</span>
            </a>
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <Wifi className="h-3.5 w-3.5 text-success" />
              <span>{t("offlineAvailable")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-muted-foreground">
              {t("lowDataMode")}
            </span>
            <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AI Chikitsalya</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {currentLang?.nativeName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "cursor-pointer",
                      language === lang.code && "bg-secondary"
                    )}
                  >
                    <span className="mr-2">{lang.nativeName}</span>
                    <span className="text-muted-foreground text-xs">
                      {lang.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {resolvedTheme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={cn(
                    "cursor-pointer gap-2",
                    theme === "light" && "bg-secondary"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  {t("lightMode")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "cursor-pointer gap-2",
                    theme === "dark" && "bg-secondary"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  {t("darkMode")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={cn(
                    "cursor-pointer gap-2",
                    theme === "system" && "bg-secondary"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  {t("systemTheme")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

