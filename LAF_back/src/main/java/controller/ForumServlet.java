package controller;

import dao.ForumDAO;
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
import java.util.List;
import java.util.Map;

@WebServlet(name = "ForumServlet", urlPatterns = {"/api/forum", "/api/home/forum-posts"})
public class ForumServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        ForumDAO dao = new ForumDAO();

        String path = request.getServletPath();
        if ("/api/home/forum-posts".equals(path)) {
            out.print(new Gson().toJson(dao.getLatestForumPosts()));
            out.flush();
            return;
        }

        String category = request.getParameter("category");
        String sort = request.getParameter("sort");
        String email = request.getParameter("email");

        List<Map<String, Object>> posts = dao.getForumPosts(category, sort, email);
        out.print(new Gson().toJson(posts));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        ForumDAO dao = new ForumDAO();

        String action = request.getParameter("action");
        if (action == null) action = "create";

        if ("like".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String email = request.getParameter("email");
            result = dao.toggleLike(postId, email);
        } else if ("comment".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String email = request.getParameter("email");
            String content = request.getParameter("content");
            String parentStr = request.getParameter("parentId");
            Integer parentId = (parentStr != null && !parentStr.isEmpty()) ? Integer.parseInt(parentStr) : null;
            boolean ok = dao.addComment(postId, email, content, parentId);
            result.put("success", ok);
            if (ok) {
                result.put("comments", dao.getCommentsByPostId(postId, email));
            }
       } else if ("likeComment".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            int commentId = Integer.parseInt(request.getParameter("commentId"));
            String email = request.getParameter("email");
            ShareDAO shareDao = new ShareDAO();
            result = shareDao.toggleCommentLike("forum", commentId, email);
            result.put("comments", dao.getCommentsByPostId(postId, email));
        } else if ("edit".equals(action) || "update".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String title = request.getParameter("title");
            String category = request.getParameter("category");
            String content = request.getParameter("content");
            result.put("success", dao.updateForumPost(postId, title, category, content));
        } else if ("delete".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            result.put("success", dao.deleteForumPost(postId));
        } else {
            String email = request.getParameter("email");
            String title = request.getParameter("title");
            String category = request.getParameter("category");
            String content = request.getParameter("content");

            if (dao.addForumPost(email, title, category, content)) {
                result.put("success", true);
                result.put("message", "Đăng bài viết thành công!");
            } else {
                result.put("success", false);
                result.put("message", "Lỗi khi đăng bài. Vui lòng thử lại!");
            }
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}