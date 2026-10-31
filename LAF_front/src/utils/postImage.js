// Ảnh dự phòng cho bài đăng Lost / Found.
// - Bài chưa có ảnh  -> tự tạo ảnh minh họa theo loại đồ vật
// - Bài có ảnh nhưng link lỗi -> tự thay bằng ảnh minh họa (qua onError)

const THEMES = {
  "Ví & giấy tờ": { emoji: "🪪", c1: "#0C8B72", c2: "#34B79A" },
  "Đồ điện tử": { emoji: "🔌", c1: "#2563EB", c2: "#60A5FA" },
  "Chìa khóa": { emoji: "🔑", c1: "#D97706", c2: "#FBBF24" },
  "Túi & balo": { emoji: "🎒", c1: "#7C3AED", c2: "#A78BFA" },
  "Đồ dùng cá nhân": { emoji: "🧴", c1: "#0891B2", c2: "#22D3EE" },
};
const DEFAULT_THEME = { emoji: "📦", c1: "#475569", c2: "#94A3B8" };

// Nhận diện đồ vật theo tiêu đề để ảnh sát nội dung hơn
const KEYWORDS = [
  ["tai nghe", "🎧"], ["airpod", "🎧"], ["điện thoại", "📱"], ["iphone", "📱"],
  ["laptop", "💻"], ["máy tính", "💻"], ["sạc", "🔌"], ["chuột", "🖱️"],
  ["chìa khóa", "🔑"], ["chìa", "🔑"], ["thẻ", "🪪"], ["căn cước", "🪪"],
  ["cccd", "🪪"], ["giấy tờ", "🪪"], ["ví", "👛"], ["balo", "🎒"], ["túi", "👜"],
  ["bình nước", "🧴"], ["bình", "🧴"], ["kính", "👓"], ["sách", "📚"],
  ["vở", "📓"], ["áo", "🧥"], ["mũ", "🧢"], ["ô ", "☂️"], ["đồng hồ", "⌚"],
];

const esc = (s) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildPlaceholder = (post) => {
  const category = (post && post.category) || "";
  const title = ((post && (post.title || post.itemName || post.displayTitle)) || "").toLowerCase();
  const theme = THEMES[category] || DEFAULT_THEME;
  const hit = KEYWORDS.find(([kw]) => title.includes(kw));
  const emoji = hit ? hit[1] : theme.emoji;
  const label = esc(category || "Đồ vật");

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${theme.c1}'/><stop offset='1' stop-color='${theme.c2}'/>` +
    `</linearGradient></defs>` +
    `<rect width='600' height='400' fill='url(#g)'/>` +
    `<circle cx='520' cy='50' r='130' fill='white' fill-opacity='0.13'/>` +
    `<circle cx='70' cy='360' r='150' fill='white' fill-opacity='0.10'/>` +
    `<text x='300' y='195' font-size='140' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>` +
    `<text x='300' y='330' font-size='28' font-weight='700' font-family='Arial, sans-serif' ` +
    `fill='white' text-anchor='middle'>${label}</text></svg>`;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

// Trả về ảnh thật nếu có, ngược lại trả ảnh minh họa
export const getPostImage = (post) => {
  const src = post && typeof post.image === "string" ? post.image.trim() : "";
  return src || buildPlaceholder(post);
};

// Dùng: <Image {...postImgProps(post)} />  (tự thay ảnh khi link bị lỗi)
export const postImgProps = (post) => ({
  src: getPostImage(post),
  onError: (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = buildPlaceholder(post);
  },
});