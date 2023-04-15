import { io, Socket } from "socket.io-client";
import { useRef, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

function App() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);

  const handleLogin = () => {
    if (isConnecting || user) {
      return;
    }

    setIsConnecting(true);

    const socket = io("http://localhost:1996", {
      auth: {
        userEmail: emailInputRef.current!.value,
      },
    });

    socketRef.current = socket;

    socket.on("init", ({ user, friends }: { friends: User[]; user: User }) => {
      setIsConnecting(false);
      setUser(user);
      setFriends(friends);
    });

    socket.on("update", (change: { userId: string; isOnline: boolean }) => {
      setFriends((t) =>
        t.map((it) =>
          it.id === change.userId ? { ...it, isOnline: change.isOnline } : it
        )
      );
    });

    socket.on("error", (message) => {
      alert(String(message));
      handleLogout();
    });
  };

  const handleLogout = () => {
    setUser(null);
    setFriends([]);
    setIsConnecting(false);
    socketRef.current?.disconnect();
  };

  return (
    <div
      className="flex-center"
      style={{
        marginTop: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Online Friends</h1>

      {!user && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Enter email to login</strong>
          </div>
          <input
            ref={emailInputRef}
            type="email"
            name="email"
            style={{
              display: "block",
              width: 200,
              padding: 8,
              fontSize: 12,
            }}
          />
          <button
            onClick={handleLogin}
            style={{ marginTop: 12, padding: "4px 12px" }}
          >
            Login
          </button>
        </div>
      )}

      {user && (
        <div style={{ width: 300 }}>
          {friends.map((it) => (
            <div
              key={it.id}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                border: "solid 1px lightgray",
                padding: 8,
              }}
            >
              <div>{it.name}</div>
              <div
                style={{
                  borderRadius: "100%",
                  backgroundColor: it.isOnline ? "green" : "lightgray",
                  width: 12,
                  height: 12,
                }}
              ></div>
            </div>
          ))}
          <button
            onClick={handleLogout}
            style={{
              display: "block",
              marginTop: 12,
              marginLeft: "auto",
              marginRight: "auto",
              padding: "4px 12px",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
