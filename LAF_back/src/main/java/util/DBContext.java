package util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;

public class DBContext {

    protected Connection conn = null;

    private static final String DB_URL = System.getProperty("laf.db.url",
            "jdbc:sqlserver://localhost:1433;"
            + "databaseName=LostAndFoundDB;"
            + "user=sa;"
            + "password=123456;"
            + "encrypt=true;trustServerCertificate=true;");

    private static final int MAX_IDLE = 10;
    private static final ConcurrentLinkedQueue<Connection> IDLE = new ConcurrentLinkedQueue<>();
    private static final ThreadLocal<List<Connection>> REQUEST_CONNS = new ThreadLocal<>();

    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException ex) {
            System.out.println("Thieu driver SQL Server: " + ex.getMessage());
        }
    }

    public DBContext() {
        try {
            conn = borrow();
            List<Connection> list = REQUEST_CONNS.get();
            if (list != null) {
                list.add(conn);
            }
        } catch (SQLException ex) {
            System.out.println("Khong ket noi duoc CSDL: " + ex.getMessage());
        }
    }

    // ===== Gọi bởi ConnectionCleanupFilter =====
    public static void beginRequest() {
        REQUEST_CONNS.set(new ArrayList<>());
    }

    public static void endRequest() {
        List<Connection> list = REQUEST_CONNS.get();
        REQUEST_CONNS.remove();
        if (list == null) {
            return;
        }
        for (Connection c : list) {
            try {
                c.close();          // đã trả rồi thì bỏ qua
            } catch (SQLException ignore) {
            }
        }
    }

    public static void shutdown() {
        Connection c;
        while ((c = IDLE.poll()) != null) {
            closeQuietly(c);
        }
    }

    // ===== Pool =====
    private static Connection borrow() throws SQLException {
        Connection real;
        while ((real = IDLE.poll()) != null) {
            try {
                if (!real.isClosed() && real.isValid(1)) {
                    return wrap(real);
                }
            } catch (SQLException ignore) {
            }
            closeQuietly(real);     // kết nối chết: bỏ
        }
        return wrap(DriverManager.getConnection(DB_URL));
    }

    private static void release(Connection real) {
        try {
            if (real.isClosed()) {
                return;
            }
            if (!real.getAutoCommit()) {
                real.rollback();
                real.setAutoCommit(true);
            }
            real.clearWarnings();
            if (IDLE.size() < MAX_IDLE) {
                IDLE.offer(real);
                return;
            }
        } catch (SQLException ignore) {
        }
        closeQuietly(real);
    }

    private static void closeQuietly(Connection c) {
        try {
            c.close();
        } catch (SQLException ignore) {
        }
    }

    // close() -> trả về pool; dùng sau khi trả -> báo lỗi rõ ràng
    private static Connection wrap(final Connection real) {
        final AtomicBoolean released = new AtomicBoolean(false);
        return (Connection) Proxy.newProxyInstance(
                DBContext.class.getClassLoader(),
                new Class<?>[]{Connection.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (method.getDeclaringClass() == Object.class) {
                        if (name.equals("equals")) return proxy == args[0];
                        if (name.equals("hashCode")) return System.identityHashCode(proxy);
                        return "PooledConnection[" + real + "]";
                    }
                    if (name.equals("close")) {
                        if (released.compareAndSet(false, true)) {
                            release(real);
                        }
                        return null;
                    }
                    if (name.equals("isClosed")) {
                        return released.get() || real.isClosed();
                    }
                    if (released.get()) {
                        throw new SQLException("Ket noi da duoc tra ve pool");
                    }
                    try {
                        return method.invoke(real, args);
                    } catch (InvocationTargetException e) {
                        throw e.getCause();
                    }
                });
    }
}