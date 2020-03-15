const express = require('express');
const dotenv = require('dotenv').config();
const app = express();

app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(process.env.PORT, () =>
  console.log(`Front app listening on port ${process.env.PORT}!`),
);
