import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "Joke 1",
      description: "This is a joke",
    },
    {
      id: 2,
      title: "Joke 2",
      description: "This is another joke",
    },
    {
      id: 3,
      title: "Joke 3",
      description: "This is a joke",
    },
    {
      id: 4,
      title: "Joke 4",
      description: "This is another joke",
    },
    {
      id: 5,
      title: "Joke 5",
      description: "This is a joke",
    },
    {
      id: 6,
      title: "Joke 6",
      description: "This is another joke",
    },
  ];
  res.send(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
