// src/server.ts
const app = require('./app');

const port = 3000;

app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});
