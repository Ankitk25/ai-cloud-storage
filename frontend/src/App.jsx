import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardView from "./pages/DashboardView";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="app-shell text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
