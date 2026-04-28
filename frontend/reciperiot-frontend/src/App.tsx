import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./components/pages/Home";
import ExplorePage from "./components/explorePage/ExplorePage";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";
import ShoppingList from "./components/shoppingList/ShoppingList";
import AboutPage from "./components/pages/aboutpage";
import PrivacyPage from "./components/pages/privacypage";
import ContactPage from "./components/pages/contactpage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/utforska" element={<ExplorePage />} />
          <Route path="/veckomeny" element={<WeeklyPlanner />} />
          <Route path="/inkopslista" element={<ShoppingList />} />
          <Route path="/om" element={<AboutPage />} />
          <Route path="/integritet" element={<PrivacyPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;