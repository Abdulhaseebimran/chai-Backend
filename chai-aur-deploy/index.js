require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/instagram", (req, res) => {
  res.send("Hello Instagram!");
});

app.get("/login", (req, res) => {
  res.send(`<h1>Welcome to login page</h1>`);
});

app.get("/signup", (req, res) => {
  res.send(`<h2>Welcome to signup page</h2>`);
});

app.get("/about", (req, res) => {
  res.send(`<h3>Welcome to about page</h3>`);
});

app.get("/contact", (req, res) => {
  res.send(`<h4>Welcome to contact page</h4>`);
});

app.listen(process.env.PORT, () => {
  console.log(`Web server is running on port http://localhost:${port}`);
});
