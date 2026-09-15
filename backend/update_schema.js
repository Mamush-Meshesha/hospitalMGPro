const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const insertIntoModel = (modelName, lines) => {
  const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?)\\}`, 'g');
  schema = schema.replace(regex, `$1  ${lines}\n}`);
};

insertIntoModel('location', 'reverse_queue_location queue[]\n  reverse_queue_entry_location queue_entry[]');
insertIntoModel('concept', 'reverse_queue_service queue[] @relation("queue_service")\n  reverse_queue_priority_set queue[] @relation("queue_priority_set")\n  reverse_queue_status_set queue[] @relation("queue_status_set")\n  reverse_queue_entry_priority queue_entry[] @relation("queue_entry_priority")\n  reverse_queue_entry_status queue_entry[] @relation("queue_entry_status")');
insertIntoModel('patient', 'reverse_queue_entry_patient queue_entry[] @relation("queue_entry_patient")');
insertIntoModel('provider', 'reverse_queue_entry_provider queue_entry[]');
insertIntoModel('visit', 'reverse_queue_entry_visit queue_entry[]');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully.');
