package util;

import java.util.*;
import java.util.function.Consumer;

/** Small, bounded invalidation log for one Tomcat instance. No post/user data is sent. */
public final class UpdateHub {
    private static final String EPOCH = UUID.randomUUID().toString();
    private static final int HISTORY_LIMIT = 512;
    private static long sequence;
    private static final Deque<Change> HISTORY = new ArrayDeque<>();
    private static final Set<Subscription> WAITERS = new HashSet<>();

    private UpdateHub() { }

    public static final class Snapshot {
        public final String cursor;
        public final Set<String> topics;
        Snapshot(Set<String> topics) {
            this.cursor = EPOCH + ":" + sequence;
            this.topics = topics;
        }
    }

    private static final class Change {
        final long version;
        final int recipient;
        final Set<String> topics;
        Change(int recipient, String... topics) {
            this.version = ++sequence;
            this.recipient = recipient;
            this.topics = new LinkedHashSet<>(Arrays.asList(topics));
        }
    }

    public static synchronized Snapshot since(String cursor, int userId) {
        long after = -1;
        try {
            if (cursor != null && cursor.startsWith(EPOCH + ":")) {
                after = Long.parseLong(cursor.substring(EPOCH.length() + 1));
            }
        } catch (NumberFormatException ignored) { }
        Set<String> topics = new LinkedHashSet<>();
        if (after < 0 || after > sequence
                || (!HISTORY.isEmpty() && after < HISTORY.getFirst().version - 1)) {
            topics.add("*"); // new tab, restarted backend or a missed history window
        } else {
            for (Change change : HISTORY) {
                if (change.version > after && (change.recipient == 0 || change.recipient == userId)) {
                    topics.addAll(change.topics);
                }
            }
        }
        return new Snapshot(topics);
    }

    public static final class Subscription implements AutoCloseable {
        final String cursor;
        final int userId;
        final Consumer<Snapshot> consumer;
        Subscription(String cursor, int userId, Consumer<Snapshot> consumer) {
            this.cursor = cursor;
            this.userId = userId;
            this.consumer = consumer;
        }
        @Override public void close() {
            synchronized (UpdateHub.class) { WAITERS.remove(this); }
        }
    }

    public static Subscription subscribe(String cursor, int userId, Consumer<Snapshot> consumer) {
        Subscription sub = new Subscription(cursor, userId, consumer);
        Snapshot snapshot;
        synchronized (UpdateHub.class) {
            snapshot = since(cursor, userId);
            if (snapshot.topics.isEmpty()) WAITERS.add(sub);
        }
        if (!snapshot.topics.isEmpty()) consumer.accept(snapshot);
        return sub;
    }

    public static void publish(String... topics) { publishTo(0, topics); }

    public static void notification(int userId) {
        if (userId > 0) publishTo(userId, "notifications");
    }

    private static void publishTo(int userId, String... topics) {
        Map<Subscription, Snapshot> ready = new LinkedHashMap<>();
        synchronized (UpdateHub.class) {
            HISTORY.addLast(new Change(userId, topics));
            while (HISTORY.size() > HISTORY_LIMIT) HISTORY.removeFirst();
            Iterator<Subscription> iterator = WAITERS.iterator();
            while (iterator.hasNext()) {
                Subscription sub = iterator.next();
                Snapshot snapshot = since(sub.cursor, sub.userId);
                if (!snapshot.topics.isEmpty()) {
                    iterator.remove();
                    ready.put(sub, snapshot);
                }
            }
        }
        // Never run a network write while holding the event-log lock.
        ready.forEach((sub, snapshot) -> {
            try { sub.consumer.accept(snapshot); } catch (RuntimeException ignored) { }
        });
    }

    public static synchronized void clear() { WAITERS.clear(); HISTORY.clear(); }
}
