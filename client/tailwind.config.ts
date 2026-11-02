import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Les couleurs ne sont jamais écrites en dur ici : elles pointent toutes vers les tokens HSL
// déclarés dans index.css, pour qu'un changement de palette se fasse en un seul endroit.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        gold: { DEFAULT: "hsl(var(--gold))", foreground: "hsl(var(--gold-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) * 0.66)",
        sm: "calc(var(--radius) * 0.33)",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "ui-serif", "Georgia", "serif"],
        sans: ['"Jost"', "ui-sans-serif", "system-ui", "sans-serif"],
        // Calligraphie de la marque, la même que le logo : réservée aux mots d'accent.
        script: ['"Great Vibes"', "cursive"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Hauteur pilotee par Radix : l accordeon de la fiche produit s ouvre sans a-coup.
        // Bandeau défilant de l'accueil : la piste contient deux fois le texte, d'où -50 %.
        defilement: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        // Zoom très lent et réversible sur les photos de la bannière : elles respirent sans bouger.
        "zoom-lent": { from: { transform: "scale(1)" }, to: { transform: "scale(1.08)" } },
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
      },
      animation: {
        // Courbe très amortie : l'apparition doit se poser, pas rebondir.
        "fade-in": "fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        defilement: "defilement 40s linear infinite",
        "defilement-lent": "defilement 70s linear infinite",
        "zoom-lent": "zoom-lent 16s ease-in-out infinite alternate",
        "accordion-down": "accordion-down 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
