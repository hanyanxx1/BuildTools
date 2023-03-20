const express = require("express");

const app = express();

app.get("/users", (req, res) => res.json([{ id: 1, name: "zhufeng" }]));

app.listen(3000);
