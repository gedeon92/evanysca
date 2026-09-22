import { FolderTree, LayoutDashboard, LogOut, Menu, Package, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "../context/AdminAuthContext";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";

const NAVIGATION = [
  { to: "/", libelle: "Tableau de bord", icone: LayoutDashboard, exact: true },
  { to: "/produits", libelle: "Produits", icone: Package, exact: false },
  { to: "/categories", libelle: "Catégories", icone: FolderTree, exact: false },
  { to: "/profil", libelle: "Profil", icone: UserRound, exact: false },
];

export function AdminLayout() {
  const { utilisateur, deconnecter } = useAdminAuth();
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const emplacement = useLocation();
  const naviguer = useNavigate();

  // Le tiroir mobile se referme à chaque changement de route : le laisser ouvert masquerait la
  // page qu'on vient justement de demander.
  useEffect(() => {
    setTiroirOuvert(false);
  }, [emplacement.pathname]);

  const surDeconnexion = async () => {
    await deconnecter();
    toast.success("Déconnexion effectuée.");
    naviguer("/connexion", { replace: true });
  };

  return (
    <div className="min-h-screen lg:flex">
      {tiroirOuvert && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setTiroirOuvert(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card px-6 py-8",
          "transition-transform duration-500 lg:static lg:translate-x-0",
          tiroirOuvert ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="eyebrow-accent">Administration</p>
            <p className="mt-2 font-serif text-2xl leading-none">Boutique</p>
          </div>
          <button
            type="button"
            onClick={() => setTiroirOuvert(false)}
            className="rounded-full p-2 text-muted-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAVIGATION.map(({ to, libelle, icone: Icone, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icone className="h-4 w-4" aria-hidden />
              {libelle}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 space-y-4 border-t border-border pt-6">
          <div>
            <p className="text-sm">
              {utilisateur?.firstName} {utilisateur?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{utilisateur?.email}</p>
          </div>
          <Button variante="secondary" taille="sm" className="w-full" onClick={surDeconnexion}>
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setTiroirOuvert(true)}
            className="rounded-full p-2 text-foreground"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-serif text-xl">Administration</p>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
