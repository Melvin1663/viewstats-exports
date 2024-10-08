const express = require('express');
const crypto = require('crypto');
const config = require('./config.json');
const app = express();
const port = 5004;

const a = "WzcwLCAyNiwgMTE4LCA0LCA3LCAxMjQsIDg0LCAzMiwgMSwgNzAsIDQwLCAzMCwgNDQsIDcxLCA4NiwgOTJd";
const b = "Wzk3LCAxMDksIC0xMDAsIC05MCwgMTIyLCAtMTI0LCAxMSwgLTY5LCAtNDIsIDExNSwgLTU4LCAtNjcsIDQzLCAtNzUsIDMxLCA3NF0=";
const c = "Wy0zLCAtMTEyLCAxNSwgLTEyNCwgLTcxLCAzMywgLTg0LCAxMDksIDU3LCAtMTI3LCAxMDcsIC00NiwgMTIyLCA0OCwgODIsIC0xMjYsIDQ3LCA3NiwgLTEyNywgNjUsIDc1LCAxMTMsIC0xMjEsIDg5LCAtNzEsIDUwLCAtODMsIDg2LCA5MiwgLTQ2LCA0OSwgNTZd";

app.use(express.json());

let key;
let algo;

async function decrypt(message) {
  return new TextDecoder("utf-8").decode(await crypto.subtle.decrypt(algo, key, new Uint8Array(await message.arrayBuffer())));
}

app.get('/get/vid/stats/:videoId', async (req, res) => {
  try {
    let { videoId } = req.params;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    let base = `https://www.viewstats.com/api/videoStats?videoId=${videoId}&withRevenue=true&groupBy=none`;

    let data = await fetch(base, {
      headers: {
        "Content-Type": "application/json",
        Authorization: config.auth,
        Cookie: config.cookie
      },
    });

    if (data.status != 200) return res.sendStatus(data.status);

    const json = JSON.parse(await decrypt(await data.blob()));

    return res.send({
      status: 200,
      content: json
    })
  } catch (e) {
    console.log(e)
    return res.sendStatus(500);
  }
})

app.get('/get/channel/stats/:handle', async (req, res) => {
  try {
    let { handle } = req.params;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    let base = `https://api.viewstats.com/channels/@${handle}/stats?range=alltime&groupBy=daily&sortOrder=ASC&withRevenue=true&withEvents=false&withBreakdown=false`;

    let data = await fetch(base, {
      headers: {
        "Content-Type": "application/json",
        Authorization: config.auth
      },
    });

    if (data.status != 200) return res.sendStatus(data.status);

    const json = JSON.parse(await decrypt(await data.blob()));

    return res.send({
      status: 200,
      content: json
    })
  } catch (e) {
    console.log(e)
    return res.sendStatus(500);
  }
});

app.listen(port, async () => {
  key = await crypto.subtle.importKey("raw", new Uint8Array(JSON.parse(Buffer.from(c, 'base64'))), { name: "AES-GCM" }, false, ["decrypt"]);
  algo = { name: "AES-GCM", iv: new Uint8Array(JSON.parse(Buffer.from(b, 'base64'))) };

  console.log(`Server is running on http://localhost:${port}`);
});