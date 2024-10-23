import React, { useEffect, useState } from 'react';
import './report.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrash, faClipboardCheck, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import jwt_decode from 'jwt-decode';

export const Report = ({ onLogout }) => {

  // almacenar los datos de los reportes
  const [data, setData] = useState([]);
  // modal para reparar o eliminar
  const [modalOpen, setModalOpen] = useState(false);
  // mensaje a mostrar
  const [modalMessage, setModalMessage] = useState('');
  // almacenar id de Loan y id de Herramienta
  const [toolRepairOrDelete, settoolRepairOrDelete] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        toast.info('Sesión expirada. Cerrando sesión...');
        onLogout();
      } else {
        fetch("http://localhost:4000/api/reports")
          .then(response => response.json())
          .then(data => {
            setData(data);
          })
          .catch(error => {
            console.log(error)
            setData('Error al cargar los datos');
          })
      }
    }
  }, [onLogout])

  // función para realizar operaciones dentro de cierto reporte para reparar o eliminar
  const handleModalSave = () => {
    // Lógica para guardar o realizar la acción correspondiente (reparar o eliminar)
    if (modalMessage === '¿Desea reparar la herramienta?') {
      const infoReport = {
        idTool: toolRepairOrDelete.idTool
      }
      fetch(`http://localhost:4000/api/reports/${toolRepairOrDelete.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(infoReport)
      })
        .then(response => response.json())
        .then(data => {
          console.log("recibido: ", data);
          if (data.message === 'Success') {
            toast.success("Herramienta actualizada correctamente");
            fetch("http://localhost:4000/api/reports")
              .then(response => response.json())
              .then(data => {
                setData(data);
              })
              .catch(error => console.log(error))
          } else if (data.message === "Missing") {
            toast.error("Error al actualizar la herramienta");
          }
        })
        .catch(error => console.log(error))
      setModalOpen(false);
    } else if (modalMessage === '¿Desea eliminar la herramienta?') {
      const infoReport = {
        idTool: toolRepairOrDelete.idTool
      }
      fetch(`http://localhost:4000/api/reports/${toolRepairOrDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(infoReport)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          if (data.message === 'Success') {
            toast.success("Herramienta eliminada correctamente correctamente");
            fetch("http://localhost:4000/api/reports")
              .then(response => response.json())
              .then(data => {
                setData(data);
              })
              .catch(error => console.log(error))
          } else if (data.message === "Missing") {
            toast.error("Error al actualizar la herramienta");
          } else {
            toast.error("Error al eliminar");
            console.log(data.message);
          }
        })
        .catch(error => console.log(error))
      setModalOpen(false);
    } else if (modalMessage === '¿Desea eliminar el reporte?') {
      fetch(`http://localhost:4000/api/reports/report/${toolRepairOrDelete.id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Success') {
            toast.success("Reporte eliminado correctamente");
            fetch("http://localhost:4000/api/reports")
              .then(response => response.json())
              .then(data => {
                setData(data);
              })
              .catch(error => console.log(error))
          } else if (data.message === 'Error') {
            toast.error("Error al eliminar el reporte");
          }
          setModalOpen(false);
        })
    }
  };

  const handleRepairClick = () => {
    setModalMessage('¿Desea reparar la herramienta?'); // Establece el mensaje para reparar
    setModalOpen(true);
  };

  const handleDeleteClick = () => {
    setModalMessage('¿Desea eliminar la herramienta?'); // Establece el mensaje para eliminar
    setModalOpen(true);
  };

  const handleDeleteReport = () => {
    setModalMessage('¿Desea eliminar el reporte?');
    setModalOpen(true);
  }

  const handleModalClose = () => {
    setModalOpen(false);
  };


  return (
    <div>
      <ToastContainer />
      <div style={{ display: 'flex', justifyContent: 'center', fontFamily: 'Nunito' }}>
        <h1>Lista de reportes de herramientas</h1>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? ('No hay reportes disponibles') : (<></>)}
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                  {item.status === 1 ? (
                    <>
                      <button onClick={() => { handleRepairClick(); settoolRepairOrDelete(item); }} className='btnrepair'><FontAwesomeIcon icon={faGear} /></button>
                      <button onClick={() => { handleDeleteClick(); settoolRepairOrDelete(item); }} className='btndeletereport'><FontAwesomeIcon icon={faTrash} /></button>
                    </>
                  ) : (
                    <>
                      <button className='btndelivered'><FontAwesomeIcon size='2x' title='Entregado' icon={faClipboardCheck} /></button>
                      <button title='Eliminar reporte' onClick={() => { handleDeleteReport(); settoolRepairOrDelete(item); }} className='btndeletereport'><FontAwesomeIcon icon={faDeleteLeft} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>



      {/* modal para confirmar reparación o eliminación */}
      {modalOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <h3>Confirmación</h3>
            <label>{modalMessage}</label>
            <div className="modal-buttons">
              <button className="modal-save" onClick={handleModalSave}>
                Confirmar
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
