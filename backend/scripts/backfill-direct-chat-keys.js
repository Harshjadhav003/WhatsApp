
require("dotenv").config({ path: "backend/.env" });

const mongoose = require("mongoose");
const Chat = require("../src/models/chat.model");

const buildDirectChatKey = (participants) =>
    participants
        .map((id) => id.toString().toLowerCase())
        .sort()
        .join("_");

async function backfillDirectChatKeys() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");

        const chats = await Chat.find({ isGroupChat: false })
            .select("_id participants isGroupChat directChatKey")
            .lean();

        const keyOwners = new Map();
        const updates = [];

        for (const chat of chats) {
            if (!Array.isArray(chat.participants) ||
                chat.participants.length !== 2) {
                throw new Error(
                    `Chat ${chat._id} does not have exactly 2 participants`
                );
            }

            const key = buildDirectChatKey(chat.participants);
            const existingOwner = keyOwners.get(key);

            if (existingOwner && existingOwner !== chat._id.toString()) {
                throw new Error(
                    `Duplicate direct-chat pair detected: ${existingOwner}, ${chat._id}`
                );
            }

            keyOwners.set(key, chat._id.toString());

            if (chat.directChatKey && chat.directChatKey !== key) {
                throw new Error(
                    `Chat ${chat._id} already has an unexpected directChatKey`
                );
            }

            if (!chat.directChatKey) {
                updates.push({
                    updateOne: {
                        filter: { _id: chat._id },
                        update: { $set: { directChatKey: key } }
                    }
                });
            }
        }

        console.log(`Direct chats checked: ${chats.length}`);
        console.log(`Keys to backfill: ${updates.length}`);

        if (updates.length > 0) {
            const result = await Chat.bulkWrite(updates);
            console.log(`Documents modified: ${result.modifiedCount}`);
        }

        const remaining = await Chat.countDocuments({
            isGroupChat: false,
            $or: [
                { directChatKey: { $exists: false } },
                { directChatKey: null }
            ]
        });

        if (remaining !== 0) {
            throw new Error(`Backfill incomplete: ${remaining} chats missing keys`);
        }

        console.log("Backfill completed and verified.");
    } catch (error) {
        console.error("Backfill failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

backfillDirectChatKeys();
