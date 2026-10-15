const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '../products.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error("❌ Սխալ. products.xlsx ֆայլը չգտնվեց նախագծի արմատում:");
  process.exit(1);
}

const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const dataRows = typeof rows[0][0] === 'string' && isNaN(Number(rows[0][0])) ? rows.slice(1) : rows;

console.log(`📦 Գտնվեց ${dataRows.length} ապրանք: Սկսվում է խելացի մշակումը...`);

const KNOWN_BRANDS = [
  'GANZER', 'VIEIR', 'LEDEME', 'HANSEN', 'GERHANS', 
  'ACCOONA', 'LEMARK', 'BRAVAT', 'FRAP', 'GAPPO', 'KRAUS'
];

// Բրենդն ու Գործարանային Արտիկուլը (Model) անջատող ֆունկցիա
function extractBrandAndModel(title) {
  let brand = 'TAB.AM';
  let factoryCode = '';

  for (const b of KNOWN_BRANDS) {
    const brandRegex = new RegExp(`\\b${b}\\b`, 'i');
    if (brandRegex.test(title)) {
      brand = b;
      // Բրենդից անմիջապես հետո եկող կոդը (օր.՝ VIEIR V343562-S -> V343562-S)
      const afterBrandRegex = new RegExp(`\\b${b}\\s+([A-Za-z0-9\\-_]+)`, 'i');
      const match = title.match(afterBrandRegex);
      if (match && match[1]) {
        factoryCode = match[1].replace(/[,.]/g, '').trim();
      }
      break;
    }
  }

  // Եթե բրենդից հետո չգտավ, փնտրում ենք տիպիկ գործարանային կոդ (օր.՝ L109pvc-A60)
  if (!factoryCode) {
    const fallbackRegex = /\b([A-Za-z]+[0-9]+[A-Za-z0-9\-_]*|[A-Za-z0-9]+-[A-Za-z0-9]+)\b/;
    const fbMatch = title.match(fallbackRegex);
    if (fbMatch && fbMatch[1] && !KNOWN_BRANDS.includes(fbMatch[1].toUpperCase())) {
      factoryCode = fbMatch[1];
    }
  }

  return { brand, factoryCode };
}

function detectCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('պահարան')) return { slug: 'cabinets', name: 'Լոգարանի Պահարաններ' };
  if (t.includes('ծորակ')) return { slug: 'faucets', name: 'Ծորակներ' };
  if (t.includes('ցնցուղ')) return { slug: 'showers', name: 'Ցնցուղներ և Համակարգեր' };
  if (t.includes('լվացարան')) return { slug: 'washbasins', name: 'Լվացարաններ' };
  if (t.includes('հայելի')) return { slug: 'mirrors', name: 'Հայելիներ և LED Հայելիներ' };
  if (t.includes('չորանոց')) return { slug: 'towel-dryers', name: 'Չորանոցներ / Սրբիչաչորանոցներ' };
  if (t.includes('զուգարան') || t.includes('ունիտազ') || t.includes('ինստալյացիա')) return { slug: 'toilets', name: 'Զուգարաններ և Ինստալյացիաներ' };
  if (t.includes('ֆիլտր')) return { slug: 'water-filters', name: 'Խմելու Ջրի Ֆիլտրեր' };
  if (t.includes('աքսեսուար') || t.includes('կախիչ') || t.includes('օճառաման') || t.includes('սիֆոն')) return { slug: 'accessories', name: 'Լոգարանի Աքսեսուարներ' };
  return { slug: 'ceramics', name: 'Սանկերամիկա' };
}

function parseSpecs(rawSpecs) {
  const specs = {};
  if (!rawSpecs || typeof rawSpecs !== 'string') return specs;
  const lines = rawSpecs.split(/\r?\n/);
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (key && val) specs[key] = val;
    }
  });
  return specs;
}

const products = [];

dataRows.forEach((row, index) => {
  const code = String(row[0] || '').trim();
  if (!code) return;

  const rawTitle = String(row[1] || '').trim();
  const cleanTitle = rawTitle.replace(/\s*\(ԿՈԴ\s*[^)]+\)\s*$/i, '').trim();

  // Առանձնացնում ենք Բրենդն ու Գործարանային Արտիկուլը
  const { brand, factoryCode } = extractBrandAndModel(cleanTitle);

  const price = parseInt(row[4], 10) || null;
  const oldPrice = parseInt(row[5], 10) || null;
  const rawSpecs = row[8] || '';
  const specs = parseSpecs(rawSpecs);

  // Եթե գործարանային կոդը գտել ենք, ավելացնում ենք նաև պարամետրերի մեջ
  if (factoryCode && !specs['Գործարանային մոդել']) {
    specs['Մոդել'] = factoryCode;
  }

  // Նկարների և CAD Գծագրի առանձնացում
  let images = [];
  let blueprintImage = undefined;
  if (row[10]) {
    const allImgs = String(row[10]).split('|').map(s => s.trim()).filter(Boolean);
    allImgs.forEach(img => {
      if (img.toLowerCase().includes('model')) {
        blueprintImage = img;
      } else {
        images.push(img);
      }
    });
    if (images.length === 0 && allImgs.length > 0) {
      images = allImgs;
    }
  } else if (row[9]) {
    images = [String(row[9]).trim()];
  }

  let slug = `product-${code}`;
  if (row[11]) {
    try {
      const urlObj = new URL(String(row[11]).trim());
      const segments = urlObj.pathname.split('/').filter(Boolean);
      slug = segments[segments.length - 1] || slug;
    } catch {
      slug = `product-${code}`;
    }
  }

  const category = detectCategory(cleanTitle);

  products.push({
    id: index + 1,
    code: code,                    // Ներքին կոդ (օր.՝ 11103)
    factoryCode: factoryCode || undefined, // Գործարանային մոդել (օր.՝ V343562-S)
    title: cleanTitle,
    slug: slug,
    categorySlug: category.slug,
    categoryName: category.name,
    brand: brand,                  // Բրենդը (օր.՝ VIEIR)
    price: price,
    oldPrice: oldPrice && oldPrice > (price || 0) ? oldPrice : undefined,
    inStock: true,
    stockQuantity: 10,
    images: images.length > 0 ? images : ['/placeholder.png'],
    blueprintImage: blueprintImage,
    shortDesc: cleanTitle,
    specs: specs,
    isFeatured: index < 8
  });
});

const outputTs = `import { Product } from '@/types';\n\nexport const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n`;
const outputPath = path.join(__dirname, '../data/products.ts');
fs.writeFileSync(outputPath, outputTs, 'utf-8');

console.log(`✅ Պատրաստ է! Մշակվեց ${products.length} ապրանք: Բրենդներն ու գործարանային մոդելները (V343562-S և այլն) առանձնացված են:`);