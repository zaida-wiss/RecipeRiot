// src/server.ts
import app from './app';

const port = 3000;

app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});