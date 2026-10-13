# WhatsApp Backend 🚀

A backend-focused WhatsApp Clone built while learning **Backend Development from First Principles**.

This project focuses on understanding how real-world backend systems work — from authentication and database design to real-time communication and scalable architecture.

Rather than simply copying tutorials, the goal is to understand **WHY a feature exists, HOW it works internally, and WHERE it is used in production systems**.

## 🎯 Project Goals

- Build RESTful APIs using Node.js and Express.js
- Implement authentication and authorization using JWT
- Design database schemas using MongoDB and Mongoose
- Develop one-to-one chat and messaging functionality
- Enable real-time communication using Socket.IO
- Implement message read receipts
- Learn caching, containerization, deployment, and backend optimization

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB Atlas | Database |
| Mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| JSON Web Token (JWT) | Authentication |
| Socket.IO | Real-time communication |
| dotenv | Environment configuration |
| Thunder Client | API testing |

### Planned Technologies

- Redis — Caching and performance optimization
- Docker — Containerization
- Cloud deployment — Hosting and production configuration

## 📂 Project Structure

```text
whatsapp/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── chat.controller.js
│   │   │   └── message.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   └── message.routes.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── chat.model.js
│   │   │   └── message.model.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── database/
│   │   │   └── db.js
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── socket-test.js
└── README.md
```

*Note: The structure above represents the main files used in the project. Update it if your local folder or filenames differ.*

## ✅ Current Implementation

### Phase 1 — Backend Foundation

- [x] Express server setup
- [x] MongoDB Atlas connection
- [x] Environment variables using dotenv
- [x] Modular routes, controllers, and models
- [x] REST API structure
- [x] Centralized request handling through Express

### Phase 2 — Authentication & Authorization

- [x] User model and schema
- [x] User registration API
- [x] Request validation
- [x] Duplicate email checking
- [x] Password hashing with bcryptjs
- [x] Login API
- [x] Password comparison
- [x] JWT generation after successful login
- [x] JWT verification middleware
- [x] Protected API routes
- [x] Authenticated user information through `req.user`

### Phase 3 — Chat Management

- [x] Chat model using Mongoose
- [x] Chat participants
- [x] One-to-one chat creation
- [x] Existing chat lookup
- [x] Fetch chats for the authenticated user
- [x] Latest message reference in chat data

### Phase 4 — Messaging APIs

- [x] Message model
- [x] Sender and chat references
- [x] Message content validation
- [x] Send message API
- [x] Fetch messages for a chat
- [x] Update chat's latest message
- [x] Message read tracking using `readBy`

### Phase 5 — Real-Time Communication

- [x] Socket.IO server integration
- [x] JWT authentication for socket connections
- [x] User-specific socket rooms
- [x] Real-time `newMessage` event delivery
- [x] Message read-receipt API
- [x] `messagesRead` event emission
- [x] Socket test client for read-receipt events
- [ ] Final end-to-end verification of database updates and sender-side read receipts
- [ ] Online/offline user status
- [ ] Typing indicators
- [ ] Message delivery receipts

## 🧠 Concepts Learned

### Backend Fundamentals

- Express routing and middleware
- Controller-model separation
- RESTful API design
- Request → Middleware → Controller → Database → Response flow
- HTTP status codes and error handling

### Authentication

- Password hashing with `bcryptjs`
- JWT generation and verification
- Bearer token authentication
- Protected routes
- Authenticated user context using `req.user`

### Database Design

- Mongoose schemas and models
- ObjectId references between collections
- Chat participants
- Message-to-chat relationships
- Updating the latest message
- Tracking read messages with `$addToSet`

### Real-Time Systems

- Socket.IO connection lifecycle
- JWT-authenticated socket connections
- User-specific rooms
- Event-based communication
- Real-time message notifications
- Read-receipt event delivery

## 🔌 API Overview

The following routes describe the implemented API functionality. Confirm the exact paths in the route files before using them.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/chat` | Fetch the user's chats |
| POST | `/api/chat` | Create or retrieve a one-to-one chat |
| GET | `/api/message/:chatId` | Fetch messages for a chat |
| POST | `/api/message` | Send a message |
| PATCH | `/api/message/:chatId/read` | Mark received messages as read |

Protected routes require a valid JWT according to the configured authentication middleware.

## 🔐 Security Practices

- Passwords are hashed before storage.
- Protected APIs verify JWTs.
- Socket connections authenticate using a JWT.
- Secrets and database credentials are stored in environment variables.
- `.env` must not be committed to GitHub.
- Production deployment should include appropriate validation, rate limiting, secure configuration, and error handling.

## 🚧 Roadmap

### Phase 6 — Reliability & Security

- [ ] Test invalid and malformed IDs
- [ ] Test unauthorized chat access
- [ ] Improve input validation
- [ ] Add rate limiting
- [ ] Review error handling and logging
- [ ] Test read receipts end to end

### Phase 7 — Advanced Chat Features

- [ ] Group chat management
- [ ] Add/remove group participants
- [ ] Online/offline status
- [ ] Typing indicators
- [ ] Message delivery receipts
- [ ] Message deletion and pagination

### Phase 8 — Redis

- [ ] Redis fundamentals and integration
- [ ] Cache frequently accessed data
- [ ] Evaluate caching and invalidation strategies
- [ ] Explore Redis Pub/Sub for multi-instance real-time communication

### Phase 9 — Docker

- [ ] Create a backend Dockerfile
- [ ] Configure Docker Compose
- [ ] Manage environment variables securely
- [ ] Test the containerized backend

### Phase 10 — Deployment & Production Readiness

- [ ] Deploy the backend
- [ ] Configure production environment variables
- [ ] Add structured logging
- [ ] Add health checks
- [ ] Test production API behavior
- [ ] Document API usage and setup instructions

## 📈 Git History

Recent implementation milestones:

```text
feat(chat): implement message read receipts
feat(api): add mark messages as read route
test(socket): verify real-time read receipt events
```

The project is developed incrementally with meaningful commits that reflect actual implementation and testing.

## 🎯 Project Objective

The objective is to build more than a basic CRUD backend.

This project is a practical journey toward understanding backend engineering concepts such as authentication, authorization, database relationships, real-time systems, reliability, caching, containerization, and deployment.

The long-term goal is to evolve this backend into a more robust, production-oriented messaging system.

## 👨‍💻 Author

**Harsh Jadhav**

Computer Engineering Student | Aspiring Backend Engineer

*Learning one concept at a time — understanding WHY before HOW.*
