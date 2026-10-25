const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    directChatKey: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Index must come AFTER chatSchema is initialized.
chatSchema.index(
  { directChatKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      directChatKey: { $type: "string" },
    },
    name: "unique_direct_chat_key",
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;