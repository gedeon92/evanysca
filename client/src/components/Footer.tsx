import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BOUTIQUE, numeroWhatsAppAffiche, numeroWhatsAppValide } from "../lib/boutique";
import { Monogramme } from "./Monogramme";
import { classesBouton } from "./ui/Bouton";

const NAVIGATION = [
  { to: "/collection", libelle: "Toute la collection" },
  { to: "/panier", libelle: "Mon panier" },
  { to: "/faq", libelle: "Questions fréquentes" },
  { to: "/contact", libelle: "Contact" },
];

export function Footer() {
  const joignable = numeroWhatsAppValide();

  return (
    <footer className="grain bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        {/* Trois blocs de poids comparables : la marque, la navigation, l'appel à commander.
            Deux colonnes de liens très courtes laissaient un grand vide au milieu. */}
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-4">
              <Monogramme className="h-12 w-12 rounded-[14px] ring-1 ring-gold/40" />
              <p className="font-script text-5xl leading-none text-gold">{BOUTIQUE.nom}</p>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/60">
              {BOUTIQUE.baseline}
            </p>

            <div className="mt-8 flex items-center gap-3">
              {joignable && (
                <a
                  href={`https://wa.me/${BOUTIQUE.numeroWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-colors hover:border-gold hover:text-gold"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </a>
              )}
              {BOUTIQUE.instagram && (
                <a
                  href={`https://instagram.com/${BOUTIQUE.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-colors hover:border-gold hover:text-gold"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              )}
              {BOUTIQUE.email && (
                <a
                  href={`mailto:${BOUTIQUE.email}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-colors hover:border-gold hover:text-gold"
                  aria-label="Envoyer un e-mail"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Pied de page">
            <p className="text-[0.6875rem] uppercase tracking-[0.35em] text-gold">Navigation</p>
            <ul className="mt-6 space-y-3">
              {NAVIGATION.map((lien) => (
                <li key={lien.to}>
                  <Link to={lien.to} className="link-underline text-sm text-primary-foreground/70 hover:text-primary-foreground">
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[0.6875rem] uppercase tracking-[0.35em] text-gold">Commander</p>
            <p className="mt-6 text-sm leading-relaxed text-primary-foreground/60">
              Pas de compte à créer, pas de carte à saisir. La commande se conclut dans la
              conversation.
            </p>

            {joignable && (
              <>
                <p className="mt-5 text-sm">{numeroWhatsAppAffiche()}</p>
                <a
                  href={`https://wa.me/${BOUTIQUE.numeroWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classesBouton({ variante: "whatsapp", taille: "sm", className: "mt-5" })}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Écrire sur WhatsApp
                </a>
              </>
            )}
          </div>
        </div>

        <div className="my-12 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <p className="text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {BOUTIQUE.nom} — {BOUTIQUE.ville}
        </p>
      </div>
    </footer>
  );
}
