# dashboard.tinf17.in-Project Backend
### Getting started:
`git clone`

Place the frontend into the "public" subfolder, in case of git use the submodule initialization: 

`git submodule update --init --recursive`

Install NPM depencies (run command inside the backend root folder):

`npm install`

Rename .exampleenv to .env and input the correct data for your instance (API Keys/SQLITE-DB-Location)

Start the backend, it will serve everything on port 5000:

`npm run debug` or `node server.js`

Notice: Mastodon OAUTH may only work on the dashboard.tinf17.in-deployment due to the redirect.

