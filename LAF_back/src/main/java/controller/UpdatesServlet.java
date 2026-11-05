package controller;

import com.google.gson.Gson;
import entity.Users;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import util.UpdateHub;

/** Async long polling: responds as soon as data changes, without polling SQL. */
@WebServlet(name = "UpdatesServlet", urlPatterns = {"/api/updates"}, asyncSupported = true)
public class UpdatesServlet extends HttpServlet {
    private static final Gson GSON = new Gson();

    @Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        HttpSession session = request.getSession(false);
        Object account = session == null ? null : session.getAttribute("user");
        final int userId = account instanceof Users ? ((Users) account).getUserID() : 0;
        final String cursor = request.getParameter("cursor");
        if (!request.isAsyncSupported()) {
            response.setStatus(503); // frontend switches to a slower refresh fallback
            response.getWriter().print("{\"message\":\"Async support is required\"}");
            return;
        }

        AsyncContext async = request.startAsync();
        async.setTimeout(25000);
        AtomicBoolean finished = new AtomicBoolean();
        AtomicReference<UpdateHub.Subscription> subscription = new AtomicReference<>();
        Runnable cleanup = () -> {
            UpdateHub.Subscription sub = subscription.getAndSet(null);
            if (sub != null) sub.close();
        };
        Consumer<UpdateHub.Snapshot> finish = snapshot -> {
            if (!finished.compareAndSet(false, true)) return;
            cleanup.run();
            try {
                async.getResponse().getWriter().print(GSON.toJson(snapshot));
            } catch (IOException | IllegalStateException ignored) {
                // A closed tab/disconnected client should not affect the mutation.
            } finally {
                try { async.complete(); } catch (IllegalStateException ignored) { }
            }
        };
        async.addListener(new AsyncListener() {
            @Override public void onTimeout(AsyncEvent event) { finish.accept(UpdateHub.since(cursor, userId)); }
            @Override public void onComplete(AsyncEvent event) { finished.set(true); cleanup.run(); }
            @Override public void onError(AsyncEvent event) {
                finished.set(true);
                cleanup.run();
                try { async.complete(); } catch (IllegalStateException ignored) { }
            }
            @Override public void onStartAsync(AsyncEvent event) { }
        });
        subscription.set(UpdateHub.subscribe(cursor, userId, snapshot -> {
            try { async.start(() -> finish.accept(snapshot)); }
            catch (IllegalStateException ignored) { cleanup.run(); }
        }));
        if (finished.get()) cleanup.run();
    }

    @Override public void destroy() { UpdateHub.clear(); }
}
