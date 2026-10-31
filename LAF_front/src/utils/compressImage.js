// Nén ảnh trước khi gửi lên server: thu nhỏ về tối đa 900px + JPEG chất lượng 72%.
// Giúp ảnh (dạng base64) đủ nhẹ để lưu vào DB và không vượt giới hạn dung lượng request.
export const compressImage = (file, maxSize = 900, quality = 0.72) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result); // không đọc được -> giữ nguyên
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
