import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BOUTIQUE } from "../lib/boutique";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { BoutonWhatsAppFlottant } from "./WhatsAppOrderButton";

export function Layout() {
  const { pathname } = useLocation();

  // Sans cela, passer d'une fiche produit à une autre conserverait la position de défilement et
  // donnerait l'impression que la page n'a pas changé.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // Le titre de l'onglet porte le nom de la marque, qui vient du .env.
  useEffect(() => {
    document.title = BOUTIQUE.nom;
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BoutonWhatsAppFlottant />
    </div>
  );
}
