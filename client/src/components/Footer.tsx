import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BOUTIQUE, numeroWhatsAppAffiche, numeroWhatsAppValide } from "../lib/boutique";
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
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        {/* Trois blocs de poids comparables : la marque, la navigation, l'appel à commander.
            Deux colonnes de liens très courtes laissaient un grand vide au milieu. */}
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl">{BOUTIQUE.nom}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {BOUTIQUE.baseline}
            </p>

            <div className="mt-8 flex items-center gap-3">
              {joignable && (
                <a
                  href={`https://wa.me/${BOUTIQUE.numeroWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/40"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/40"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              )}
              {BOUTIQUE.email && (
                <a
                  href={`mailto:${BOUTIQUE.email}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/40"
                  aria-label="Envoyer un e-mail"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Pied de page">
            <p className="eyebrow">Navigation</p>
            <ul className="mt-6 space-y-3">
              {NAVIGATION.map((lien) => (
                <li key={lien.to}>
                  <Link to={lien.to} className="link-underline text-sm text-muted-foreground">
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Commander</p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
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

        <div className="rule-fade my-12" />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BOUTIQUE.nom} — {BOUTIQUE.ville}
        </p>
      </div>
    </footer>
  );
}
