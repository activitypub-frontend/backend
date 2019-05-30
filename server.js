/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const request = require('request');
const btoa = require('btoa');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

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



// Parse body JSON
app.use(express.json());

app.use(cookieParser());

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
            request.post('https://' + req.params.instance + "/api/v1/apps", {
                form: {
                    client_name: 'dashboard.tinf17.in',
                    scopes: 'read',
                    redirect_uris: 'https://dashboard.tinf17.in'
                }
            }, (err, httpResponse, body) => {
                if (err) {
                    console.log(err);
                    console.log("ERROR!");
                    res.status(500).send();
                    return;
                }
                if (httpResponse.statusCode != 200) {
                    console.log(httpResponse.statusCode);
                    res.status(500).send();
                    return;
                }
                const jBody = JSON.parse(body);
                console.log(jBody);

                if (jBody.client_id && jBody.client_secret) {
                    AppInstanceModel.create({
                        mastodonInstance: req.params.instance,
                        client_id: jBody.client_id,
                        client_secret: jBody.client_secret
                    }).then(() => {
                        res.json({
                            success: true,
                            client_id: jBody.client_id
                        });
                        return;
                    }).catch((e) => {
                        console.log(e);
                        res.status(500).send();
                        return;
                    });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
        } else {
            res.json({
                success: true,
                client_id: data[0].client_id
            });
        }

    });
});

// Catch POST's from mastodon auth
app.all('/', (req, res, next) => {
    console.log(req.query);
    if (req.query.code && req.cookies.mInstance) {
        console.log("Received Code and Instance, register");
        AppInstanceModel.findAll({
            where: {
                mastodonInstance: req.cookies.mInstance
            }
        }).then((data) => {
            request.post('https://' + req.params.instance + "/oauth/token", {
                form: {
                    client_id: data[0].client_id,
                    client_secret: data[0].client_secret,
                    grant_type: "authorization_code",
                    redirect_uri: 'https://dashboard.tinf17.in',
                    code: req.query.code
                }
            }, (err, httpResponse, body) => {
                console.log(body);
                if (err) {
                    console.log(err);
                    console.log("ERROR!");
                    res.redirect('/?mLogin=0');
                    return;
                }
                if (httpResponse.statusCode != 200) {
                    console.log(httpResponse.statusCode);
                    res.redirect('/?mLogin=0');
                    return;
                }
                const jBody = JSON.parse(body);
                console.log(jBody);

                if (jBody.access_token) {
                    res.redirect('/?mLogin=0&mCode=' + jBody.access_token);
                } else {
                    res.redirect('/?mLogin=0');
                }
            });
        });

    } else {
        next();
    }
});

// load submodule frontend as static
app.use(express.static('public'));

app.post('/getFile', (req, res) => request.get(req.body.url).pipe(res));

app.listen(5000, () => console.log('Listening on http://127.0.0.1:5000/'));
