import React,{useState,useEffect} from "react";
import { Login } from "./components/login/Login";
import {Home} from './components/home/Home';
import { Navbar } from "./components/navbar/Navbar";
import '@fortawesome/fontawesome-svg-core/styles.css';
import jwt_decode from 'jwt-decode';
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState('1');
  const [tokenExist, setTokenExist] = useState(false);

  useEffect(() => {
    // Verificar el estado de inicio de sesión al cargar la página
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    const token = localStorage.getItem('jwtToken');
    if(token){
      // decodificacion del token
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now()/1000;
      if(decodedToken.exp<currentTime){
        console.log("Token expirado:", decodedToken.exp, currentTime);
        toast.info('Sesión expirada. Cerrando sesión...');
        handleLogout();
      }else{
        setTokenExist(true);
      }
    }
  }, []);

  // validación de credenciales y guardar confirmación de acceso en localstorage
  const handleLogin=()=>{
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn','true');
    setTokenExist(localStorage.getItem('jwtToken'));
  }

  // Cerrar sesión y eliminar confirmación de acceso en localstorage
  const handleLogout=()=>{
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('jwtToken'); // remover token
    setSelectedItem('1')
  }



  // item seleccionado del navbar
  const handleNavbarSelection = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="App">
      <ToastContainer/>
      {isLoggedIn && tokenExist ?(
      <>
      <Navbar onLogout={handleLogout} onSelection={handleNavbarSelection}/>
      <Home selectedItem={selectedItem} onLogout={handleLogout}/>
      </>
      ):(
        <Login onLogin={handleLogin}/>
      )}
    </div>
  );
}

export default App;
