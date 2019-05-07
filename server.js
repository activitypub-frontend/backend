/* eslint-disable no-console */
require('dotenv').config();
console.log(process.env.API_URL)
const express = require('express');
const request = require('request');
const btoa = require('btoa');
const app = express();
app.use(express.json());
app.post('/getTTS', (req, res) => {
	request.post((process.env.WATSON_API_URL, {
		headers: {
			Authorization: 'Basic ' + btoa(process.env.WATSON_API_KEY),
			Accept: 'audio/mpeg',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text: req.body.text,
			accept: 'audio/mpeg'
		})
	}).pipe(res);
});
app.post('/getFile', (req, res) => request.get(req.body.url).pipe(res));
app.use(express.static('public'));
app.listen(5000, () => console.log('Listening on http://127.0.0.1:5000/'));
