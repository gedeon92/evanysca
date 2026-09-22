import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Skeleton } from "./ui/Skeleton";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { utilisateur, chargementInitial } = useAdminAuth();
  const emplacement = useLocation();

  // Tant que la tentative de rafraîchissement n'a pas abouti, on ne sait pas si la session
  // existe : rediriger maintenant ferait clignoter la page de connexion à chaque rechargement.
  if (chargementInitial) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace state={{ depuis: emplacement.pathname }} />;
  }

  return <>{children}</>;
}
