import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const CLASSES_SAISIE =
  "w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none " +
  "focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";

type EnveloppeProps = {
  label: string;
  erreur?: string[];
  aide?: string;
  obligatoire?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, erreur, aide, obligatoire, children, className }: EnveloppeProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="eyebrow block">
        {label}
        {obligatoire && <span className="ml-1 text-accent">*</span>}
      </span>
      {children}
      {aide && !erreur?.length && <span className="block text-xs text-muted-foreground">{aide}</span>}
      {/* Les erreurs viennent de fieldErrors renvoyé par Zod : un champ peut en porter plusieurs. */}
      {erreur?.map((message) => (
        <span key={message} className="block text-xs text-destructive">
          {message}
        </span>
      ))}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CLASSES_SAISIE, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CLASSES_SAISIE, "min-h-[7rem] resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CLASSES_SAISIE, "appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}
