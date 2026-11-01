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
    private static final String FROM = "zonestevegamer2@gmail.com";

    public static void send(String to, String subject, String body) throws MessagingException {
        // Mật khẩu ỨNG DỤNG 16 ký tự của Gmail (không phải mật khẩu đăng nhập Gmail)
        String pass = System.getenv("LAF_MAIL_PASSWORD");
        if (pass == null) pass = "fxst ibgk laty ryfr";
        final String pw = pass;

        Properties p = new Properties();
        p.put("mail.smtp.host", "smtp.gmail.com");
        p.put("mail.smtp.port", "587");
        p.put("mail.smtp.auth", "true");
        p.put("mail.smtp.starttls.enable", "true");
        p.put("mail.smtp.connectiontimeout", "10000");
        p.put("mail.smtp.timeout", "10000");

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
}