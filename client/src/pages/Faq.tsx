import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { BOUTIQUE } from "../lib/boutique";

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
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <p className="eyebrow-accent">Aide</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Questions fréquentes</h1>
      </Reveal>

      <div className="rule-fade my-12" />

      <Accordion.Root type="single" collapsible className="border-t border-border">
        {QUESTIONS.map((element) => (
          <Accordion.Item key={element.question} value={element.question} className="border-b border-border">
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                <span className="font-serif text-xl leading-snug">{element.question}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="pb-6 text-sm leading-relaxed text-muted-foreground">{element.reponse}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <Reveal className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">Ta question n'est pas là ?</p>
        <Link to="/contact" className="link-underline mt-3 inline-block text-xs uppercase tracking-[0.25em]">
          Écrivez-nous sur WhatsApp
        </Link>
      </Reveal>
    </div>
  );
}
