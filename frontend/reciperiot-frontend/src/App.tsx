import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./components/pages/Home";
import ExplorePage from "./components/explorePage/ExplorePage";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";
import ShoppingList from "./components/shoppingList/ShoppingList";
import Footer from "./components/footer/Footer";

import { clearAuthData, getAuthData } from "./api/authApi";

type AuthUser = {
  id: number;
  email: string;
  username: string;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/utforska" element={<ExplorePage />} />
          <Route path="/veckomeny" element={<WeeklyPlanner />} />
          <Route path="/inkopslista" element={<ShoppingList />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;