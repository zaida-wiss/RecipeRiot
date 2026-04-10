// Exporterar en middleware-funktion som körs vid varje inkommande request.
module.exports = (req, res, next) => {
  // Skriver ut HTTP-metod och sökväg i terminalen, t.ex. "GET /recipes".
  console.log(`${req.method} ${req.path}`);
  // Skickar vidare requesten till nästa middleware eller route-handler.
  next();
}; 