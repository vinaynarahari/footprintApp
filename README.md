# Footprint App

A full-stack application that calculates carbon footprint based on bank transactions using Plaid API.

## Project Structure

```
footprintApp/
├── frontend/           # Next.js frontend application
├── backend/           # Node.js/Express backend
├── auth-service/      # Authentication microservice
└── docker/           # Docker configuration files
```

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` in each service directory
3. Run `docker-compose up` to start all services

## Development

- Frontend runs on: http://localhost:3000
- Backend API runs on: http://localhost:5000
- Auth Service runs on: http://localhost:4000

## Environment Variables

Each service requires its own `.env` file. See `.env.example` in each service directory for required variables. 