/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const request = require('request');
const btoa = require('btoa');
const app = express();

// Initialize Database
console.log(process.env.DB_URL);
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
   dialect: 'sqlite',
   storage: process.env.DB_URL
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
// load submodule frontend as static
app.use(express.static('public'));

// API-Endpoints
app.post('/getTTS', (req, res) => {
  request.post(process.env.WATSON_API_URL, {
    headers: {
      'Authorization': 'Basic ' + btoa(process.env.WATSON_API_KEY),
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: req.body.text,
      accept: 'audio/mpeg',
    }),
  }).pipe(res);
});

app.post('/getFile', (req, res) => request.get(req.body.url).pipe(res));

app.listen(5000, () => console.log('Listening on http://127.0.0.1:5000/'));
