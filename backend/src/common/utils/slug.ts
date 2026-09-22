// Les noms de produits et de catégories sont en français : sans normalisation, « Bijoux d'été »
// donnerait une URL illisible et non reproductible.
export function fabriquerSlug(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
