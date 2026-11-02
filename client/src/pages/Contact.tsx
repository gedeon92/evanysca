import { Clock, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { BannierePage } from "../components/BannierePage";
import { Reveal } from "../components/Reveal";
import { LienBouton } from "../components/ui/Bouton";
import { BOUTIQUE, numeroWhatsAppAffiche, numeroWhatsAppValide } from "../lib/boutique";

function Info({ icone, titre, children }: { icone: ReactNode; titre: string; children: ReactNode }) {
  return (
    <div className="flex gap-5 rounded-[calc(var(--radius)*0.66)] border border-border bg-card p-6 shadow-soft">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-gold">{icone}</span>
      <div>
        <p className="text-[0.625rem] uppercase tracking-[0.3em] text-muted-foreground">{titre}</p>
        <div className="mt-2 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// Aucun formulaire, aucun e-mail envoyé : toute la relation passe par WhatsApp. Un formulaire de
// contact donnerait l'illusion d'un canal qui n'existe pas dans ce projet.
export function Contact() {
  const lienWhatsApp = `https://wa.me/${BOUTIQUE.numeroWhatsApp}?text=${encodeURIComponent(
    `Bonjour ${BOUTIQUE.nom}, j'aimerais avoir des renseignements.`,
  )}`;

  return (
    <>
      <BannierePage
        surtitre="Contact"
        titre="Parlons"
        motCalligraphie="ensemble"
        texte="Une question sur une pièce, une teinte, une taille ? Le plus simple est d'envoyer un message : nous vous répondons avec plaisir."
        photo="/lookbook/look-4.jpg"
      />

      <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Carte WhatsApp mise en avant : c'est le seul vrai canal de la boutique. */}
          <Reveal>
            <div className="relative overflow-hidden rounded-[var(--radius)] bg-card shadow-card ring-1 ring-gold/30">
              <img src="/accueil/univers-femme.jpg" alt="" className="h-48 w-full object-cover object-top sm:h-56" />
              <div className="p-8">
                <span className="relative -mt-16 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card ring-4 ring-card">
                  <MessageCircle className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="mt-5 font-serif text-3xl">Sur WhatsApp</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Le moyen le plus direct, pour une question comme pour une commande. Photos
                  supplémentaires, tailles, couleurs : demandez-nous.
                </p>

                {numeroWhatsAppValide() ? (
                  <>
                    <p className="chiffres mt-6 font-serif text-2xl text-accent">{numeroWhatsAppAffiche()}</p>
                    <LienBouton
                      href={lienWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      variante="whatsapp"
                      taille="lg"
                      className="mt-6 w-full"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Ouvrir la conversation
                    </LienBouton>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-destructive">Numéro non configuré.</p>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delai={0.1} className="space-y-4 lg:pt-10">
            <Info icone={<MapPin className="h-4 w-4" aria-hidden />} titre="Où nous trouver">
              {BOUTIQUE.ville}, Gabon — sur rendez-vous, pris par message.
            </Info>

            <Info icone={<Clock className="h-4 w-4" aria-hidden />} titre="Disponibilité">
              Du lundi au samedi, de 9h à 19h.
            </Info>

            {BOUTIQUE.instagram && (
              <Info icone={<Instagram className="h-4 w-4" aria-hidden />} titre="Instagram">
                <a
                  href={`https://instagram.com/${BOUTIQUE.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  {BOUTIQUE.instagram}
                </a>
              </Info>
            )}

            {BOUTIQUE.email && (
              <Info icone={<Mail className="h-4 w-4" aria-hidden />} titre="E-mail">
                <a href={`mailto:${BOUTIQUE.email}`} className="link-underline">
                  {BOUTIQUE.email}
                </a>
              </Info>
            )}

            <div className="rounded-[calc(var(--radius)*0.66)] border border-dashed border-gold/50 p-6 text-center">
              <p className="font-script text-3xl text-gold">Merci de votre confiance</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Chaque commande est suivie personnellement, du premier message à la livraison.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
