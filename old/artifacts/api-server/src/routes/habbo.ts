import { Router, type IRouter } from "express";
import * as net from "net";

const router: IRouter = Router();

const SHOUTCAST_HOST = "s5.myradiostream.com";
const SHOUTCAST_PORT = 44728;

function fetchShoutcastListeners(): Promise<number> {
  return new Promise((resolve) => {
    const client = net.createConnection(
      { host: SHOUTCAST_HOST, port: SHOUTCAST_PORT },
      () => {
        client.write(
          "GET / HTTP/1.0\r\n" +
            `Host: ${SHOUTCAST_HOST}:${SHOUTCAST_PORT}\r\n` +
            "User-Agent: Mozilla/5.0\r\n" +
            "Connection: close\r\n\r\n"
        );
      }
    );

    let buffer = "";
    let resolved = false;

    const done = (count: number) => {
      if (!resolved) {
        resolved = true;
        resolve(count);
        client.destroy();
      }
    };

    client.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (buffer.length > 8000) client.destroy();
    });

    client.on("close", () => {
      let count = 0;
      const patterns = [
        /(\d+)\s+(?:of\s+\d+\s+)?(?:unique\s+)?listeners/i,
        /Current Listeners[^\d]*(\d+)/i,
        /Listeners[^\d]*(\d+)/i,
        /<td[^>]*>(\d+)<\/td>/gi,
      ];

      for (const pat of patterns) {
        pat.lastIndex = 0;
        const m = pat.exec(buffer);
        if (m) {
          const n = parseInt(m[m.length - 1], 10);
          if (!isNaN(n) && n >= 0) {
            count = n;
            break;
          }
        }
      }

      done(count);
    });

    client.on("error", () => done(0));

    const timer = setTimeout(() => done(0), 5000);
    client.on("close", () => clearTimeout(timer));
  });
}

router.get("/validate-user/:username", async (req, res) => {
  try {
    const username = req.params.username;

    let userResponse = await fetch(`https://origins.habbo.es/api/public/users?name=${encodeURIComponent(username)}`);

    if (userResponse.ok) {
      return res.json({ valid: true });
    }

    userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${encodeURIComponent(username)}`);

    if (userResponse.ok) {
      return res.json({ valid: true });
    }

    res.json({ valid: false });
  } catch (err) {
    console.error("Username validation error:", err);
    res.status(500).json({ error: "Validation failed" });
  }
});

router.get("/listeners", async (_req, res) => {
  try {
    const listeners = await fetchShoutcastListeners();
    res.json({ listeners });
  } catch (err) {
    console.error("Listener count fetch error:", err);
    res.json({ listeners: 0 });
  }
});

router.get("/avatar/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const direction = req.query.direction || "2";
    const head_direction = req.query.head_direction || "2";
    const gesture = req.query.gesture || "nrm";
    const action = req.query.action || "std";
    const size = req.query.size || "m";

    let userResponse = await fetch(`https://origins.habbo.es/api/public/users?name=${encodeURIComponent(username)}`);

    if (!userResponse.ok) {
      userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${encodeURIComponent(username)}`);
    }

    let figureString = "";
    if (userResponse.ok) {
      const userData = await userResponse.json() as { figureString?: string };
      figureString = userData.figureString || "";
    }

    let avatarUrl = "";
    if (figureString) {
      avatarUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=${direction}&head_direction=${head_direction}&gesture=${gesture}&action=${action}&size=${size}`;
    } else {
      avatarUrl = `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=${direction}&head_direction=${head_direction}&gesture=${gesture}&action=${action}&size=${size}`;
    }

    const response = await fetch(avatarUrl);
    if (!response.ok) {
      return res.status(404).json({ error: "Avatar not found" });
    }

    const buffer = await response.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Avatar proxy error:", err);
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});

export default router;
