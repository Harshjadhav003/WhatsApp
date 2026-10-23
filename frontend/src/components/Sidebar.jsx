
import Avatar from "./Avatar";
import {
  formatTime,
  getOtherParticipant,
} from "../utils/chatUtils";

function Sidebar({
  setShowNewChat,
  setUserSearch,
  setSearchedUsers,
  setUserSearchError,
  setToken,
  search,
  setSearch,
  error,
  loadingChats,
  filteredChats,
  currentUserId,
  getChatName,
  selectedId,
  setSelectedId,
  onlineUsers,
}) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">◉</span>
          <span>WhatsApp</span>
        </div>

        <div className="header-actions">
          <button
            className="icon-button new-chat-button"
            title="New chat"
            aria-label="New chat"
            onClick={() => {
              setShowNewChat(true);
              setUserSearch("");
              setSearchedUsers([]);
              setUserSearchError("");
            }}
          >
            +
          </button>

          <button
            className="icon-button"
            title="Log out"
            aria-label="Log out"
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
          >
            ↪
          </button>
        </div>
      </header>

      <div className="search-wrap">
        <span>⌕</span>
        <input
          aria-label="Search chats"
          placeholder="Search your chats"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="filter-row">
        <button
          className="filter active"
          onClick={() => setSearch("")}
        >
          All
        </button>
      </div>

      {error && <p className="empty-search">{error}</p>}

      <div className="chat-list">
        {loadingChats && (
          <p className="empty-search">Loading chats...</p>
        )}

        {!loadingChats &&
          filteredChats.map((chat) => {
            const other = getOtherParticipant(
              chat,
              currentUserId
            );
            const name = getChatName(chat);
            const lastMessage = chat.latestMessage;

            return (
              <button
                className={`chat-item ${
                  String(selectedId) === String(chat._id)
                    ? "selected"
                    : ""
                }`}
                key={chat._id}
                onClick={() => setSelectedId(chat._id)}
              >
                <Avatar
                  name={name}
                  online={onlineUsers.has(String(other?._id))}
                />

                <span className="chat-details">
                  <span className="chat-topline">
                    <span className="chat-name">{name}</span>
                    <span className="chat-time">
                      {formatTime(
                        lastMessage?.createdAt || chat.updatedAt
                      )}
                    </span>
                  </span>

                  <span className="chat-bottomline">
                    <span className="chat-preview">
                      {lastMessage?.content || "No messages yet"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}

        {!loadingChats && filteredChats.length === 0 && (
          <p className="empty-search">
            {search
              ? "No chats match your search."
              : "No chats yet."}
          </p>
        )}
      </div>

      <footer className="sidebar-footer">
        <div className="profile-avatar">H</div>
        <div>
          <strong>You</strong>
          <span>Connected to backend</span>
        </div>
      </footer>
    </aside>
  );
}

export default Sidebar;
