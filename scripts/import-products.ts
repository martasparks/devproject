// /scripts/import-products.ts
import fs from "node:fs";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";
import { normalizeRow, OldRow } from "./map";

const prisma = new PrismaClient();

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function readCsv(path: string) {
  const rows: OldRow[] = [];
  const parser = fs.createReadStream(path).pipe(parse({ columns: true, trim: true }));
  for await (const rec of parser) rows.push(rec as OldRow);
  return rows;
}

async function main() {
  const csvPath = process.env.ITEMS_CSV || "scripts/items.csv";

  console.log(`Lasu CSV: ${csvPath}`);
  const raw = await readCsv(csvPath);

  // Normalizē un izmet ierakstus bez minimāli vajadzīgā
  const bad: any[] = [];
  const data = raw.map(normalizeRow).filter((p) => {
    const ok = !!p.name && !!p.productCode;
    if (!ok) bad.push(p);
    return ok;
  });

  if (bad.length) {
    fs.writeFileSync("scripts/items_bad_rows.json", JSON.stringify(bad, null, 2));
    console.warn(`Brīdinājums: izlaisti ${bad.length} ieraksti (bez name/productCode). Saglabāts: scripts/items_bad_rows.json`);
  }

  // Čanko pa 500
  const CHUNK = 500;
  const chunks = chunk(data, CHUNK);

  let total = 0;
  for (let i = 0; i < chunks.length; i++) {
    const res = await prisma.product.createMany({
      data: chunks[i],
      // Lai "skipDuplicates" strādātu, DB jābūt UNIQUE indeksam (piem. uz productCode vai slug)
      skipDuplicates: true,
    });
    total += res.count;
    console.log(`Čanks ${i + 1}/${chunks.length}: +${res.count} ⇒ kopā ${total}`);
  }

  console.log("✅ Import pabeigts.");
}

main()
  .catch((e) => {
    console.error("❌ Import neizdevās:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });