const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, 'tech-logos');
const outputFile = path.join(logosDir, 'sprite.svg');

const files = fs.readdirSync(logosDir).filter(file => file.endsWith('.svg') && file !== 'sprite.svg');

let symbols = '';

files.forEach(file => {
    const filePath = path.join(logosDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const id = file.replace('.svg', '');

    // Simple check for SVG
    if (content.trim().startsWith('<svg') || content.trim().startsWith('<?xml')) {
        // Extract viewBox
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'; // Default if not found

        // Extract content inside <svg> tags
        // This regex tries to capture everything between the first > of <svg...> and the last </svg>
        const bodyMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
        
        if (bodyMatch) {
            const body = bodyMatch[1];
            symbols += `<symbol id="${id}" viewBox="${viewBox}">
${body}
</symbol>
`;
        } else {
            console.warn(`Could not parse SVG content for ${file}`);
        }
    } else {
        console.warn(`Skipping non-SVG file (likely PNG renamed): ${file}`);
    }
});

const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols}</svg>`;

fs.writeFileSync(outputFile, spriteContent);
console.log(`Sprite generated at ${outputFile}`);