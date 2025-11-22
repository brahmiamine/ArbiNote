"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslations();

  const insightCards = [
    {
      id: "performance",
      title: t("home.insights.cards.performance.title"),
      description: t("home.insights.cards.performance.description"),
      href: "/classement",
    },
    {
      id: "training",
      title: t("home.insights.cards.training.title"),
      description: t("home.insights.cards.training.description"),
      href: "/admin",
    },
    {
      id: "community",
      title: t("home.insights.cards.community.title"),
      description: t("home.insights.cards.community.description"),
      href: "/",
    },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 pb-20 md:pb-12">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Section Stories & analyses */}
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{t("home.insights.title")}</p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{t("home.insights.subtitle")}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {insightCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 shadow-lg"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-200 mt-2">{card.description}</p>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-200 mt-4 hover:text-blue-700 dark:hover:text-white transition-colors"
                  >
                    {t("home.insights.read")}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Section Comment ça marche ? */}
          <div className="rounded-3xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-6">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">{t("home.howItWorks.title")}</h3>
            <ul className="grid gap-3 text-gray-700 dark:text-gray-200 md:grid-cols-3">
              <li className="rounded-2xl bg-white/70 dark:bg-blue-900/40 px-4 py-3 text-sm font-medium shadow-sm">{t("home.howItWorks.step1")}</li>
              <li className="rounded-2xl bg-white/70 dark:bg-blue-900/40 px-4 py-3 text-sm font-medium shadow-sm">{t("home.howItWorks.step2")}</li>
              <li className="rounded-2xl bg-white/70 dark:bg-blue-900/40 px-4 py-3 text-sm font-medium shadow-sm">{t("home.howItWorks.step3")}</li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} ArbiNote. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
