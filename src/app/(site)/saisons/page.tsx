import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Saison } from "@/types";
import { getServerLocale, translate } from "@/lib/i18nServer";
import { fetchAllSaisons } from "@/lib/dataAccess";
import { getActiveLeagueId } from "@/lib/leagueSelection";

export default async function SaisonsPage() {
  const locale = await getServerLocale();
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params);
  const leagueId = await getActiveLeagueId();
  let saisons: Saison[] = [];
  let error: string | null = null;

  try {
    saisons = (await fetchAllSaisons(leagueId ?? undefined)) as any;
  } catch (err) {
    error = err instanceof Error ? err.message : t("saisons.error");
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t("saisons.title")}</h1>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <p className="text-red-800 dark:text-red-200">{error || t("saisons.error")}</p>
        </div>
      )}

      {!error && saisons.length === 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">{t("saisons.empty")}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {saisons.map((saison) => (
          <Link
            key={saison.id}
            href={`/saisons/${saison.id}`}
            className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">{saison.nom}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {saison.date_debut ? formatDate(saison.date_debut, locale) : "?"} — {saison.date_fin ? formatDate(saison.date_fin, locale) : "?"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{t("saisons.viewDays")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
