const fs = require('fs');
const schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

const models = [
  'patient_identifier_type',
  'encounter_role',
  'order_type',
  'order_frequency',
  'relationship_type',
  'location_tag',
  'person_attribute_type',
  'location_attribute_type',
  'provider_attribute_type'
];

models.forEach(model => {
  const regex = new RegExp(`model ${model} \\{[\\s\\S]*?\\}`, 'g');
  const match = regex.exec(schema);
  if (match) {
    console.log(`\n--- ${model} ---`);
    const lines = match[0].split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('//') || line === '' || line.startsWith('model') || line.startsWith('}')) return;
      if (line.includes('@relation')) return;
      if (line.includes('@@')) return;
      
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const type = parts[1];
        if (!type.endsWith('?') && !line.includes('@default') && !line.includes('@id')) {
          console.log(`  Required: ${name} (${type})`);
        }
      }
    });
  }
});
