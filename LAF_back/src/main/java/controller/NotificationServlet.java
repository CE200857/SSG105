package controller;

import dao.NotificationDAO;
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

@WebServlet(name = "NotificationServlet", urlPatterns = {"/api/notifications"})
public class NotificationServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String email = request.getParameter("email");
        NotificationDAO dao = new NotificationDAO();
        List<Map<String, Object>> notifications = dao.getNotificationsByEmail(email);

        out.print(new Gson().toJson(notifications));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> res = new HashMap<>();
        NotificationDAO dao = new NotificationDAO();

        String action = request.getParameter("action");
        if ("readAll".equals(action)) {
            String email = request.getParameter("email");
            res.put("success", dao.markAllAsRead(email));
        } else {
            int id = Integer.parseInt(request.getParameter("id"));
            res.put("success", dao.markAsRead(id));
        }

        out.print(new Gson().toJson(res));
        out.flush();
    }
}