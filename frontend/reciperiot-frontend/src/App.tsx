import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import ExplorePage from "./components/explorePage/ExplorePage";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";
import ShoppingList from "./components/shoppingList/ShoppingList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/utforska" element={<ExplorePage />} />
        <Route path="/veckomeny" element={<WeeklyPlanner />} />
        <Route path="/inkopslista" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;