package KhanhLTQ.controller;

import com.google.gson.Gson;
import dao.OverviewDAO;
import dto.OverviewDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "OverviewServlet", urlPatterns = {"/api/overview"})
public class OverviewServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Cấu hình UTF-8 & CORS cho Front-end React kết nối
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET");

        OverviewDAO dao = new OverviewDAO();
        OverviewDTO stats = dao.getOverviewStats();

        // Chuyển đối tượng DTO sang chuỗi JSON
        Gson gson = new Gson();
        String json = gson.toJson(stats);

        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
}