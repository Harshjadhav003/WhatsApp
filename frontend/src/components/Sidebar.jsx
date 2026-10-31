import { useState } from "react";
import api from "../services/api";
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
  currentUser,
  loadingProfile,
   setCurrentUser,
})
{
  const [showPhoneModal, setShowPhoneModal] = useState(false);
const [phoneNumber, setPhoneNumber] = useState("");
const [otp, setOtp] = useState("");
const [otpSent, setOtpSent] = useState(false);
const [phoneLoading, setPhoneLoading] = useState(false);
const [phoneFeedback, setPhoneFeedback] = useState({
  type: "",
  message: "",
});

const openPhoneModal = () => {
  setPhoneNumber(
    currentUser?.phoneNumber?.replace("+91", "") || ""
  );
  setOtp("");
  setOtpSent(false);
  setPhoneFeedback({ type: "", message: "" });
  setShowPhoneModal(true);
};

const handleSendOtp = async () => {
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    setPhoneFeedback({
      type: "error",
      message: "Enter a valid 10-digit Indian mobile number.",
    });
    return;
  }

  try {
    setPhoneLoading(true);
    setPhoneFeedback({ type: "", message: "" });

    const response = await api.post("/auth/phone/request-otp", {
      phoneNumber,
    });

    setOtpSent(true);
    setPhoneFeedback({
      type: "success",
      message: response.data.message,
    });
  } catch (error) {
    setPhoneFeedback({
      type: "error",
      message:
        error.response?.data?.message || "Could not send OTP.",
    });
  } finally {
    setPhoneLoading(false);
  }
};

const handleVerifyOtp = async () => {
  if (!/^\d{6}$/.test(otp)) {
    setPhoneFeedback({
      type: "error",
      message: "Enter a valid 6-digit OTP.",
    });
    return;
  }

  try {
    setPhoneLoading(true);
    setPhoneFeedback({ type: "", message: "" });

    const response = await api.post("/auth/phone/verify-otp", {
      otp,
    });

    setCurrentUser((previous) => ({
      ...previous,
      phoneNumber: response.data.phoneNumber,
      phoneVerified: response.data.phoneVerified,
    }));

    setPhoneFeedback({
      type: "success",
      message: response.data.message,
    });

    setShowPhoneModal(false);
  } catch (error) {
    setPhoneFeedback({
      type: "error",
      message:
        error.response?.data?.message || "Could not verify OTP.",
    });
  } finally {
    setPhoneLoading(false);
  }
};
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
  <div className="profile-avatar">
    {currentUser?.name?.charAt(0)?.toUpperCase() || "H"}
  </div>

  <div className="profile-info">
    <strong>{currentUser?.name || "You"}</strong>
    <span>
      {loadingProfile
        ? "Loading profile..."
        : currentUser?.phoneVerified
          ? "Phone verified ✓"
          : "Phone not verified"}
    </span>
  </div>

  <button
    className="phone-manage-button"
    onClick={openPhoneModal}
    disabled={loadingProfile}
  >
    {currentUser?.phoneVerified ? "Manage" : "Verify Phone"}
  </button>
</footer>

{showPhoneModal && (
  <div className="phone-modal-overlay">
    <div className="phone-modal">
      <button
        className="phone-modal-close"
        onClick={() => setShowPhoneModal(false)}
        aria-label="Close"
      >
        ×
      </button>

      <h2>Phone Verification</h2>
      <p>Verify your Indian mobile number using an OTP.</p>

      <label htmlFor="phone-number">Mobile Number</label>
      <div className="phone-input-group">
        <span>+91</span>
        <input
          id="phone-number"
          type="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={phoneNumber}
          disabled={otpSent || phoneLoading}
          onChange={(event) =>
            setPhoneNumber(event.target.value.replace(/\D/g, ""))
          }
        />
      </div>

      {!otpSent ? (
        <button
          className="phone-primary-button"
          onClick={handleSendOtp}
          disabled={phoneLoading}
        >
          {phoneLoading ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <>
          <label htmlFor="phone-otp">Enter 6-digit OTP</label>
          <input
            id="phone-otp"
            className="phone-otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, ""))
            }
          />

          <button
            className="phone-primary-button"
            onClick={handleVerifyOtp}
            disabled={phoneLoading}
          >
            {phoneLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            className="phone-secondary-button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setPhoneFeedback({ type: "", message: "" });
            }}
            disabled={phoneLoading}
          >
            Change Number
          </button>
        </>
      )}

      {phoneFeedback.message && (
        <p className={`phone-feedback ${phoneFeedback.type}`}>
          {phoneFeedback.message}
        </p>
      )}
    </div>
  </div>
)}
    </aside>
  );
}

export default Sidebar;
