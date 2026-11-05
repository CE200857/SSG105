package util;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

public class MailUtil {

    // Tài khoản Gmail dùng để GỬI. Mật khẩu ứng dụng (App Password) phải được tạo TỪ CHÍNH tài khoản này.
    private static final String FROM = "zonestevegamer2@gmail.com";

    /**
     * Đọc mật khẩu ứng dụng: ưu tiên biến môi trường LAF_MAIL_PASSWORD,
     * nếu server không thấy biến môi trường thì dùng tham số JVM -DLAF_MAIL_PASSWORD=...
     * Bỏ mọi khoảng trắng vì Google hiển thị mật khẩu dạng "abcd efgh ijkl mnop".
     */
    private static String readPassword() {
        String pass = System.getenv("LAF_MAIL_PASSWORD");
        if (pass == null || pass.trim().isEmpty()) {
            pass = System.getProperty("LAF_MAIL_PASSWORD");
        }
        return pass == null ? "" : pass.replaceAll("\\s+", "");
    }

    public static void send(String to, String subject, String body) throws MessagingException {
        final String pw = readPassword();
        if (pw.isEmpty()) {
            throw new MessagingException("Chưa cấu hình LAF_MAIL_PASSWORD "
                    + "(server không thấy biến môi trường này; hãy đặt rồi KHỞI ĐỘNG LẠI server/IDE)");
        }
        if (pw.length() != 16) {
            System.out.println("[MailUtil] Cảnh báo: mật khẩu ứng dụng Gmail thường dài đúng 16 ký tự, "
                    + "hiện đọc được " + pw.length() + " ký tự.");
        }

        Properties p = new Properties();
        p.put("mail.smtp.host", "smtp.gmail.com");
        p.put("mail.smtp.port", "587");
        p.put("mail.smtp.auth", "true");
        p.put("mail.smtp.starttls.enable", "true");
        p.put("mail.smtp.starttls.required", "true");
        // Tránh lỗi "No appropriate protocol" / handshake trên một số bản Java
        p.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        p.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        p.put("mail.smtp.connectiontimeout", "10000");
        p.put("mail.smtp.timeout", "10000");
        p.put("mail.smtp.writetimeout", "10000");
        // Bật log SMTP chi tiết khi cần: thêm tham số JVM -DLAF_MAIL_DEBUG=true
        if ("true".equalsIgnoreCase(System.getProperty("LAF_MAIL_DEBUG"))) {
            p.put("mail.debug", "true");
        }

        Session session = Session.getInstance(p, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(FROM, pw);
            }
        });

        MimeMessage m = new MimeMessage(session);
        m.setFrom(new InternetAddress(FROM));
        m.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to, false));
        m.setSubject(subject, "UTF-8");
        m.setText(body, "UTF-8");
        Transport.send(m);
    }

    /** Ghép toàn bộ chuỗi nguyên nhân của lỗi để ghi log (getMessage() thường chỉ có phần ngoài cùng). */
    public static String describe(Throwable e) {
        StringBuilder sb = new StringBuilder();
        int guard = 0;
        for (Throwable t = e; t != null && guard < 8; t = t.getCause(), guard++) {
            if (sb.length() > 0) sb.append("  <-  ");
            sb.append(t.getClass().getSimpleName());
            if (t.getMessage() != null) sb.append(": ").append(t.getMessage().replace('\n', ' ').trim());
        }
        return sb.toString();
    }

    /** Gợi ý cách sửa theo nguyên nhân (chỉ ghi log server, không gửi về người dùng). */
    public static String hint(Throwable e) {
        String d = describe(e).toLowerCase();
        if (d.contains("laf_mail_password")) {
            return "Server chưa nhận được biến LAF_MAIL_PASSWORD. Đặt biến, rồi KHỞI ĐỘNG LẠI server (và IDE nếu chạy từ NetBeans/IntelliJ).";
        }
        if (d.contains("authenticationfailed") || d.contains("535") || d.contains("username and password not accepted")
                || d.contains("application-specific password") || d.contains("534")) {
            return "Gmail từ chối đăng nhập: sai mật khẩu ứng dụng, mật khẩu được tạo từ tài khoản khác "
                    + FROM + ", hoặc tài khoản chưa bật Xác minh 2 bước. Tạo lại App Password cho đúng tài khoản này.";
        }
        if (d.contains("pkix") || d.contains("sslhandshake") || d.contains("no appropriate protocol")
                || d.contains("certificate")) {
            return "Lỗi TLS/chứng chỉ: kiểm tra phần mềm diệt virus/proxy đang chặn SSL, hoặc cập nhật Java.";
        }
        if (d.contains("unknownhost") || d.contains("could not connect") || d.contains("timed out")
                || d.contains("connection refused") || d.contains("unreachable") || d.contains("connect timed out")) {
            return "Không kết nối được smtp.gmail.com:587: kiểm tra Internet, tường lửa/diệt virus hoặc mạng (trường/công ty) chặn cổng 587.";
        }
        return "Xem chuỗi nguyên nhân phía trên. Bật -DLAF_MAIL_DEBUG=true để xem toàn bộ hội thoại SMTP.";
    }
}
