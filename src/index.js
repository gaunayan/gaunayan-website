
const COOKIE_NAME = "gaunayan_admin";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createSession(env) {
  const timestamp = Date.now().toString();
  const signature = await sign(timestamp, env.SESSION_SECRET);
  return `${timestamp}.${signature}`;
}

async function verifySession(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)gaunayan_admin=([^;]+)/);

  if (!match || !env.SESSION_SECRET) return false;

  const parts = match[1].split(".");
  if (parts.length !== 2) return false;

  const timestamp = Number(parts[0]);
  if (!Number.isFinite(timestamp)) return false;

  if (Date.now() - timestamp > SESSION_DURATION ||
      timestamp > Date.now()) return false;

  const expected = await sign(parts[0], env.SESSION_SECRET);
  return expected === parts[1];
}

const cookieOptions =
  "Path=/; HttpOnly; Secure; SameSite=Strict";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Customer order submission
    if (path === "/api/orders" && method === "POST") {
      try {
        const data = await request.json();
        const {
          name, phone, address, pincode,
          useFor, quantity, note
        } = data;

        if (!name || !phone || !address || !quantity) {
          return json({ success: false, message: "Required details missing" }, 400);
        }

        await env.DB.prepare(`
          INSERT INTO orders
          (customer_name, phone, address, pincode, purpose, quantity, note)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          name, phone, address,
          pincode || "", useFor || "",
          quantity, note || ""
        ).run();

        return json({ success: true, message: "Order saved successfully" });
      } catch {
        return json({ success: false, message: "Could not save order" }, 500);
      }
    }

    // Admin login
    if (path === "/api/admin/login" && method === "POST") {
      try {
        const data = await request.json();

        if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
          return json({ success: false, message: "Admin settings missing" }, 500);
        }

        if (data.password !== env.ADMIN_PASSWORD) {
          return json({ success: false, message: "Incorrect password" }, 401);
        }

        const session = await createSession(env);

        return json(
          { success: true, message: "Login successful" },
          200,
          {
            "Set-Cookie":
              `${COOKIE_NAME}=${session}; ${cookieOptions}; Max-Age=28800`
          }
        );
      } catch {
        return json({ success: false, message: "Login failed" }, 400);
      }
    }

    // Admin logout
    if (path === "/api/admin/logout" && method === "POST") {
      return json(
        { success: true },
        200,
        {
          "Set-Cookie":
            `${COOKIE_NAME}=; ${cookieOptions}; Max-Age=0`
        }
      );
    }

    // Check admin session
    if (path === "/api/admin/me" && method === "GET") {
      const valid = await verifySession(request, env);
      return json({ authenticated: valid }, valid ? 200 : 401);
    }

    // All remaining admin routes require login
    if (path.startsWith("/api/admin/")) {
      const valid = await verifySession(request, env);

      if (!valid) {
        return json({ success: false, message: "Please login first" }, 401);
      }

      // View customer orders
      if (path === "/api/admin/orders" && method === "GET") {
        const result = await env.DB.prepare(`
          SELECT * FROM orders ORDER BY id DESC LIMIT 200
        `).all();

        return json({ success: true, orders: result.results });
      }

      // Update order status
      const statusMatch = path.match(/^\/api\/admin\/orders\/(\d+)$/);

      if (statusMatch && method === "PATCH") {
        try {
          const data = await request.json();
          const allowed = ["Pending", "Confirmed", "Delivered", "Cancelled"];

          if (!allowed.includes(data.status)) {
            return json({ success: false, message: "Invalid status" }, 400);
          }

          const result = await env.DB.prepare(`
            UPDATE orders SET status = ? WHERE id = ?
          `).bind(data.status, Number(statusMatch[1])).run();

          if (!result.meta.changes) {
            return json({ success: false, message: "Order not found" }, 404);
          }

          return json({ success: true, message: "Status updated" });
        } catch {
          return json({ success: false, message: "Update failed" }, 400);
        }
      }

      return json({ success: false, message: "Not found" }, 404);
    }

    // Serve website files
    return env.ASSETS.fetch(request);
  }
};
