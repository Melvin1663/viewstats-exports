const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

const a = "WzcwLCAyNiwgMTE4LCA0LCA3LCAxMjQsIDg0LCAzMiwgMSwgNzAsIDQwLCAzMCwgNDQsIDcxLCA4NiwgOTJd";
const b = "Wzk3LCAxMDksIC0xMDAsIC05MCwgMTIyLCAtMTI0LCAxMSwgLTY5LCAtNDIsIDExNSwgLTU4LCAtNjcsIDQzLCAtNzUsIDMxLCA3NF0=";
const c = "Wy0zLCAtMTEyLCAxNSwgLTEyNCwgLTcxLCAzMywgLTg0LCAxMDksIDU3LCAtMTI3LCAxMDcsIC00NiwgMTIyLCA0OCwgODIsIC0xMjYsIDQ3LCA3NiwgLTEyNywgNjUsIDc1LCAxMTMsIC0xMjEsIDg5LCAtNzEsIDUwLCAtODMsIDg2LCA5MiwgLTQ2LCA0OSwgNTZd";

app.use(express.json());

async function decrypt(message) {
  return new TextDecoder("utf-8").decode(
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(JSON.parse(Buffer.from(b, 'base64')))
      },
      await crypto.subtle.importKey("raw", new Uint8Array(JSON.parse(Buffer.from(c, 'base64'))), { name: "AES-GCM" }, false, ["decrypt"]), new Uint8Array(await message.arrayBuffer())
    )
  );
}

app.get('/getStats/:handle', async (req, res) => {
  let { handle } = req.params;
  let { range, groupBy, sortOrder, withRevenue, withEvents, withBreakdown } = req.query;

  let base = `https://api.viewstats.com/channels/@${handle}/stats?range=${range}&groupBy=${groupBy}&sortOrder=${sortOrder}&withRevenue=${withRevenue}&withEvents=${withEvents}&withBreakdown=${withBreakdown}`;

  let data = await fetch(base, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 32ev9m0qggn227ng1rgpbv5j8qllas8uleujji3499g9had6oj7f0ltnvrgi00cq",
    },
  });

  if (data.status != 200) return res.sendStatus(data.status);

  const json = JSON.parse(await decrypt(await data.blob()));

  return res.send({
    status: 200,
    content: json
  })
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});