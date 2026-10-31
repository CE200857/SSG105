import axios from "axios";

// type: "lost" | "found" | "forum" | "review"
const ENDPOINT = {
  lost: ["/api/lost-posts", "postId"],
  found: ["/api/found-posts", "postId"],
  forum: ["/api/forum", "postId"],
  review: ["/api/reviews", "reviewId"],
};

// Student đổi chế độ xem (Public / Private) cho bài của chính mình
export const setPostVisibility = async (type, id, email, visibility) => {
  const cfg = ENDPOINT[type];
  if (!cfg || !email) return false;
  try {
    const params = new URLSearchParams();
    params.append("action", "visibility");
    params.append(cfg[1], id);
    params.append("email", email);
    params.append("visibility", visibility);
    const res = await axios.post(cfg[0], params);
    return !!(res.data && res.data.success);
  } catch {
    return false;
  }
};
