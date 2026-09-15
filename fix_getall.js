const fs = require('fs');
const files = [
  'backend/src/dal/patientidentifiertype.dal.ts',
  'backend/src/dal/encounterrole.dal.ts',
  'backend/src/dal/ordertype.dal.ts',
  'backend/src/dal/orderfrequency.dal.ts',
  'backend/src/dal/relationshiptype.dal.ts',
  'backend/src/dal/locationtag.dal.ts',
  'backend/src/dal/personattributetype.dal.ts',
  'backend/src/dal/locationattributetype.dal.ts',
  'backend/src/dal/providerattributetype.dal.ts',
  'backend/src/dal/encountertype.dal.ts',
  'backend/src/dal/bedtype.dal.ts',
  'backend/src/dal/visittype.dal.ts'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    // For relationships
    if (content.includes('findMany({ take: 50 })')) {
      content = content.replace(/findMany\(\{ take: 50 \}\)/g, "findMany({ where: { retired: false }, take: 50 })");
      fs.writeFileSync(file, content);
      console.log('Fixed:', file);
    } else {
      console.log('Skipped (already fixed or different format):', file);
    }
  } catch(e) {
    console.log('Error processing', file, e.message);
  }
}
