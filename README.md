# Dropbox clone

## Prerequisites

* [Docker](https://www.docker.com/) installed and running
* [Node.js](https://nodejs.org/) (version >= 14) and npm installed

## Setup

1. Clone the repository:

   git clone https://github.com/Madhumitha307/Dropbox-Clone.git
   cd Dropbox-Clone

2. (Optional) Build Docker images:
   docker-compose build

## Commands

### Start Docker Services

This will start any required services (e.g., database) defined in `docker-compose.yml`:
docker-compose up -d

To stop and remove containers:
docker-compose down

### Start Client

Install dependencies and start the client(frontend) application:
cd client
npm install
npm start

### Start Server

Install dependencies and start the server(backend):

cd server
npm install
npm start

## Combined Workflow
You can run all services in parallel with:

# Start Docker services
docker-compose up -d

# In separate terminal windows/tabs:
cd client && npm install && npm start
cd server  && npm install && npm start

