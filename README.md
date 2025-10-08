# Course Management System

## Setup
1. Copy .env.example to .env and fill in values.
2. Run MongoDB, Redis, RabbitMQ (use Docker as suggested).
3. `npm install`
4. `npm run start:dev` - Runs at http://localhost:3000
5. Swagger: http://localhost:3000/api-docs
6. Tests: `npm run test`

## Features
- All as per assignment checklist.
- Admin can be created manually in DB with role 'Admin'.
- Queue consumer logs 'send email' to console.