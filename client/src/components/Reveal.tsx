import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Apparition au défilement. La courbe très amortie est la même que celle des animations CSS :
// l'élément se pose, il ne rebondit pas.
export function Reveal({
  children,
  delai = 0,
  className,
}: {
  children: ReactNode;
  delai?: number;
  className?: string;
}) {
  // Respecte « réduire les animations » du système : sans ça, le site devient pénible pour les
  // personnes sensibles au mouvement.
  const mouvementReduit = useReducedMotion();

  if (mouvementReduit) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: delai, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
