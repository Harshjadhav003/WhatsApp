function Avatar({
  name = "U",
  color = "#b8c8ed",
  online = false,
}) {
  return (
    <div className="avatar-wrap">
      <div className="avatar" style={{ backgroundColor: color }}>
        {name.charAt(0).toUpperCase()}
      </div>

      {online && <span className="online-dot" />}
    </div>
  );
}

export default Avatar;