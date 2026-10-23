export function getUserId(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || payload._id || null;
  } catch {
    return null;
  }
}

export function formatTime(date) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getOtherParticipant(chat, currentUserId) {
  return chat.participants?.find(
    (participant) =>
      String(participant._id) !== String(currentUserId)
  );
}