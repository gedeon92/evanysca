export type Role = "ADMIN";

export type ProfilAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
};

export type Categorie = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  productCount: number;
};

export type CategorieResumee = { id: string; name: string; slug: string };

export type ImageProduit = {
  id: string;
  variantId: string;
  url: string;
  publicId: string | null;
  position: number;
  createdAt: string;
};

export type VarianteProduit = {
  id: string;
  productId: string;
  colorName: string;
  swatchHex: string;
  sku: string;
  stock: number;
  images: ImageProduit[];
  createdAt: string;
  updatedAt: string;
};

export type ProduitAdmin = {
  id: string;
  categoryId: string;
  line: string;
  name: string;
  slug: string;
  ref: string;
  displayOrder: number;
  price: number;
  detail: string;
  shortDescription: string;
  story: string;
  designIntent: string;
  materials: string;
  craftsmanship: string;
  care: string;
  tag: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategorieResumee;
  variants: VarianteProduit[];
};

export type LigneProduitAdmin = {
  id: string;
  name: string;
  slug: string;
  ref: string;
  line: string;
  price: number;
  displayOrder: number;
  isActive: boolean;
  category: CategorieResumee;
  image: string | null;
  variantCount: number;
  totalStock: number;
  createdAt: string;
};

export type PageResultats<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ResumeTableauDeBord = {
  productCount: number;
  activeProductCount: number;
  inactiveProductCount: number;
  categoryCount: number;
  outOfStockCount: number;
  latestProducts: {
    id: string;
    name: string;
    slug: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    category: { name: string };
    image: string | null;
  }[];
};
