import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/navbar/Navbar";
import Home from "./components/pages/Home";
import WeeklyPlanner from "./components/weeklyPlanner/WeeklyPlanner";

import { clearAuthData, getAuthData } from "./api/authApi";

type AuthUser = {
  id: number;
  email: string;
  username: string;
};

function App() {
  const initialAuth = getAuthData();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialAuth?.user ?? null
  );

  const isLoggedIn = currentUser !== null;

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <Router>
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        username={currentUser?.username}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              isLoginOpen={isLoginOpen}
              setIsLoginOpen={setIsLoginOpen}
              onAuthSuccess={handleAuthSuccess}
            />
          }
        />

        <Route path="/veckomeny" element={<WeeklyPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;