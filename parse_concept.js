const fs = require('fs');
const schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

const regex = /model concept \{[\s\S]*?\}/g;
const match = regex.exec(schema);
if (match) {
  console.log(match[0]);
}
