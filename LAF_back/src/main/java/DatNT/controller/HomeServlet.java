package DatNT.controller;

import dao.PostDAO;
import com.google.gson.Gson; // Import thư viện Gson
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map; // Thêm thư viện Map
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "HomeServlet", urlPatterns = {"/api/home/recent-posts"})
public class HomeServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        PostDAO dao = new PostDAO();
        
        // Đổi List<PostDTO> thành List<Map<String, Object>> cho khớp với PostDAO
        List<Map<String, Object>> recentPosts = dao.getRecentPosts();
        
        Gson gson = new Gson();
        String json = gson.toJson(recentPosts);
        
        out.print(json);
        out.flush();
    }
}