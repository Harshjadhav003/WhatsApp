
import Avatar from "./Avatar";
import {
  formatTime,
  getOtherParticipant,
} from "../utils/chatUtils";

function Conversation({
  selectedChat,
  currentUserId,
  getChatName,
  onlineUsers,
  loadingChats,
  loadingMessages,
  messages,
  sendMessage,
  message,
  setMessage,
  sending,
  onBack,
}) {
  return (
    <section className="conversation">
      {selectedChat ? (
        <>
          <header className="conversation-header">
            <button
  type="button"
  className="mobile-back-button"
  onClick={onBack}
  aria-label="Back to chats"
>
  ‹
</button>
            <Avatar
              name={getChatName(selectedChat)}
              online={onlineUsers.has(
                String(
                  getOtherParticipant(
                    selectedChat,
                    currentUserId
                  )?._id
                )
              )}
            />

            <div className="contact-info">
              <strong>{getChatName(selectedChat)}</strong>
              <span>
                {onlineUsers.has(
                  String(
                    getOtherParticipant(
                      selectedChat,
                      currentUserId
                    )?._id
                  )
                )
                  ? "online"
                  : "WhatsApp chat"}
              </span>
            </div>
          </header>

          <div className="message-area">
            <div className="encryption-note">
              Messages are loaded from your WhatsApp backend.
            </div>

            {!loadingMessages && messages.length === 0 && (
  <div className="messages-empty-state">
    <span className="messages-empty-icon">✉</span>
    <strong>No messages yet</strong>
    <p>Say hello to start the conversation.</p>
  </div>
)}

            {!loadingMessages &&
              messages.map((item) => {
                const senderId = item.sender?._id || item.sender;
                const mine =
                  String(senderId) === String(currentUserId);

                const readBy = (item.readBy || []).map((user) =>
                  String(user?._id || user)
                );

                const otherUserId = getOtherParticipant(
                  selectedChat,
                  currentUserId
                )?._id;

                const isRead = readBy.includes(
                  String(otherUserId)
                );

                return (
                  <div
                    className={`message-row ${
                      mine ? "outgoing" : "incoming"
                    }`}
                    key={item._id}
                  >
                    <div className="message-bubble">
                      <p>{item.content}</p>

                      <span className="message-meta">
                        {formatTime(item.createdAt)}

                        {mine && (
                          <span
                            className={`ticks ${isRead ? "read" : ""}`}
                            title={isRead ? "Read" : "Sent"}
                          >
                            {isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

            {!loadingMessages && messages.length === 0 && (
              <p className="empty-search">
                Start the conversation 👋
              </p>
            )}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <input
              aria-label="Type a message"
              placeholder="Type a message"
              value={message}
              maxLength={5000}
              onChange={(event) => setMessage(event.target.value)}
            />

            <button
              type="submit"
              className="send-button"
              disabled={!message.trim() || sending}
              aria-label="Send message"
            >
              {sending ? "…" : "➤"}
            </button>
          </form>
        </>
      ) : (
        <div className="empty-conversation">
  {loadingChats ? (
    <div className="empty-state">
      <div className="empty-state-icon loading-icon">◌</div>
      <h2>Loading your chats</h2>
      <p>Getting your conversations ready...</p>
    </div>
  ) : (
    <div className="empty-state">
      <div className="empty-state-icon">☏</div>
      <h2>Keep your conversations close</h2>
      <p>
        Select a chat from the sidebar or start a new conversation.
      </p>
      <span className="empty-state-note">
        Your conversations, all in one place.
      </span>
    </div>
  )}
</div>
      )}
    </section>
  );
}

export default Conversation;
