const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { client_id, redirect_uri, client_secret } = require("./config");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/authenticate", async (req, res) => {
  const { code } = req.body;

  try {
    const r1 = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        redirect_uri: redirect_uri,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = r1.data.access_token;
    const userData = async (token) => {
      let resp = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: "token " + token,
        },
      });
      const user = {
        github: resp.data.login,
        name: resp.data.name,
        public_repos: resp.data.public_repos,
        avatar_url: resp.data.avatar_url,
        followers: resp.data.followers,
        following: resp.data.following,
      };
      return user;
    };
    const user = await userData(accessToken);
    res.json(user);
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get("/", (req, res) => {
  res.send({});
});

const PORT = process.env.SERVER_PORT || 4000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
