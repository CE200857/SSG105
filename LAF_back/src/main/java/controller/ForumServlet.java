package controller;

import dao.ForumDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "ForumServlet", urlPatterns = {"/api/home/forum-posts"})
public class ForumServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        ForumDAO dao = new ForumDAO();
        List<Map<String, Object>> posts = dao.getLatestForumPosts();
        
        out.print(new Gson().toJson(posts));
        out.flush();
    }
}