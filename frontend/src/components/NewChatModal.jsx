
import Avatar from "./Avatar";

function NewChatModal({
  showNewChat,
  setShowNewChat,
  userSearch,
  setUserSearch,
  searchRegisteredUsers,
  searchingUsers,
  userSearchError,
  searchedUsers,
  creatingChat,
  handleCreateChat,
}) {
  if (!showNewChat) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setShowNewChat(false);
        }
      }}
    >
      <section
        className="new-chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
      >
        <header className="new-chat-modal-header">
          <h2 id="new-chat-title">New chat</h2>

          <button
            className="icon-button"
            aria-label="Close new chat"
            onClick={() => setShowNewChat(false)}
          >
            ×
          </button>
        </header>

        <input
          className="user-search-input"
          type="search"
          placeholder="Search name or email..."
          aria-label="Search registered users"
          value={userSearch}
          onChange={(event) => {
            const value = event.target.value;
            setUserSearch(value);
            searchRegisteredUsers(value);
          }}
        />

        <div className="user-search-results">
          {userSearch.trim().length < 2 && (
            <p className="empty-search">
              Type at least 2 characters to find users.
            </p>
          )}

          {searchingUsers && (
            <p className="empty-search">Searching users...</p>
          )}

          {userSearchError && (
            <p className="empty-search">{userSearchError}</p>
          )}

          {!searchingUsers &&
            !userSearchError &&
            userSearch.trim().length >= 2 &&
            searchedUsers.length === 0 && (
              <p className="empty-search">No users found.</p>
            )}

          {searchedUsers.map((user) => (
            <button
              className="user-result"
              key={user._id}
              disabled={creatingChat}
              onClick={() => handleCreateChat(user._id)}
            >
              <Avatar name={user.name || "U"} />

              <span className="user-result-details">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </span>

              {creatingChat && (
                <span className="user-result-status">
                  Opening...
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default NewChatModal;
