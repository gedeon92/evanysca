import { Clock, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { LienBouton } from "../components/ui/Bouton";
import { BOUTIQUE, numeroWhatsAppAffiche, numeroWhatsAppValide } from "../lib/boutique";

// Aucun formulaire, aucun e-mail envoyé : toute la relation passe par WhatsApp. Un formulaire de
// contact donnerait l'illusion d'un canal qui n'existe pas dans ce projet.
export function Contact() {
  const lienWhatsApp = `https://wa.me/${BOUTIQUE.numeroWhatsApp}?text=${encodeURIComponent(
    `Bonjour ${BOUTIQUE.nom}, j'aimerais avoir des renseignements.`,
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <p className="eyebrow-accent">Contact</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Écris-nous</h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Une question sur une pièce, une teinte, un délai ? Le plus simple est d'envoyer un
          message : on répond dans la journée.
        </p>
      </Reveal>

      <div className="rule-fade my-12" />

      <div className="grid gap-10 sm:grid-cols-2">
        <Reveal>
          <div className="rounded-[calc(var(--radius)*0.66)] border border-border bg-card p-8 shadow-soft">
            <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
            <h2 className="mt-6 font-serif text-2xl">WhatsApp</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Le moyen le plus direct, pour une question comme pour une commande.
            </p>

            {numeroWhatsAppValide() ? (
              <>
                <p className="mt-6 text-sm">{numeroWhatsAppAffiche()}</p>
                <LienBouton
                  href={lienWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  variante="whatsapp"
                  className="mt-6 w-full"
                >
                  Ouvrir la conversation
                </LienBouton>
              </>
            ) : (
              <p className="mt-6 text-sm text-destructive">Numéro non configuré.</p>
            )}
          </div>
        </Reveal>

        <Reveal delai={0.1}>
          <div className="space-y-8 p-2">
            <div className="flex gap-4">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="eyebrow">Où nous trouver</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {BOUTIQUE.ville} — sur rendez-vous, pris par message.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="eyebrow">Disponibilité</p>
                <p className="mt-2 text-sm text-muted-foreground">Du lundi au samedi, de 9h à 19h.</p>
              </div>
            </div>

            {BOUTIQUE.instagram && (
              <div className="flex gap-4">
                <Instagram className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="eyebrow">Instagram</p>
                  <a
                    href={`https://instagram.com/${BOUTIQUE.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-2 block text-sm text-muted-foreground"
                  >
                    {BOUTIQUE.instagram}
                  </a>
                </div>
              </div>
            )}

            {BOUTIQUE.email && (
              <div className="flex gap-4">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="eyebrow">E-mail</p>
                  <a
                    href={`mailto:${BOUTIQUE.email}`}
                    className="link-underline mt-2 block text-sm text-muted-foreground"
                  >
                    {BOUTIQUE.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
