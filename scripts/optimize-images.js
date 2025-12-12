const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'img');
const OUTPUT_DIR = path.join(INPUT_DIR, 'webp');

if (!fs.existsSync(INPUT_DIR)) {
  console.error('img directory not found:', INPUT_DIR);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
if (!files.length) {
  console.log('No JPG/PNG files found in img/.');
  process.exit(0);
}

console.log(`Optimizing ${files.length} images...`);

(async () => {
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const name = path.parse(file).name;
    const outputPath = path.join(OUTPUT_DIR, name + '.webp');

    try {
      // create a webp at quality 80 and a resized max width 1200px
      await sharp(inputPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      const inStat = fs.statSync(inputPath).size;
      const outStat = fs.statSync(outputPath).size;
      console.log(`${file} -> webp/${name}.webp  (${(inStat/1024).toFixed(1)}KB -> ${(outStat/1024).toFixed(1)}KB)`);
    } catch (err) {
      console.error('Failed to process', file, err.message || err);
    }
  }
  console.log('Optimization complete. WebP images are in img/webp/');
})();
