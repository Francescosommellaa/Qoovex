import http from "node:http";

const host = "127.0.0.1";
const port = Number(process.env.QOOVEX_E2E_EMAIL_SINK_PORT ?? "43119");
const secret = process.env.QOOVEX_E2E_EMAIL_SINK_SECRET;
if (!secret || secret.length < 32) throw new Error("Email sink E2E secret mancante.");

const messages = [];

function authorized(request) {
  return request.headers.authorization === `Bearer ${secret}`;
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { ready: true });
  if (!authorized(request)) return json(response, 401, { error: "unauthorized" });

  if (request.method === "GET" && url.pathname === "/messages") {
    const to = url.searchParams.get("to");
    return json(response, 200, { messages: to ? messages.filter((message) => message.to === to) : messages });
  }
  if (request.method === "DELETE" && url.pathname === "/messages") {
    messages.length = 0;
    return json(response, 200, { deleted: true });
  }
  if (request.method !== "POST" || url.pathname !== "/messages") return json(response, 404, { error: "not_found" });

  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) request.destroy();
  });
  request.on("end", () => {
    try {
      const payload = JSON.parse(body);
      const message = { ...payload, id: `sink-${messages.length + 1}`, receivedAt: new Date().toISOString() };
      messages.push(message);
      json(response, 201, { id: message.id });
    } catch {
      json(response, 400, { error: "invalid_json" });
    }
  });
});

server.listen(port, host);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
