"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n";

export default function MobileNavigation() {
  const { t } = useTranslations();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/mes-votes") {
      return pathname === "/mes-votes";
    }
    if (path === "/matches") {
      return pathname.startsWith("/matches") || pathname.startsWith("/journees");
    }
    if (path === "/classement") {
      return pathname === "/classement" || pathname.startsWith("/classement/");
    }
    return false;
  };

  const navItems = [
    {
      href: "/matches",
      label: t("nav.matches"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6V4.5A2.5 2.5 0 018.5 2h7A2.5 2.5 0 0118 4.5V6m0 0v1.5a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 017.5 7.5V6M6 6h12M6 6H4.5A2.5 2.5 0 002 8.5v9A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0019.5 6H18m-6 6h.008v.008H12V12zm3 0h.008v.008H15V12zm3 0h.008v.008H18V12z"
          />
        </svg>
      ),
    },
    {
      href: "/mes-votes",
      label: t("nav.myVotes"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      href: "/classement",
      label: t("nav.rankings"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item, index) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors px-1 ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <div
                className={`flex-shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

