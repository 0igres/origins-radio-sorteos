import { Router, type IRouter } from "express";
import * as net from "net";

const router: IRouter = Router();

const SHOUTCAST_HOST = "s5.myradiostream.com";
const SHOUTCAST_PORT = 44728;

interface RadioStatus {
  online: boolean;
  listeners: number;
  currentSong: string;
}

function fetchRadioStatus(): Promise<RadioStatus> {
  return new Promise((resolve) => {
    const client = net.createConnection(
      { host: SHOUTCAST_HOST, port: SHOUTCAST_PORT },
      () => {
        client.write(
          "GET /7.html HTTP/1.0\r\n" +
            `Host: ${SHOUTCAST_HOST}:${SHOUTCAST_PORT}\r\n` +
            "User-Agent: Mozilla/5.0\r\n" +
            "Connection: close\r\n\r\n"
        );
      }
    );

    let buffer = "";
    let resolved = false;

    const done = (status: RadioStatus) => {
      if (!resolved) {
        resolved = true;
        resolve(status);
        client.destroy();
      }
    };

    client.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (buffer.length > 4000) client.destroy();
    });

    client.on("close", () => {
      if (!buffer.length) {
        return done({ online: false, listeners: 0, currentSong: "" });
      }

      // Must be HTTP 200 to be considered online
      const isHttp200 = /HTTP\/1\.\d\s+200/i.test(buffer);
      if (!isHttp200) {
        return done({ online: false, listeners: 0, currentSong: "" });
      }

      // /7.html body format: currentListeners,peakListeners,maxListeners,reportedListeners,?,bitrate,songtitle
      const bodyMatch = /<body>([^<]+)<\/body>/i.exec(buffer);
      if (!bodyMatch) {
        return done({ online: false, listeners: 0, currentSong: "" });
      }

      const parts = bodyMatch[1].split(",");
      if (parts.length < 7) {
        return done({ online: false, listeners: 0, currentSong: "" });
      }

      const listeners = parseInt(parts[0], 10) || 0;
      const currentSong = parts.slice(6).join(",").trim();

      done({ online: true, listeners, currentSong });
    });

    client.on("error", () => done({ online: false, listeners: 0, currentSong: "" }));

    const timer = setTimeout(() => done({ online: false, listeners: 0, currentSong: "" }), 5000);
    client.on("close", () => clearTimeout(timer));
  });
}

function fetchShoutcastListeners(): Promise<number> {
  return fetchRadioStatus().then((s) => s.listeners);
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

router.get("/radio-status", async (_req, res) => {
  try {
    const status = await fetchRadioStatus();
    res.json(status);
  } catch (err) {
    console.error("Radio status check error:", err);
    res.json({ online: false, listeners: 0 });
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
