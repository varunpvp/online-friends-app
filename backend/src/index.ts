import http from "http";
import { createRedisClient } from "./redis";
import { Server } from "socket.io";
import { findUserByEmail, findUserFriends, updateUserIsOnline } from "./users";

const port = Number(process.env.PORT || "8080");

const httpServer = http.createServer();

const ioServer = new Server(httpServer, { cors: { origin: "*" } });

const pub = createRedisClient();

ioServer.on("connection", async (socket) => {
  try {
    const sub = createRedisClient();

    const user = findUserByEmail(socket.handshake.auth.userEmail);

    const friends = findUserFriends(user.id);

    // update the user status in db
    updateUserIsOnline(user.id, true);

    // send the user's friend list
    socket.emit("init", { user, friends });

    // notify friends about user's status change
    await pub.publish(
      user.id,
      JSON.stringify({ userId: user.id, isOnline: true })
    );

    // subscribe to friends status updates
    await sub.subscribe(...friends.map((it) => it.id));

    // on friends status updates notify to user
    sub.on("message", (_, change) => {
      socket.emit("update", JSON.parse(change));
    });

    socket.on("disconnect", async () => {
      updateUserIsOnline(user.id, false);
      await pub.publish(
        user.id,
        JSON.stringify({ userId: user.id, isOnline: false })
      );
      await sub.unsubscribe();
      sub.disconnect();
    });
  } catch (error) {
    console.log("error", error);
    socket.emit("error", String(error));
    socket.disconnect();
  }
});

ioServer.listen(port);
console.log("server running on", port);
