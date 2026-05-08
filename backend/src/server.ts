const app = require ("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servern lyssnar på http://localhost:${PORT}`);
});







// import 'dotenv/config';
// import app from './app';
// import { connectToDatabase } from './config/database';

// async function startServer() {
//   await connectToDatabase();


// startServer();