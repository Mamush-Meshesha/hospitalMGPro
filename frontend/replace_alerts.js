const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/views');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Make sure sonner is imported
    if (!content.includes("import { toast } from 'sonner'")) {
      // Add import after the first block of imports
      content = content.replace(/(import .*;\n)+/, match => `${match}import { toast } from 'sonner';\n`);
      if (!content.includes("import { toast } from 'sonner'")) {
        // If there were no imports at the top, just put it at the very top
        content = "import { toast } from 'sonner';\n" + content;
      }
    }

    // Replace all alert(...)
    content = content.replace(/alert\((.*?)\)/g, (match, innerText) => {
      const isSuccess = innerText.toLowerCase().includes('success') || innerText.toLowerCase().includes('verif') || innerText.toLowerCase().includes('saved');
      if (isSuccess) {
        return `toast.success(${innerText})`;
      } else {
        return `toast.error(${innerText})`;
      }
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced alerts in ${file}`);
  }
});
