import * as Accordion from "@radix-ui/react-accordion";
import { MessageCircle, Plus } from "lucide-react";
import { BannierePage } from "../components/BannierePage";
import { Reveal } from "../components/Reveal";
import { LienBouton } from "../components/ui/Bouton";
import { BOUTIQUE, numeroWhatsAppValide } from "../lib/boutique";

const QUESTIONS = [
  {
    question: "Faut-il créer un compte pour commander ?",
    reponse:
      "Non. Il n'y a pas de compte client sur ce site. Vous composez votre panier, puis votre commande part sur WhatsApp, déjà rédigée.",
  },
  {
    question: "Comment se passe le paiement ?",
    reponse:
      "Aucun paiement ne transite par ce site. Le mode de règlement se convient directement dans la conversation WhatsApp, au moment de confirmer la commande.",
  },
  {
    question: "Mon panier est-il conservé ?",
    reponse:
      "Oui, dans votre navigateur. Il reste disponible même après avoir envoyé votre commande : rien n'est effacé tant que vous ne le videz pas vous-même. En revanche, les prix et les disponibilités sont revérifiés à chaque visite.",
  },
  {
    question: "Une pièce affichée « Épuisé » peut-elle revenir ?",
    reponse:
      "Souvent, selon les arrivages. Le plus sûr est de nous demander par message : nous vous prévenons dès son retour.",
  },
  {
    question: "Les teintes sont-elles fidèles aux photos ?",
    reponse:
      "Un écran reste un écran : en cas de doute sur une nuance, demandez-nous une photo supplémentaire sur WhatsApp.",
  },
  {
    question: "Livrez-vous en dehors de la ville ?",
    reponse: `Oui. Nous livrons à ${BOUTIQUE.ville} et envoyons vers Libreville. Les frais dépendent du lieu et sont annoncés avant tout règlement.`,
  },
];

export function Faq() {
  const lienWhatsApp = `https://wa.me/${BOUTIQUE.numeroWhatsApp}?text=${encodeURIComponent(
    `Bonjour ${BOUTIQUE.nom}, j'ai une question.`,
  )}`;

  return (
    <>
      <BannierePage
        surtitre="Aide"
        titre="Questions"
        motCalligraphie="fréquentes"
        texte="Tout ce qu'il faut savoir pour commander en toute sérénité."
        photo="/lookbook/look-3.jpg"
      />

      <div className="relative z-10 mx-auto -mt-10 max-w-3xl px-4 pb-20 sm:px-8 sm:pb-28">
        <Accordion.Root
          type="single"
          collapsible
          defaultValue={QUESTIONS[0].question}
          className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-card"
        >
          {QUESTIONS.map((element, index) => (
            <Accordion.Item
              key={element.question}
              value={element.question}
              className="border-b border-border last:border-b-0 data-[state=open]:bg-secondary/40"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center gap-5 px-6 py-6 text-left sm:px-8">
                  <span className="w-8 shrink-0 font-script text-3xl leading-none text-gold">{index + 1}</span>
                  <span className="flex-1 font-serif text-xl leading-snug">{element.question}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500 group-data-[state=open]:rotate-45 group-data-[state=open]:border-gold group-data-[state=open]:text-gold">
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="pb-6 pl-[4.25rem] pr-6 text-sm leading-relaxed text-muted-foreground sm:pl-[4.75rem] sm:pr-16">
                  {element.reponse}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <Reveal className="grain mt-12 overflow-hidden rounded-[var(--radius)] bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <p className="font-script text-4xl text-gold sm:text-5xl">Une autre question ?</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/70">
            Écrivez-nous directement, nous vous répondons avec plaisir.
          </p>
          {numeroWhatsAppValide() && (
            <LienBouton href={lienWhatsApp} target="_blank" rel="noopener noreferrer" variante="whatsapp" taille="lg" className="mt-8">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Écrire sur WhatsApp
            </LienBouton>
          )}
        </Reveal>
      </div>
    </>
  );
}
