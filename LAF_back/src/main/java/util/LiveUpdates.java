package util;

import entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

/** Publish only after a successful database mutation. The payload contains topic names only. */
public final class LiveUpdates {
    private LiveUpdates() { }

    public static void changed(HttpServletRequest request, Map<String, Object> result) {
        if (!Boolean.TRUE.equals(result.get("success"))) return;
        String path = request.getServletPath();
        if ("/api/notifications".equals(path)) {
            HttpSession session = request.getSession(false);
            Object user = session == null ? null : session.getAttribute("user");
            if (user instanceof Users) UpdateHub.notification(((Users) user).getUserID());
            return;
        }
        String type;
        switch (path) {
            case "/api/lost-posts": type = "lost"; break;
            case "/api/found-posts": type = "found"; break;
            case "/api/forum": type = "forum"; break;
            case "/api/reviews": type = "reviews"; break;
            case "/api/comments": type = request.getParameter("type"); break;
            case "/api/shares": type = "profile"; break;
            case "/api/admin":
                type = request.getParameter("entity");
                if ("moderation".equals(type)) type = request.getParameter("postType");
                break;
            default: type = "profile";
        }
        if ("user".equals(type)) UpdateHub.publish("users");
        if ("review".equals(type)) type = "reviews";
        if ("lost".equals(type) || "found".equals(type) || "forum".equals(type) || "reviews".equals(type)) {
            UpdateHub.publish(type, "home", "overview", "admin", "profile");
        } else {
            UpdateHub.publish("lost", "found", "forum", "reviews", "home", "overview", "admin", "profile");
        }
    }
}
