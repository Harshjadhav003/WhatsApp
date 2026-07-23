# WhatsApp Backend 🚀

A backend-only WhatsApp Clone built while learning **Backend Development from first principles**.

This project is not about copying tutorials. Every feature is implemented after understanding **why it exists**, **how it works internally**, and **how it is used in production systems**.

---

# 🎯 Goal

Build a production-ready backend by learning:

- Backend Architecture
- REST APIs
- Authentication & Authorization
- Database Design
- Real-time Communication
- Caching
- Docker
- Deployment
- System Design Thinking

---

# 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token (Upcoming)
- Socket.IO (Upcoming)
- Redis (Upcoming)
- Docker (Upcoming)

---

# 📂 Project Structure

```text
backend/
│
├── src/
│   ├── controllers/
│   │      auth.controller.js
│   │      chat.controller.js
│   │      message.controller.js
│   │
│   ├── routes/
│   │      auth.routes.js
│   │      chat.routes.js
│   │      message.routes.js
│   │
│   ├── models/
│   │      user.model.js
│   │
│   ├── database/
│   │      db.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

# ✅ Current Progress

## Phase 1 — Backend Foundation

- [x] Express Server Setup
- [x] MongoDB Connection
- [x] Environment Variables
- [x] Project Structure
- [x] REST API Basics

---

## Phase 2 — Authentication

### User Model

- [x] User Schema
- [x] Mongoose Model

### Register API

- [x] Request Validation
- [x] Existing User Check
- [x] Password Hashing (bcrypt)
- [x] User Creation
- [x] Error Handling

### Login API

- [x] Validation
- [x] Find User
- [x] Password Comparison
- [x] Login Success Response

---

# 📚 Concepts Learned

## Backend Fundamentals

- Express Routing
- Controllers
- Models
- REST API Design
- Request → Controller → Database → Response Flow

---

## Authentication

- Request Validation
- req.body
- findOne()
- create()
- bcrypt.hash()
- bcrypt.compare()

---

## HTTP Status Codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 409 Conflict

---

## REST API Design

Instead of:

```
/getChats
/createChat
```

Using REST:

```
GET /api/chat

POST /api/chat

GET /api/message/:chatId

POST /api/message
```

---

# 🧠 Backend Thinking

This project focuses on understanding:

- WHY before HOW
- Backend Architecture
- Clean Code
- API Design
- Database Thinking
- System Design Mindset

---

# 🚀 Learning Roadmap

## ✅ Phase 1

- Express
- MongoDB
- Routes
- Controllers
- Models

---

## ✅ Phase 2

- Register API
- Login API
- bcrypt Authentication

---

## 🔄 Phase 3 (Current)

JWT Authentication

- [ ] Install jsonwebtoken
- [ ] Generate JWT
- [ ] Secret Key
- [ ] Verify Token
- [ ] Auth Middleware
- [ ] Protected Routes
- [ ] req.user

---

## ⏳ Phase 4

Chat Model

- [ ] Chat Schema
- [ ] Participants
- [ ] Group Chat Support

---

## ⏳ Phase 5

Chat APIs

- [ ] Create Chat
- [ ] Get Chats
- [ ] Delete Chat

---

## ⏳ Phase 6

Message Model & APIs

- [ ] Message Schema
- [ ] Send Message
- [ ] Get Messages
- [ ] Delete Message

---

## ⏳ Phase 7

Socket.IO

- [ ] Real-time Messaging
- [ ] Online Users
- [ ] Typing Indicator
- [ ] Read Receipts

---

## ⏳ Phase 8

Redis

- [ ] Caching
- [ ] Session Storage
- [ ] Performance Optimization

---

## ⏳ Phase 9

Docker

- [ ] Dockerfile
- [ ] Docker Compose
- [ ] Containerized Backend

---

## ⏳ Phase 10

Production Deployment

- [ ] Environment Configuration
- [ ] Security Best Practices
- [ ] Logging
- [ ] Rate Limiting
- [ ] Deployment
- [ ] Production Ready Backend

---

# 📈 Git History

```text
chore: initialize Express server and MongoDB setup

feat(auth): add User model with Mongoose schema

feat(api): add auth, chat, and message routes with controllers

feat(auth): implement user registration and login with bcrypt authentication
```

---

# 🎯 Project Objective

The objective of this repository is not just to build a WhatsApp backend but to understand how backend systems are designed in real-world applications.

Every feature is implemented by first understanding the problem it solves, followed by its implementation and best practices.

---

# 📌 Current Status

**Current Phase:** JWT Authentication

**Next Milestone:**

- Generate JWT after successful login
- Build Authentication Middleware
- Secure Protected APIs

---

# 📖 Future Learning

After completing this backend, the project will include:

- WebSockets
- Redis
- Docker
- Production Deployment
- Scaling Strategies
- Backend Best Practices
- System Design Concepts

---

# 👨‍💻 Author

**Harsh Jadhav**

Backend Engineer Journey 🚀

Learning one concept at a time with a focus on understanding **WHY before HOW**.