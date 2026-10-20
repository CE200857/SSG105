package controller;

import dao.ShareDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "ShareServlet", urlPatterns = {"/api/shares"})
public class ShareServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        ShareDAO dao = new ShareDAO();

        String action = request.getParameter("action");
        if (action == null) action = "create";

        if ("create".equals(action)) {
            String email = request.getParameter("email");
            String postType = request.getParameter("postType");
            int postId = Integer.parseInt(request.getParameter("postId"));
            String content = request.getParameter("content");
            boolean ok = dao.createShare(email, postType, postId, content);
            result.put("success", ok);
            result.put("message", ok ? "Đã chia sẻ bài viết về trang cá nhân của bạn!" : "Lỗi khi chia sẻ bài viết!");
        } else if ("like".equals(action)) {
            int shareId = Integer.parseInt(request.getParameter("shareId"));
            String email = request.getParameter("email");
            result = dao.toggleShareLike(shareId, email);
        } else if ("comment".equals(action)) {
            int shareId = Integer.parseInt(request.getParameter("shareId"));
            String email = request.getParameter("email");
            String content = request.getParameter("content");
            String parentStr = request.getParameter("parentId");
            Integer parentId = (parentStr != null && !parentStr.isEmpty()) ? Integer.parseInt(parentStr) : null;
            boolean ok = dao.addShareComment(shareId, email, content, parentId);
            result.put("success", ok);
            if (ok) {
                result.put("comments", dao.getCommentsByShareId(shareId, email));
            }
        } else if ("likeComment".equals(action)) {
            String commentType = request.getParameter("commentType");
            int commentId = Integer.parseInt(request.getParameter("commentId"));
            String email = request.getParameter("email");
            result = dao.toggleCommentLike(commentType, commentId, email);
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}