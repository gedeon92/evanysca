import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Skeleton } from "./components/ui/Skeleton";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { Connexion } from "./pages/Connexion";
import { TableauDeBord } from "./pages/TableauDeBord";

// Le tableau de bord et la connexion sont en import statique : ce sont les deux premières pages
// qu'on voit, les charger en différé ajouterait un aller-retour avant le moindre affichage.
const ListeProduits = lazy(() => import("./pages/ListeProduits").then((m) => ({ default: m.ListeProduits })));
const ProduitFormulaire = lazy(() => import("./pages/ProduitFormulaire").then((m) => ({ default: m.ProduitFormulaire })));
const Categories = lazy(() => import("./pages/Categories").then((m) => ({ default: m.Categories })));
const Profil = lazy(() => import("./pages/Profil").then((m) => ({ default: m.Profil })));
const NonTrouvee = lazy(() => import("./pages/NonTrouvee").then((m) => ({ default: m.NonTrouvee })));

const clientRequetes = new QueryClient({
  defaultOptions: {
    queries: {
      // Une minute de fraîcheur : la vendeuse passe d'une page à l'autre sans que chaque retour
      // relance une requête. Et pas de rechargement au simple retour sur l'onglet.
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function SqueletteDePage() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={clientRequetes}>
      <AdminAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<SqueletteDePage />}>
            <Routes>
              <Route path="/connexion" element={<Connexion />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<TableauDeBord />} />
                <Route path="produits" element={<ListeProduits />} />
                <Route path="produits/nouveau" element={<ProduitFormulaire />} />
                <Route path="produits/:id" element={<ProduitFormulaire />} />
                <Route path="categories" element={<Categories />} />
                <Route path="profil" element={<Profil />} />
                <Route path="*" element={<NonTrouvee />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster position="top-right" richColors closeButton />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
