import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = './public/icons/icon-512x512.png';
const outputDir = './public/icons';

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error);
    }
  }

  // Also create apple-touch-icon
  try {
    await sharp(sourceIcon)
      .resize(180, 180)
      .png()
      .toFile('./public/apple-touch-icon.png');
    console.log('✅ Generated: ./public/apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Failed to generate apple-touch-icon:', error);
  }

  // Create favicon
  try {
    await sharp(sourceIcon)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon-32x32.png');
    console.log('✅ Generated: ./public/favicon-32x32.png');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error);
  }

  try {
    await sharp(sourceIcon)
      .resize(16, 16)
      .png()
      .toFile('./public/favicon-16x16.png');
    console.log('✅ Generated: ./public/favicon-16x16.png');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error);
  }

  console.log('🎉 All icons generated successfully!');
}

generateIcons();
