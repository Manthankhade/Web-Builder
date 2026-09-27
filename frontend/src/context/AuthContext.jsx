import { useState, useEffect, createContext, useContext } from "react";
import { getMe } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        getMe()
          .then(({ user: fetchedUser }) => {
            setUser(fetchedUser);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
      }
      return;
    }

    setLoading(false);
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);