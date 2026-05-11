import app from './app';

const port = 3000;

app.listen(port, () => {
  console.log(`Servern kör på http://localhost:${port}`);
});