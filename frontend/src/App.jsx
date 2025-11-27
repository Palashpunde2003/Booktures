import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import PrivateRoute from "./components/PrivateRoute";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route path="/read/:id" element={
            <div className="p-10 text-center">
              Reading Page Coming Soon!
            </div>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
