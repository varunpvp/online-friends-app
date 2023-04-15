interface User {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

const {
  users,
  userFriends,
}: {
  users: User[];
  userFriends: Record<string, string[]>;
} = require("./userMockData.json");

export const findUserByEmail = (email: string) => {
  const user = users.find((it) => it.email === email);

  if (!user) {
    throw new Error(`user with email ${email} not found`);
  }

  return user;
};

export const findUserById = (userId: string) => {
  const user = users.find((it) => it.id === userId);

  if (!user) {
    throw new Error(`user with userId ${userId} not found`);
  }

  return user;
};

export const findUserFriends = (userId: string) => {
  const friendIds = userFriends[userId];
  return friendIds.map((it) => findUserById(it));
};

export const updateUserIsOnline = (userId: string, isOnline: boolean) => {
  const user = findUserById(userId);

  user.isOnline = isOnline;
};
