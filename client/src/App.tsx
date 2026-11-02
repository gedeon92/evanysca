import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { SquelettesGrille } from "./components/ui/Skeleton";
import { CartProvider } from "./context/CartContext";
import { Accueil } from "./pages/Accueil";

// L'accueil est en import statique : c'est la page d'entrée, la charger en différé ajouterait un
// aller-retour avant le moindre pixel. Tout le reste est chargé à la demande.
const Collection = lazy(() => import("./pages/Collection").then((m) => ({ default: m.Collection })));
const FicheProduit = lazy(() => import("./pages/FicheProduit").then((m) => ({ default: m.FicheProduit })));
const Panier = lazy(() => import("./pages/Panier").then((m) => ({ default: m.Panier })));
const Contact = lazy(() => import("./pages/Contact").then((m) => ({ default: m.Contact })));
const Faq = lazy(() => import("./pages/Faq").then((m) => ({ default: m.Faq })));
const NonTrouvee = lazy(() => import("./pages/NonTrouvee").then((m) => ({ default: m.NonTrouvee })));

const clientRequetes = new QueryClient({
  defaultOptions: {
    // Ce que la vendeuse change dans l'admin doit se voir tout de suite : chaque page redemande le
    // catalogue à l'affichage (staleTime 0), au retour sur l'onglet, et toutes les 15 secondes tant
    // que la page reste visible. Les données affichées sont conservées pendant la requête : pas de
    // clignotement, la grille change seulement si quelque chose a changé.
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchInterval: 15_000,
      refetchIntervalInBackground: false,
      retry: 1,
    },
  },
});

function SqueletteDePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <SquelettesGrille nombre={8} />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={clientRequetes}>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<SqueletteDePage />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Accueil />} />
                <Route path="collection" element={<Collection />} />
                <Route path="produit/:slug" element={<FicheProduit />} />
                <Route path="panier" element={<Panier />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faq" element={<Faq />} />
                <Route path="*" element={<NonTrouvee />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster position="top-center" richColors closeButton />
      </CartProvider>
    </QueryClientProvider>
  );
}
