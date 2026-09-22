import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BOUTIQUE, numeroWhatsAppAffiche, numeroWhatsAppValide } from "../lib/boutique";

const COLONNES = [
  {
    titre: "Boutique",
    liens: [
      { to: "/collection", libelle: "Toute la collection" },
      { to: "/panier", libelle: "Mon panier" },
    ],
  },
  {
    titre: "La maison",
    liens: [
      { to: "/notre-histoire", libelle: "Notre histoire" },
      { to: "/livraison", libelle: "Livraison" },
      { to: "/faq", libelle: "Questions fréquentes" },
      { to: "/contact", libelle: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-serif text-2xl">{BOUTIQUE.nom}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{BOUTIQUE.baseline}</p>

            <div className="mt-8 flex items-center gap-4">
              {numeroWhatsAppValide() && (
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

          {COLONNES.map((colonne) => (
            <div key={colonne.titre}>
              <p className="eyebrow">{colonne.titre}</p>
              <ul className="mt-6 space-y-3">
                {colonne.liens.map((lien) => (
                  <li key={lien.to}>
                    <Link to={lien.to} className="link-underline text-sm text-muted-foreground">
                      {lien.libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule-fade my-12" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BOUTIQUE.nom} — {BOUTIQUE.ville}
          </p>
          {numeroWhatsAppValide() && <p>Commandes par WhatsApp au {numeroWhatsAppAffiche()}</p>}
        </div>
      </div>
    </footer>
  );
}
