import NewChatModal from "./components/NewChatModal";
import Sidebar from "./components/Sidebar";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "./services/api";
import AuthScreen from "./AuthScreen";
import "./App.css";
import Avatar from "./components/Avatar";
import Conversation from "./components/Conversation";

import {
  getUserId,
  formatTime,
  getOtherParticipant,
} from "./utils/chatUtils";

const SOCKET_URL = "http://localhost:5000";


function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );
  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showNewChat, setShowNewChat] = useState(false);
const [userSearch, setUserSearch] = useState("");
const [searchedUsers, setSearchedUsers] = useState([]);
const [searchingUsers, setSearchingUsers] = useState(false);
const [creatingChat, setCreatingChat] = useState(false);
const [userSearchError, setUserSearchError] = useState("");

console.log("APP COMPONENT RENDERED");

  const currentUserId = token ? getUserId(token) : null;
  const selectedChat = chats.find(
    (chat) => String(chat._id) === String(selectedId)
  );

  const getChatName = useCallback(
    (chat) => {
      const other = getOtherParticipant(chat, currentUserId);
      return other?.name || "Unknown user";
    },
    [currentUserId]
  );

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    setError("");

    try {
      const response = await api.get("/chat");
      const fetchedChats = response.data.chats || [];

      setChats(fetchedChats);

      setSelectedId((previousId) => {
        if (
          previousId &&
          fetchedChats.some(
            (chat) => String(chat._id) === String(previousId)
          )
        ) {
          return previousId;
        }

        return fetchedChats[0]?._id || null;
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        return;
      }

      setError(
        err.response?.data?.message || "Could not load your chats."
      );
    } finally {
      setLoadingChats(false);
    }
  }, []);


  // Search registered users
  const searchRegisteredUsers = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSearchedUsers([]);
      setUserSearchError("");
      setSearchingUsers(false);
      return;
    }

    setSearchingUsers(true);
    setUserSearchError("");

    try {
      const response = await api.get("/chat/users/search", {
        params: { search: query.trim() },
      });

      setSearchedUsers(response.data.users || []);
    } catch (err) {
      setUserSearchError(
        err.response?.data?.message || "Could not search users."
      );
      setSearchedUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  // Create a new chat or open an existing one
  const handleCreateChat = async (userId) => {
    if (creatingChat) return;

    setCreatingChat(true);
    setUserSearchError("");

    try {
      const response = await api.post("/chat", { userId });
      const newChat = response.data.chat;

      if (!newChat?._id) {
        throw new Error("The server did not return a valid chat.");
      }

      // Reload chats to get the latest server-side chat data.
      const chatsResponse = await api.get("/chat");
      const fetchedChats = chatsResponse.data.chats || [];

      setChats(fetchedChats);

      const matchingChat = fetchedChats.find(
        (chat) => String(chat._id) === String(newChat._id)
      );

      if (matchingChat) {
        setSelectedId(matchingChat._id);
      } else {
        // Fallback if the new chat is not in the refreshed list.
        setChats((previousChats) => [newChat, ...previousChats]);
        setSelectedId(newChat._id);
      }

      setShowNewChat(false);
      setUserSearch("");
      setSearchedUsers([]);
    } catch (err) {
      setUserSearchError(
        err.response?.data?.message ||
          err.message ||
          "Could not create or open this chat."
      );
    } finally {
      setCreatingChat(false);
    }
  };


  useEffect(() => {
    if (!token) return;

    loadChats();
  }, [token, loadChats]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((previous) => new Set([...previous, String(userId)]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((previous) => {
        const next = new Set(previous);
        next.delete(String(userId));
        return next;
      });
    });

    socket.on("newMessage", (incoming) => {
      const incomingChatId =
        incoming.chat?._id || incoming.chat;

      if (!incomingChatId) return;

      setChats((previous) => {
        const exists = previous.some(
          (chat) => String(chat._id) === String(incomingChatId)
        );

        if (!exists) {
          loadChats();
          return previous;
        }

        return previous.map((chat) =>
          String(chat._id) === String(incomingChatId)
            ? {
                ...chat,
                latestMessage: incoming,
                updatedAt: incoming.createdAt || new Date().toISOString(),
              }
            : chat
        );
      });

      if (String(incomingChatId) === String(selectedId)) {
        setMessages((previous) => {
          const incomingId = String(incoming._id);

          if (
            previous.some((item) => String(item._id) === incomingId)
          ) {
            return previous;
          }

          return [...previous, incoming];
        });

        api
          .patch(`/message/${incomingChatId}/read`)
          .catch((err) => console.error("Read receipt failed:", err));
      }
    });

    socket.on("messagesRead", ({ chatId, messageIds }) => {
      if (String(chatId) !== String(selectedId)) return;

      const readIds = new Set((messageIds || []).map(String));

      setMessages((previous) =>
        previous.map((item) =>
          readIds.has(String(item._id))
            ? { ...item, readBy: [...(item.readBy || []), currentUserId] }
            : item
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, selectedId, currentUserId, loadChats]);

  useEffect(() => {
    if (!token || !selectedId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError("");

      try {
        const response = await api.get(`/message/${selectedId}`);

        if (!cancelled) {
          setMessages(response.data.messages || []);

          api
            .patch(`/message/${selectedId}/read`)
            .catch((err) => console.error("Read receipt failed:", err));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Could not load messages."
          );
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [token, selectedId]);

  async function sendMessage(event) {
    event.preventDefault();

    const content = message.trim();

    if (!content || !selectedChat || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post("/message/sendMessage", {
        chatId: selectedChat._id,
        content,
      });

      const savedMessage = response.data.data;

      setMessages((previous) => {
        if (
          previous.some(
            (item) => String(item._id) === String(savedMessage._id)
          )
        ) {
          return previous;
        }

        return [...previous, savedMessage];
      });

      setChats((previous) =>
        previous.map((chat) =>
          String(chat._id) === String(selectedChat._id)
            ? {
                ...chat,
                latestMessage: {
                  ...savedMessage,
                  sender: {
                    _id: currentUserId,
                    name: "You",
                  },
                },
                updatedAt: savedMessage.createdAt,
              }
            : chat
        )
      );

      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  if (!token) {
    return <AuthScreen onLogin={setToken} />;
  }

  const filteredChats = chats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(search.toLowerCase())
  );

  return (

<main className="app-shell">
  <Sidebar
    setShowNewChat={setShowNewChat}
    setUserSearch={setUserSearch}
    setSearchedUsers={setSearchedUsers}
    setUserSearchError={setUserSearchError}
    setToken={setToken}
    search={search}
    setSearch={setSearch}
    error={error}
    loadingChats={loadingChats}
    filteredChats={filteredChats}
    currentUserId={currentUserId}
    getChatName={getChatName}
    selectedId={selectedId}
    setSelectedId={setSelectedId}
    onlineUsers={onlineUsers}
  />



<Conversation
  selectedChat={selectedChat}
  currentUserId={currentUserId}
  getChatName={getChatName}
  onlineUsers={onlineUsers}
  loadingChats={loadingChats}
  loadingMessages={loadingMessages}
  messages={messages}
  sendMessage={sendMessage}
  message={message}
  setMessage={setMessage}
  sending={sending}
  onBack={() => setSelectedId(null)}
/>



  <NewChatModal
    showNewChat={showNewChat}
    setShowNewChat={setShowNewChat}
    userSearch={userSearch}
    setUserSearch={setUserSearch}
    searchRegisteredUsers={searchRegisteredUsers}
    searchingUsers={searchingUsers}
    userSearchError={userSearchError}
    searchedUsers={searchedUsers}
    creatingChat={creatingChat}
    handleCreateChat={handleCreateChat}
  />
</main>
 );
}

export default App;
