// Bài chia sẻ được lưu cục bộ trong trình duyệt (localStorage). Các hàm dưới đây giúp
// bài chia sẻ biến mất cùng bài gốc khi bài gốc bị xóa.

const KEY = "laf_shared_posts";

export const readShares = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const typeOf = (share) =>
  String(share?.postType || share?.originalPost?.type || "").toLowerCase();

// Xóa mọi bài chia sẻ của bài gốc (postType: "lost" | "found" | "forum")
export const removeSharesOfPost = (postType, postId) => {
  const all = readShares();
  const next = all.filter(
    (s) =>
      !(
        typeOf(s) === postType &&
        Number(s?.originalPost?.id) === Number(postId)
      ),
  );
  if (next.length !== all.length) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
  }
};

// Bài chia sẻ chỉ còn hợp lệ khi bài gốc vẫn tồn tại.
// lists = { lost, found, forum }: danh sách bài lấy từ server (null/undefined = tải lỗi -> không lọc loại đó)
export const shareOriginalExists = (share, lists) => {
  const list = lists?.[typeOf(share)];
  if (!Array.isArray(list)) return true;
  const id = Number(share?.originalPost?.id);
  return list.some((p) => Number(p.id) === id);
};
