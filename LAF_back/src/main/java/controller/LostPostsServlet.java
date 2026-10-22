package controller;

import dao.LostPostDAO;
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

@WebServlet(name = "LostPostsServlet", urlPatterns = {"/api/lost-posts"})
public class LostPostsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        String keyword = request.getParameter("keyword");
        String category = request.getParameter("category");
        String location = request.getParameter("location");
        String email = request.getParameter("email");
        
        LostPostDAO dao = new LostPostDAO();
        List<Map<String, Object>> posts = dao.getAllLostPosts(keyword, category, location, email);
        
        out.print(new Gson().toJson(posts));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        LostPostDAO dao = new LostPostDAO();

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
            result = shareDao.toggleCommentLike("lost", commentId, email);
            result.put("comments", dao.getCommentsByPostId(postId, email));
        } else if ("status".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String status = request.getParameter("status");
            result.put("success", dao.updateStatus(postId, status));
        }else if ("update".equals(action) || "edit".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String itemName = request.getParameter("itemName");
            String category = request.getParameter("category");
            String location = request.getParameter("location");
            String description = request.getParameter("description");
            String imageUrl = request.getParameter("imageUrl");
            result.put("success", dao.updateLostPost(postId, itemName, category, location, description, imageUrl));
        } else if ("delete".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            result.put("success", dao.deletePost(postId));
        } else {
            String email = request.getParameter("email");
            String title = request.getParameter("title");
            String category = request.getParameter("category");
            String content = request.getParameter("content");
            String location = request.getParameter("location");
            String time = request.getParameter("time");
            String imageUrl = request.getParameter("imageUrl");
            boolean ok = dao.addLostPost(email, title, category, content, location, time, imageUrl);
            result.put("success", ok);
              result.put("message", ok ? "Đã gửi bài đăng! Bài sẽ hiển thị sau khi admin duyệt." : "Lỗi khi đăng bài!");
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}