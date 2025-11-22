import AdminLogin from "@/components/admin/AdminLogin";
import { hasAdminSession } from "@/lib/adminAuth";

export default async function AdminPage() {
  const authenticated = await hasAdminSession();

  if (!authenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Tableau de bord</h2>
        <p className="text-gray-500 dark:text-gray-400">Cette page est vide pour le moment.</p>
      </div>
    </div>
  );
}
