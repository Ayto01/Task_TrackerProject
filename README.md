# Task Tracker

A full-stack web app for managing personal tasks. Create an account,
sign in, and organize your own task list.

## Features

- Account registration, sign-in, and sign-out
- Add, edit, complete, and delete tasks
- Filter tasks by All, Active, or Completed
- Private task lists for each account
- Persistent data in PostgreSQL

## Built with

- HTML, CSS, and JavaScript
- Node.js and Express
- PostgreSQL and Drizzle ORM
- Docker Compose for local development

## Run locally

Install Node.js 24 and Docker with Compose. From a fresh clone,
run these commands in the project folder:

```bash
docker compose up -d --wait db
cd server
cp .env.example .env
npm ci
npx drizzle-kit migrate
node index.js
```

Open `http://127.0.0.1:3000/`. Select **Create an account**, then sign
in and add your first task.

## Project structure

- `public/` contains the browser interface.
- `server/` contains the Express API and session logic.
- `server/db/` contains the database connection and schema.
- `server/drizzle/` contains database migrations.