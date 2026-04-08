// Importerar Express-appen som är konfigurerad i app.js.
const app = require('./app');
// Hämtar port från miljövariabeln PORT, annars används 3000 lokalt.
const port = process.env.PORT || 3000;
// Startar servern och börjar lyssna efter inkommande anrop på vald port.
app.listen(port, () => {
  // Skriver ut en bekräftelse i terminalen när servern är igång.
  console.log(`Servern lyssnar på http://localhost:${port}`);
});