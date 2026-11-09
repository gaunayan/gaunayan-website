
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Create customer order
    if (url.pathname === "/api/orders" && request.method === "POST") {
      try {
        const data = await request.json();

        const {
          name,
          phone,
          address,
          pincode,
          useFor,
          quantity,
          note
        } = data;

        if (!name || !phone || !address || !quantity) {
          return Response.json(
            { success: false, message: "Required details missing" },
            { status: 400 }
          );
        }

        await env.DB.prepare(`
          INSERT INTO orders
          (customer_name, phone, address, pincode, purpose, quantity, note)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          name,
          phone,
          address,
          pincode || "",
          useFor || "",
          quantity,
          note || ""
        ).run();

        return Response.json({
          success: true,
          message: "Order saved successfully"
        });

      } catch (error) {
        return Response.json(
          { success: false, message: "Order could not be saved" },
          { status: 500 }
        );
      }
    }

    // Serve website files
    return env.ASSETS.fetch(request);
  }
};
