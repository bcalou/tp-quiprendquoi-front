const express = require('express');
const dotenv = require('dotenv').config();
const app = express();

app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', { title: 'Qui prend quoi ?' });
});

app.post('/party', (req, res) => {
  res.send('Post ok!');
});

app.listen(process.env.PORT, () =>
  console.log(`Front app listening on port ${process.env.PORT}!`),
);
