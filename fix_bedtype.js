const fs = require('fs');
const file = 'backend/src/dal/bedType.dal.ts';
let content = fs.readFileSync(file, 'utf8');
if (content.includes('findMany({ take: 50 })')) {
  content = content.replace(/findMany\(\{ take: 50 \}\)/g, "findMany({ where: { retired: false }, take: 50 })");
  fs.writeFileSync(file, content);
  console.log('Fixed:', file);
}
