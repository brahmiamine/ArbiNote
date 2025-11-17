"use client";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import FederationSwitcher from "./FederationSwitcher";

export default function Navigation() {
  const { t } = useTranslations();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 h-auto py-4 md:h-16">
          <Link href="/" className="text-xl font-bold hover:text-blue-200">
            ArbiNote ⚽
          </Link>
          <div className="flex flex-1 justify-center md:justify-center gap-6 text-sm md:text-base">
            <Link href="/saisons" className="hover:text-blue-200 transition-colors">
              {t("nav.seasons")}
            </Link>
            <Link href="/matches" className="hover:text-blue-200 transition-colors">
              {t("nav.matches")}
            </Link>
            <Link href="/classement" className="hover:text-blue-200 transition-colors">
              {t("nav.rankings")}
            </Link>
            <Link href="/admin" className="hover:text-blue-200 transition-colors">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <FederationSwitcher variant="light" />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
