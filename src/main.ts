import express from "express";
import * as items from "./routes/items";

const app = express();

app.get("/api/items/:slug", items.get);

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("running on port 3000"));
}

module.exports = app;
