// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
// const { Pool } = require('pg');
// const pool = new Pool({
// const db = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
db.connect();
const dbHelpers = require('./db/dbHelpers')(db);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const itemsRoutes = require("./routes/items");
// const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");
const ordersRoutes = require("./routes/orders");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/items", itemsRoutes(db));
// app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
app.use("/orders", ordersRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("index");
});
app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    const results = { 'results': (result) ? result.rows : null };
    res.render('pages/db', results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

app.get("/control", (req, res) => {
  res.render("control");
});

// to be able to reset database by requesting /debug/reset

const fs = require("fs");

app.get("/debug/reset", (req, res) => {
  fs.readFile('./db/reset.sql', 'utf8', (error, data) => {
    if (!error) {
      db.query(data)
        .then(() => {
          console.log("Database Reset");
          res.status(200).send("Database Reset");
        })
        .catch(e => {
          console.log(e.message);
          res.status(500).send("Failed to reset the database");
        });
    } else {
      res.status(500).send("Failed to reset the database");
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
