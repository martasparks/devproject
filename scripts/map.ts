// /scripts/map.ts
import slugify from "slugify";

export type OldRow = {
  // CSV var būt daudz vairāk kolonnu — mēs paņemsim tikai vajadzīgās:
  code?: string;
  name?: string;
  price?: string | number;
  old_price?: string | number | null;
  brand_id?: string | number | null;
  stock?: string | number | null;
  stock_status_id?: string | number | null;
  notes?: string | null;
  weight?: string | number | null;
  size?: string | null;            // piem. "271x80x228"
  size1?: string | number | null;  // W
  size2?: string | number | null;  // D
  size3?: string | number | null;  // H
  hide?: string | number | null;   // "1" vai "Y" => paslēpts
  category_id?: string | number | null;
  created?: string | null;
  updated?: string | null;
};

// tikai šie lauki tiks sūtīti uz DB
export const OUTPUT_FIELDS = [
  "productCode",
  "brandId",
  "categoryId",
  "name",
  "slug",
  "shortDescription",
  "fullDescription",
  "price",
  "salePrice",
  "stockQuantity",
  "stockStatus",
  "mainImageUrl",
  "mainImageKey",
  "width",
  "depth",
  "height",
  "weight",
  "metaTitle",
  "metaDescription",
  "isActive",
  "createdAt",
  "updatedAt",
] as const;

export type NewProduct = Record<(typeof OUTPUT_FIELDS)[number], any>;

/* ── Palīgi ─────────────────────────────────────────────────────────────── */
const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).replace(",", ".").replace(/[^\d.\-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const toInt = (v: any): number => {
  const n = toNum(v);
  return n === null ? 0 : Math.max(0, Math.trunc(n));
};
const toDateOr = (v: any, fallback: Date) => {
  if (!v) return fallback;
  const d = new Date(v);
  return isNaN(d.getTime()) ? fallback : d;
};
const makeSlug = (name?: string, code?: string) =>
  slugify((name && name.trim()) || String(code || ""), { lower: true, strict: true });

const parseDims = (row: OldRow) => {
  if (row.size1 || row.size2 || row.size3) {
    return { width: toNum(row.size1), depth: toNum(row.size2), height: toNum(row.size3) };
  }
  if (row.size) {
    const parts = String(row.size).replace(/,/g, " ").split(/[^0-9.]+/).filter(Boolean);
    if (parts.length >= 3) {
      return { width: toNum(parts[0]), depth: toNum(parts[1]), height: toNum(parts[2]) };
    }
  }
  return { width: null, depth: null, height: null };
};

const stockMap = (v: any): "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "ON_ORDER" => {
  const x = String(v ?? "").trim();
  // pielāgo, ja vecajā sistēmā citi kodi
  switch (x) {
    case "2": return "LOW_STOCK";
    case "3": return "ON_ORDER";
    case "4": return "OUT_OF_STOCK";
    default:  return "IN_STOCK";
  }
};

/* ── Galvenā transformācija: OldRow -> NewProduct ──────────────────────── */
export function normalizeRow(row: OldRow): NewProduct {
  const now = new Date();
  const createdAt = toDateOr(row.created, now);
  const updatedAt = toDateOr(row.updated, createdAt);
  const dims = parseDims(row);

  const isActive = !(
    String(row.hide ?? "").trim() === "1" ||
    String(row.hide ?? "").toUpperCase() === "Y"
  );

  const out: any = {
    productCode: String(row.code ?? "").trim(),
    brandId: row.brand_id != null ? String(row.brand_id) : null,
    categoryId: row.category_id != null ? String(row.category_id) : null,
    name: String(row.name ?? "").trim(),
    slug: makeSlug(row.name, row.code),

    shortDescription: null,
    fullDescription: row.notes ?? null,

    price: toNum(row.price) ?? 0,
    salePrice: toNum(row.old_price),

    stockQuantity: toInt(row.stock),
    stockStatus: stockMap(row.stock_status_id),

    mainImageUrl: null,
    mainImageKey: null,

    width: dims.width,
    depth: dims.depth,
    height: dims.height,
    weight: toNum(row.weight),

    metaTitle: null,
    metaDescription: null,

    isActive,
    createdAt,
    updatedAt,
  };

  // whitelists — liekie CSV lauki pazūd
  const picked: any = {};
  for (const k of OUTPUT_FIELDS) picked[k] = out[k] ?? null;
  return picked as NewProduct;
}