fetch('http://localhost:5173/api/v1/provider', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Dr. Testing",
    identifier: "PRV-9999",
    specialty: "Cardiology",
    department: "Surgery",
    email: "test@example.com",
    phone: "123-456-7890",
    creator: 1
  })
}).then(res => res.json()).then(console.log).catch(console.error);
