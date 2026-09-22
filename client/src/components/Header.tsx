import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { usePanier } from "../context/CartContext";
import { BOUTIQUE } from "../lib/boutique";
import { cn } from "../lib/utils";

const LIENS = [
  { to: "/collection", libelle: "Collection" },
  { to: "/notre-histoire", libelle: "Notre histoire" },
  { to: "/livraison", libelle: "Livraison" },
  { to: "/faq", libelle: "Questions" },
  { to: "/contact", libelle: "Contact" },
];

export function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const { nombre } = usePanier();
  const emplacement = useLocation();

  useEffect(() => setMenuOuvert(false), [emplacement.pathname]);

  // Fond opaque dès qu'on quitte le haut de page : en transparence sur une image claire, le menu
  // devient illisible.
  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 24);
    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOuvert ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOuvert]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        defile ? "border-b border-border bg-background/90 backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => setMenuOuvert(true)}
          className="rounded-full p-2 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="font-serif text-xl tracking-wide sm:text-2xl lg:flex-1">
          {BOUTIQUE.nom}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {LIENS.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              className={({ isActive }) =>
                cn("link-underline text-[0.6875rem] uppercase tracking-[0.25em]", isActive && "text-accent")
              }
            >
              {lien.libelle}
            </NavLink>
          ))}
        </nav>

        <div className="lg:flex-1 lg:text-right">
          <Link
            to="/panier"
            className="relative inline-flex items-center gap-2 rounded-full p-2"
            aria-label={`Panier, ${nombre} article${nombre > 1 ? "s" : ""}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {nombre > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] text-accent-foreground">
                {nombre}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOuvert && (
        <div className="fixed inset-0 z-50 animate-fade-in bg-background lg:hidden">
          <div className="flex items-center justify-between px-4 py-5">
            <span className="font-serif text-xl">{BOUTIQUE.nom}</span>
            <button type="button" onClick={() => setMenuOuvert(false)} className="rounded-full p-2" aria-label="Fermer le menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-6 pt-8">
            {LIENS.map((lien, index) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                className="animate-fade-up border-b border-border py-5 font-serif text-3xl"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {lien.libelle}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
