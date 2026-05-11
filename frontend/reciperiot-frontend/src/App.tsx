import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./components/pages/Home";
import ExplorePage from "./components/explorePage/ExplorePage";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";
import ShoppingList from "./components/shoppingList/ShoppingList";

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
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;