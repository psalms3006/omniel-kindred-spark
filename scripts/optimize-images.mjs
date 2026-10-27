/**
 * Generate the responsive photo set used by the marketing pages.
 *
 * Source files live in `assets/originals` and are not deployed. The generated
 * AVIF/WebP files are content-sized for the layouts, so a phone never downloads
 * a 4000px camera original to display a 390px-wide image.
 *
 * Run with `npm run images` after replacing an original.
 */
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "assets", "originals");
const outputDir = path.join(root, "public", "images", "photos", "v1");

const widths = [480, 768, 1200, 1600];

/**
 * `focus` is the fractional vertical position used when the source is taller
 * than the target crop. 0 = top, 0.5 = centre, 1 = bottom.
 */
const photos = [
  { name: "nigeria-omniel", file: "nigeria-Omniel-page.jpg", ratio: 2, focus: 0.4 },
  { name: "students-with-omniel", file: "students-with-omniel.jpg", ratio: 16 / 9, focus: 0.5 },
  { name: "creatives-on-laptops", file: "creatives-on-laptops.jpg", ratio: 4 / 3, focus: 0.5 },
  { name: "black-for-teams", file: "black-for-teams.jpg", ratio: 4 / 3, focus: 0.5 },
  { name: "students-omniel", file: "students-omniel.jpg", ratio: 16 / 9, focus: 0.5 },
  { name: "for-teams", file: "for-teams.jpg", ratio: 4 / 3, focus: 0.5 },
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const photo of photos) {
  const source = path.join(sourceDir, photo.file);
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${photo.file}`);
  }

  const sourceRatio = metadata.width / metadata.height;
  let cropWidth = metadata.width;
  let cropHeight = Math.round(metadata.width / photo.ratio);
  let left = 0;
  let top = 0;

  if (sourceRatio > photo.ratio) {
    // The source is wider than the target: crop the sides, keeping the centre.
    cropHeight = metadata.height;
    cropWidth = Math.round(metadata.height * photo.ratio);
    left = Math.round((metadata.width - cropWidth) * 0.5);
  } else {
    // The source is taller than the target: crop top/bottom around the focus.
    cropWidth = metadata.width;
    cropHeight = Math.round(metadata.width / photo.ratio);
    top = Math.round((metadata.height - cropHeight) * photo.focus);
  }

  // Crop once at full resolution, then resize the same pixels for every width.
  const cropped = await sharp(source)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .toBuffer();

  for (const width of widths) {
    const height = Math.round(width / photo.ratio);
    const base = sharp(cropped).resize({ width, height, fit: "cover" });

    await base
      .clone()
      .avif({ quality: 55, effort: 4 })
      .toFile(path.join(outputDir, `${photo.name}-${width}.avif`));

    await base
      .clone()
      .webp({ quality: 80, effort: 4 })
      .toFile(path.join(outputDir, `${photo.name}-${width}.webp`));
  }

  console.log(`${photo.name}: ${widths.length} widths`);
}

console.log(`Wrote responsive photos to ${path.relative(root, outputDir)}`);
