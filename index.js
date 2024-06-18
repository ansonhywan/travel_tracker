import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const query_res = await db.query("SELECT country_code FROM visited_countries");

  let visited_countries = [];
  // Need to return a list/array of countries
  query_res.rows.forEach((country) => {
    visited_countries.push(country.country_code);
  });
  console.log(query_res.rows);
  res.render("index.ejs", {
    countries: visited_countries,
    total: visited_countries.length,
  });

});

app.post("/add", async (req, res) => {
  console.log(req.body);
  const input = req.body["country"];

  // input is country name, we want to post to visited_countries a country code
  const query_res1 = await db.query(
    "SELECT country_code FROM countries WHERE country = $1",
    [input]
  );

  if (query_res1.rows.length !== 0) {
    const data = query_res1.rows[0];
    const country_code = data.country_code;

    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      country_code,
    ]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
