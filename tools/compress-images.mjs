import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const DIR = "assets/images";

const TARGETS = [
  { file: "teaser-right.png", maxW: 1100 },
  { file: "method.png", maxW: 1100 },
  { file: "result-whole-home.png", maxW: 1200 },
  { file: "result-function-rooms.png", maxW: 1200 },
  { file: "home_dataset_icon.png", maxW: 320 },
  { file: "floorplan_dataset_icon.png", maxW: 320 },
];

async function compressOne({ file, maxW }) {
  const input = path.join(DIR, file);
  const before = (await fs.stat(input)).size;
  const meta = await sharp(input).metadata();
  const width = meta.width > maxW ? maxW : meta.width;

  const pngBuf = await sharp(input)
    .resize(width, null, { withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await fs.writeFile(input, pngBuf);

  const webpPath = path.join(DIR, file.replace(/\.png$/i, ".webp"));
  await sharp(input)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(webpPath);

  const after = (await fs.stat(input)).size;
  const webpSize = (await fs.stat(webpPath)).size;
  console.log(
    `${file}: ${(before / 1024).toFixed(0)} KB → PNG ${(after / 1024).toFixed(0)} KB, WebP ${(webpSize / 1024).toFixed(0)} KB (${width}px)`
  );
}

for (const t of TARGETS) {
  await compressOne(t);
}
