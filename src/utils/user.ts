export function getUserId() {

  let userId = localStorage.getItem("kards_user");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2,8);
    localStorage.setItem("kards_user", userId);
  }

  return userId;
}