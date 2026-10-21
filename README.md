# WhatsApp Backend

A backend-focused WhatsApp clone built to learn backend engineering fundamentals, API design, authentication, database modeling, and real-time communication.

## Tech Stack

- Node.js
- Express.js 5
- MongoDB Atlas
- Mongoose
- bcryptjs
- JSON Web Token (JWT)
- Socket.IO
- dotenv
- cookie-parser
- CORS

## Implemented Features

### Authentication
- User registration and login
- Password hashing and verification using bcryptjs
- JWT-based authentication
- Authentication middleware for protected routes

### Chats and Messages
- Create and retrieve one-to-one chats
- Persist messages in MongoDB
- Track the latest message for a chat
- Restrict message access to authorized chat participants

### Real-Time Communication
- JWT-authenticated Socket.IO connections
- Personal user rooms for event delivery
- Real-time `newMessage` event
- Read receipts using `readBy`
- `messagesRead` event for read-receipt updates
- `userOnline` and `userOffline` presence events
- Support for multiple socket connections per user

## Project Structure

```text
whatsapp/
├── README.md
└── backend/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── chat.controller.js
    │   │   └── message.controller.js
    │   ├── database/
    │   ├── middlewares/
    │   │   └── auth.middleware.js
    │   ├── models/
    │   │   ├── user.model.js
    │   │   ├── chat.model.js
    │   │   └── message.model.js
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── chat.routes.js
    │   │   └── message.routes.js
    │   ├── services/
    │   └── utils/
    ├── app.js
    ├── server.js
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas or another MongoDB instance

### Installation

```bash
git clone <your-repository-url>
cd whatsapp/backend
npm install
```

Create a `.env` file inside `backend/` and configure the environment variables expected by your application. Check your local code for their exact names. Never commit credentials, tokens, or secret values.

### Run the Backend

```bash
npm run dev
```

For normal startup:

```bash
npm start
```

## Testing

Use Thunder Client or Postman to test authentication, chat endpoints, message sending, and read receipts. Use an authenticated Socket.IO client to test real-time messaging and presence events.

## Roadmap

Potential future improvements:

- Typing indicators
- Redis caching and scaling
- Docker and Docker Compose
- Rate limiting and structured logging
- Automated integration tests
- Production deployment

## Learning Goals

Understand why backend features are needed, how they work internally, and how to implement them using maintainable code.

## Author

**Harsh Jadhav**

Learning backend engineering one concept at a time — WHY before HOW.
