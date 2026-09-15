#!/bin/sh

echo "Waiting for database to be ready..."
# The depends_on healthcheck handles this mostly, but good practice.
npx prisma db push --accept-data-loss
npx prisma db seed

echo "Starting backend server..."
npm run start
