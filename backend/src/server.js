// src/server.js
// Startar servern - separerad från app.js

const app = require('./app');

const port = 3000;

app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});
