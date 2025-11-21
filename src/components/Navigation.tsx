"use client";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import FederationSwitcher from "./FederationSwitcher";

export default function Navigation() {
  const { t } = useTranslations();

  return (
    <nav className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 h-auto py-4 md:h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            ArbiNote ⚽
          </Link>
          <div className="flex flex-1 justify-center md:justify-center gap-6 text-sm md:text-base">
            <Link href="/saisons" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("nav.seasons")}
            </Link>
            <Link href="/journees" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("nav.matchday")}
            </Link>
            <Link href="/classement" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("nav.rankings")}
            </Link>
            <Link href="/archive" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("nav.archive")}
            </Link>
            <Link href="/mes-votes" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("nav.myVotes")}
            </Link>
            <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <FederationSwitcher variant="admin" />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
