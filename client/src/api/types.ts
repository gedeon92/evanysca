export type CategorieResumee = { id: string; name: string; slug: string };

export type Categorie = CategorieResumee & { productCount: number };

export type PastilleTeinte = { colorName: string; swatchHex: string };

export type ProduitVignette = {
  id: string;
  name: string;
  slug: string;
  line: string;
  price: number;
  tag: string | null;
  shortDescription: string;
  category: CategorieResumee;
  image: string | null;
  swatches: PastilleTeinte[];
  totalStock: number;
  isSoldOut: boolean;
};

export type ImageProduit = { id: string; url: string; position: number };

export type TeinteProduit = {
  id: string;
  colorName: string;
  swatchHex: string;
  stock: number;
  isSoldOut: boolean;
  images: ImageProduit[];
};

export type ProduitDetail = {
  id: string;
  name: string;
  slug: string;
  line: string;
  ref: string;
  price: number;
  tag: string | null;
  detail: string;
  shortDescription: string;
  story: string;
  designIntent: string;
  materials: string;
  craftsmanship: string;
  care: string;
  category: CategorieResumee;
  variants: TeinteProduit[];
  totalStock: number;
  isSoldOut: boolean;
};

export type PageResultats<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LigneValidee = {
  variantId: string;
  exists: boolean;
  isActive: boolean;
  price: number | null;
  stock: number;
  name: string | null;
  color: string | null;
  productSlug: string | null;
  image: string | null;
};
