import MatchCard from "@/components/MatchCard";
import { Match } from "@/types";
import { getServerLocale, translate } from "@/lib/i18nServer";
import { fetchNextJourneeMatches } from "@/lib/dataAccess";
import { getActiveLeagueId } from "@/lib/leagueSelection";

export default async function Home() {
  const locale = await getServerLocale();
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params);
  const leagueId = await getActiveLeagueId();
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    const result = await fetchNextJourneeMatches(new Date(), leagueId ?? undefined);
    matches = result ? (result.matches as Match[]) : [];
  } catch (err) {
    error = err instanceof Error ? err.message : t("common.error");
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t("matches.list.title")}</h1>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4 sm:mb-6">
          <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">
            {t("common.error")}: {error}
          </p>
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 mt-2">{t("common.errorConfig")}</p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">{t("common.emptyMatchesTitle")}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{t("common.emptyMatchesDescription")}</p>
        </div>
      )}

      {!error && matches.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
