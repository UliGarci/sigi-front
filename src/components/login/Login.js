import React, { useState } from 'react'
import './login.css';
import logo from '../../images/Logo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Login = ({ onLogin }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    setPassword(event.target.value);
  };

  // cambiar estado para mostrar o no la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // función para el formulario
  const handleFormSubmit = (event) => {
    event.preventDefault(); // Evita el envío predeterminado del formulario
    if (email.length < 1 || password.length < 1) {
      toast.warning('Llena todos los campos')
    } else {
      fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.message === "No Valid") {
            toast.error('Usuario y/o contraseña incorrecta');
          } else if (data.message === "Success") {
            localStorage.setItem('jwtToken',data.token);
            onLogin();
          }
        })
        .catch((error) => {
          console.log('Fetch Error: ', error);
          toast.error('Hubo un error al intentar iniciar sesión. Por favor, intenta nuevamente');
        })
    }
  };

  return (
    <div className='fondo'>
      <ToastContainer />
      <div className="login-container">
        <div className="login-box">
          <div className="left-side">
            <form onSubmit={handleFormSubmit}>
              <label className='label-email'>Correo electronico:</label>
              <input
                type="email"
                name='email'
                className='input-email'
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className='label-password'>Contraseña:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder="•••••••••••"
                value={password}
                onChange={handleInputChange}
                className='input-password'
              />
              <button className='btn-showpassword' type='button' onClick={togglePasswordVisibility}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</button>
              <button className='btn' type="submit">Iniciar sesión</button>
            </form>
          </div>

          <div className="right-side">
            <img style={{ width: '160px', height: '130px' }} src={logo} alt="Logo" />
          </div>
        </div>
      </div>
    </div>

  )
}
