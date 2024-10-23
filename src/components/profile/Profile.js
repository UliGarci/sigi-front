import React, { useState, useEffect } from 'react'
import './profile.css';
import { ToastContainer, toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';

export const Profile = ({onLogout}) => {

  const [profile, setProfile] = useState({});
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState({ email: '', password: '' })

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if(token){
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now()/1000;
      if(decodedToken.exp<currentTime){
        toast.info('Sesión expirada. Cerrando sesión...')
        onLogout();
      }else{
        fetch('http://localhost:4000/api/users/1')
      .then(response => response.json())
      .then(data => {
        const { email, password } = data;
        setProfile({ email, password });
      })
      .catch(error => {
        console.log(error)
      })
      }
    }
    
  }, [onLogout])

  const handleOpenModal = () => {
    setModalData({ ...profile });
    setModalOpen(true);
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleModalClose = () => {
    setModalOpen(false);
  }

  const isValidEmail = (email)=>{
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
  }

  const updateProfile = () => {
    if(!isValidEmail(modalData.email)){
      toast.error('Correo electronico invalido');
      return;
    }
    // Enviar los datos actualizados a la API
    fetch(`http://localhost:4000/api/users/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modalData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Actualizar los datos del perfil con la respuesta del servidor
        if (data.message === 'Success') {
          fetch('http://localhost:4000/api/users')
            .then((response) => response.json())
            .then((data) => {
              // Actualizar el estado del perfil con los datos del usuario actualizado
              setProfile(modalData);
              toast.success('Información actualizada');
              setModalOpen(false); // Cerrar el modal después de la actualización exitosa
            })
        } else {
          toast.error('Error al actualizarla información');
        }
      })
      .catch((error) => {
        console.log(error);
        setModalOpen(false);

      });
  };


  return (
    <div className='profile-container'>
      <ToastContainer />
      <div className='info-profile'>
        <div className='titlecontainer-profile'>
          <h2 className='title-profile'>Información de perfil</h2>
        </div>
        <div>
          <label style={{ fontFamily: 'nunito', fontWeight: 'bold' }}>Correo electrónico:</label>
          <input disabled type='text' className='email-profile' value={profile.email} />
        </div>
        <div>
          <label style={{ fontFamily: 'nunito', fontWeight: 'bold' }}>Contraseña:</label>
          <input disabled type='text' className='password-profile' value='•••••••' />
        </div>
        <div className='container-btnedit'>
          <button className='btn-edit' onClick={() => handleOpenModal()}>Actualizar información</button>
        </div>
      </div>

      {/* modal para eliminar */}
      {modalOpen && profile && (
        <div className="modal">
          <div className="modal-content">
            <h3>Actualizar datos</h3>
            <label>Correo electrónico</label>
            <input
              style={{ width: '250px' }}
              name='email'
              value={modalData.email}
              onChange={handleInputChange}
              type='text'
            ></input>
            <label>Contraseña</label>
            <input
              style={{ width: '250px' }}
              name='password'
              value={modalData.password}
              onChange={handleInputChange}
              type='text'
            ></input>
            <div className="modal-buttons">
              <button className="modal-save" onClick={updateProfile}>
                Actualizar
              </button>
              <button className="modal-close" onClick={handleModalClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
