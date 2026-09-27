
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
const savedTheme = localStorage.getItem("theme") === "light" ? "light" : "dark";
document.documentElement.dataset.theme = savedTheme;
document.documentElement.classList.toggle("dark", savedTheme === "dark");
createRoot(document.getElementById('root')).render(
   <AuthProvider>

 <BrowserRouter>
    <App />
 </BrowserRouter>
   </AuthProvider>
  
)
