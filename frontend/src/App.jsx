import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import PrivateRoute from "./components/PrivateRoute";
import Signup from "./pages/Signup";

const Home = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold">📚 Welcome to Booktures</h1>
    <p className="mt-4">You are safely logged in!</p>
  </div>
);

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
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
