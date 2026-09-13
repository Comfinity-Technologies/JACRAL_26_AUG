export type Product = {
  id: number;
  name: string;
  category: "Jackfruit" | "Cereals";
  price: number;
  description: string;
  stock: number;
  badge?: string;
  image?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Jackfruit",
    category: "Jackfruit",
    price: 180,
    description:
      "Fresh, naturally sweet jackfruit carefully selected for quality and freshness.",
    stock: 25,
    badge: "Fresh",
  },
  {
    id: 2,
    name: "Jackfruit Chips",
    category: "Jackfruit",
    price: 120,
    description:
      "Crispy jackfruit chips prepared for a delicious traditional snack.",
    stock: 40,
    badge: "Popular",
  },
  {
    id: 3,
    name: "Jackfruit Flour",
    category: "Jackfruit",
    price: 160,
    description:
      "Versatile jackfruit flour suitable for a variety of traditional and everyday recipes.",
    stock: 30,
  },
  {
    id: 4,
    name: "Jackfruit Seed Flour",
    category: "Jackfruit",
    price: 140,
    description:
      "Finely prepared jackfruit seed flour made from carefully processed jackfruit seeds.",
    stock: 20,
  },
  {
    id: 5,
    name: "Traditional Cereals",
    category: "Cereals",
    price: 220,
    description:
      "Nutritious traditional cereals selected for everyday wholesome meals.",
    stock: 35,
    badge: "Healthy Choice",
  },
  {
    id: 6,
    name: "Mixed Cereals",
    category: "Cereals",
    price: 240,
    description:
      "A balanced combination of selected cereals for convenient everyday use.",
    stock: 28,
  },
  {
    id: 7,
    name: "Cereal Breakfast Mix",
    category: "Cereals",
    price: 190,
    description:
      "A convenient cereal mix designed for a simple and nourishing breakfast.",
    stock: 32,
  },
  {
    id: 8,
    name: "Whole Grain Cereal",
    category: "Cereals",
    price: 210,
    description:
      "Wholesome whole-grain cereal prepared for nutritious everyday consumption.",
    stock: 24,
  },
];

export const categories = [
  "All",
  "Jackfruit",
  "Cereals",
] as const;