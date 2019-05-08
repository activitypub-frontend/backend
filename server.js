/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const request = require('request');
const btoa = require('btoa');
const app = express();
const morgan = require('morgan');

// Initialize Database
console.log(process.env.DB_URL);
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_URL,
});
global.sequelize = sequelize;
// load models
const AppInstanceModel = require('./models/appData.js');
AppInstanceModel.sync();
// Initialize sequelize
sequelize
    .authenticate()
    .then(() => {
        console.log('DB Connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });



// setup express logging
app.use(morgan('combined'));

// load submodule frontend as static
app.use(express.static('public'));

// Parse body JSON
app.use(express.json());

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

// API-Endpoints for mastodon auth
app.get('/mastodon/:instance/oauth', (req, res) => {
    AppInstanceModel.findAll({
        where: {
            mastodonInstance: req.params.instance
        }
    }).then((data) => {
        if (data.length != 1) {
            // Get API Data from the AppInstance
            console.log("Register app with " + req.params.instance);
            request.post('https://'+req.params.instance + "/api/v1/apps", {form: {
                client_name: 'dashboard.tinf17.in',
                scopes: 'read',
                redirect_uris: 'https://dashboard.tinf17.in'
            }},(err,httpResponse,body) => {
              if(err) {
              console.log(err);
              console.log("ERROR!");
              res.status(500).send();
              return;
              }
              if(httpResponse.statusCode!=200) {
              console.log(httpResponse.statusCode);
              res.status(500).send();
              return;
              }
              console.log(JSON.parse(httpResponse.body));
              res.send("");
            });
        } else {
          res.send("");
        }

    });
});

app.post('/getFile', (req, res) => request.get(req.body.url).pipe(res));

app.listen(5000, () => console.log('Listening on http://127.0.0.1:5000/'));
