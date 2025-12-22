const fs = require('fs');
const path = require('path');

const inputDir = 'vanilla-portfolio/assets/techs';
const outputFile = 'vanilla-portfolio/assets/techs-sprite.svg';

const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.svg'));

let symbols = '';

files.forEach(file => {
    const filePath = path.join(inputDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const id = path.basename(file, '.svg');

    // Extract viewBox
    const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/);
    let viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'; // Default fallback

    // Extract content inside <svg> tags
    // This regex looks for the opening <svg ...> tag and the closing </svg> tag
    // and captures everything in between.
    const bodyMatch = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
    
    if (bodyMatch) {
        let body = bodyMatch[1];
        // simple cleanup to remove XML declaration if present inside (unlikely but possible)
        body = body.replace(/<\?xml.*?\?>/, '');
        symbols += `<symbol id="${id}" viewBox="${viewBox}">${body}</symbol>\n`;
    } else {
        console.warn(`Could not parse SVG content for ${file}`);
    }
});

const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols}</svg>`;

fs.writeFileSync(outputFile, spriteContent);
console.log(`Sprite generated at ${outputFile}`);
