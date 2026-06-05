import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./components/pages/Home";
import ExplorePage from "./components/explorePage/ExplorePage";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";
import ShoppingList from "./components/shoppingList/ShoppingList";
import ProfilePage from "./components/pages/ProfilPage";
import AboutPage from "./components/pages/aboutpage";
import ContactPage from "./components/pages/contactpage";
import PrivacyPage from "./components/pages/privacypage";
import AdminPage from "./components/pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/utforska" element={<ExplorePage />} />
            <Route path="/veckomeny" element={<WeeklyPlanner />} />
            <Route path="/inkopslista" element={<ShoppingList />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/om" element={<AboutPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/integritet" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;