import React from "react";
import { Routes, Route } from "react-router-dom";
import Landingpage from "./pages/Landingpage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CommunityPage from "./pages/CommunityPage";
import PricingPage from "./pages/PricingPage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Landingpage />} />
    </Routes>
  );
};

export default App;