package filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import java.io.IOException;
import util.DBContext;

@WebFilter(urlPatterns = {"/*"})
public class ConnectionCleanupFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        DBContext.beginRequest();
        try {
            chain.doFilter(request, response);
        } finally {
            DBContext.endRequest();
        }
    }

    @Override
    public void destroy() {
        DBContext.shutdown();
    }
}