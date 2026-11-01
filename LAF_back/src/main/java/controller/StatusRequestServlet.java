package controller;

import com.google.gson.Gson;
import dao.StatusRequestDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

@WebServlet(name = "StatusRequestServlet", urlPatterns = {"/api/status-requests"})
public class StatusRequestServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        String email = request.getParameter("email");   // đã bị SessionGuardFilter ghi đè bằng email trong session
        if (email == null || email.trim().isEmpty()) {
            response.getWriter().print(new Gson().toJson(new ArrayList<>()));
            return;
        }
        response.getWriter().print(new Gson().toJson(new StatusRequestDAO().getPending(email.trim())));
    }
}