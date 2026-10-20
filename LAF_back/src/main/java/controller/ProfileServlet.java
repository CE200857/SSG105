package controller;

import dao.ProfileDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet(name = "ProfileServlet", urlPatterns = {"/api/profile"})
public class ProfileServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        String email = request.getParameter("email");
        String username = request.getParameter("username");
        String viewerEmail = request.getParameter("viewerEmail");
        
        ProfileDAO dao = new ProfileDAO();
        Map<String, Object> userProfile = dao.getFullProfile(email, username, viewerEmail);
        
        out.print(new Gson().toJson(userProfile));
        out.flush();
    }
}