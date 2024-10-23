import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';
import './loan.css';
import imgLogo from '../../images/Logo con nombre.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faPlus, faPenToSquare, faCheck, faClipboardCheck, faChevronLeft, faFilePdf, faTrash } from '@fortawesome/free-solid-svg-icons';
import jwt_decode from 'jwt-decode';

//PRESTAMOS: 1-> Disponible - 2-> Prestado - 3-> Reparar
export const Loan = ({ onLogout }) => {

  // almacenar los datos de los prestamos
  const [datos, setDatos] = useState([]);
  // informacion del prestamo
  const [datoLoan, setdatoLoan] = useState();
  // almacenar los datos a editar
  const [selectedTool, setSelectedTool] = useState([]);
  // mostrar tabla de prestamos
  const [tableLoans, setTableLoans] = useState(true);
  // mostrar herramientas del prestamo
  const [tableToolsLoan, setTableToolsLoan] = useState(false);
  // modal para crear prestamo
  const [modalOpenAdd, setModalOpenAdd] = useState(false);
  // modal de reportar
  const [modalReport, setModalReport] = useState(false);
  // modal de informacion de herramientas no disponibles o rotas
  const [modalOpenInfo, setModalOpenInfo] = useState(false);
  // modal para agregar herramienta a prestamo existente
  const [modalAddToolLoan, setModalAddToolLoan] = useState(false);
  // modal para eliminar prestamo
  const [modalDeleteLoan, setModalDeleteLoan] = useState(false);
  // almacenar nuevo datos de prestamo
  const [newLoan, setNewLoan] = useState({ name: '' })
  // almacenar los codigos de las herramientas QR
  const [codes, setCodes] = useState('');
  // almacenar datos de herramientas no disponibles
  const [noAvailable, setNoAvailable] = useState([]);
  // almacenar datos de herramientas rotas
  const [toolbreak, setToolbreak] = useState([]);
  // almacenar datos de codigos no encontrados
  const [codeMissing, setCodeMissing] = useState([]);
  // almacenar los datos a reportar de una herramienta
  const [toolReport, setToolReport] = useState([]);

  // mensaje en el modal
  const [modalMessage, setModalMessage] = useState('');

  // petición para la carga de datos de prestamos
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        toast.info('Sesión expirada. Cerrando sesión...');
        onLogout();
      } else {
        fetch('http://localhost:4000/api/loans')
          .then(response => response.json())
          .then(data => {
            const sortedLoans = data.sort((a, b) => {
              const dateA = new Date(a.dateLoan);
              const dateB = new Date(b.dateLoan);

              if (a.dateReturn && !b.dateReturn) {
                return 1;
              } else if (!a.dateReturn && b.dateReturn) {
                return -1;
              } else {
                return dateB - dateA;
              }
            });
            setDatos(sortedLoans);
          })
          .catch(error => console.error(error));
      }
    }
  }, [onLogout]);


  // funcion para registrar un nuevo prestamo mediante lector QR
  const addToolQR = () => {
    // se obtiene la lista de codigos a prestar y se almacena en listCodes sin saltos de linea, separados por coma para guardarlo como cadena de texto
    const listCodes = codes.replace(/\n/g, ',');
    // destructuramos el contenido de newLoan y pasamos la lista de codigos a la constante newloan
    const newloan = {
      ...newLoan,
      codes: listCodes
    };
    if (newloan.name === '' || newloan.codes === '') {
      toast.warning("Llena todos los campos para realizar un prestamo");
    } else {
      // petición post al api
      fetch("http://localhost:4000/api/loans", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newloan)
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Success') { // si la peticion es exitosa hacer lo siguiente
            // se valida si hubo herramientas no disponibles y almacenarlas en una constante
            // para mostrarlo en un modal
            toast.success("Prestamo realizado con exito", { autoClose: 3000 });
            setModalOpenAdd(false);
            fetch('http://localhost:4000/api/loans')
              .then(response => response.json())
              .then(data => {
                const sortedLoans = data.sort((a, b) => {
                  const dateA = new Date(a.dateLoan);
                  const dateB = new Date(b.dateLoan);

                  if (a.dateReturn && !b.dateReturn) {
                    return 1;
                  } else if (!a.dateReturn && b.dateReturn) {
                    return -1;
                  } else {
                    return dateB - dateA;
                  }
                })
                setDatos(sortedLoans);
              })
              .catch(error => console.error(error))

            if (data.notAvailableCodes.length > 0 || data.toolBreakCodes.length > 0 || data.missingCodes.length > 0) {
              setNoAvailable(data.notAvailableCodes);
              console.log("No disponibles: ", data.notAvailableCodes)
              setToolbreak(data.toolBreakCodes);
              console.log("Rotas: ", data.toolBreakCodes);
              setCodeMissing(data.missingCodes);
              console.log("No encontrado: ", data.missingCodes);
              setModalOpenInfo(true);
            }
            // se valida si hubo herramientas rotas y almacenarlos en una constante
            // para mostrarlo en un modal
            // se muestra un modal sobre la iformación

            // limpiamos los datos del formulario
            setCodes('');
            setNewLoan({ name: '' });
            fetch('http://localhost:4000/api/loans')
              .then(response => response.json())
              .then(data => {
                const sortedLoans = data.sort((a, b) => {
                  const dateA = new Date(a.dateLoan);
                  const dateB = new Date(b.dateLoan);

                  if (a.dateReturn && !b.dateReturn) {
                    return 1;
                  } else if (!a.dateReturn && b.dateReturn) {
                    return -1;
                  } else {
                    return dateB - dateA;
                  }
                })
                setDatos(sortedLoans);
              })
              .catch(error => console.error(error))
          } else if (data.message === 'Error') {
            toast.error("Hubo un error al registrar el prestamo");
          } else if (data.message === 'Missing') {
            toast.warning("Herramienta(s) no encontrada(s) en el sistema");
          } else if (data.message === 'Not Available') {
            toast.warning("La herramienta ya esta en prestamo, no hay disponible");
            setNoAvailable(data.notAvailableCodes);
          } else if (data.message === 'Broken') {
            toast.warning("La herramienta está rota o dañada, no se puede realizar el prestamo");
          }
        })
        .catch(error => console.log(error))
    }
    setNewLoan({ name: '' });
    setCodes('');
  }

  // funcion para abrir modal de agregar
  const handleAddClick = () => {
    setModalOpenAdd(true);
  }


  // funcion para mostrar tabla y editar información del prestamo de herramientas
  const handleEditLoanClick = loan => {
    if (loan.id) {
      fetch(`http://localhost:4000/api/loans/loantools/${loan.id}`)
        .then(response => response.json())
        .then(data => {
          setSelectedTool(data);
          setdatoLoan(loan);
          setTableToolsLoan(true);
          setTableLoans(false);
        })
        .catch(error => console.error(error))
    }
  }

  // funcion para abrir modal para eliminar un prestamo finalizado
  const handleDeleteLoan = loan => {
    setdatoLoan(loan.id)
    setModalDeleteLoan(true);
  }
  // funcion para eliminar un prestamo finalizado
  const deleteLoan = () => {
    if (datoLoan) {
      fetch(`http://localhost:4000/api/loans/${datoLoan}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Success') {
            toast.success("Prestamo eliminado correctamente");
            fetch('http://localhost:4000/api/loans')
              .then(response => response.json())
              .then(data => {
                const sortedLoans = data.sort((a, b) => {
                  const dateA = new Date(a.dateLoan);
                  const dateB = new Date(b.dateLoan);

                  if (a.dateReturn && !b.dateReturn) {
                    return 1;
                  } else if (!a.dateReturn && b.dateReturn) {
                    return -1;
                  } else {
                    return dateB - dateA;
                  }
                })
                setDatos(sortedLoans);
              })
              .catch(error => console.error(error))

            setModalDeleteLoan(false);
          } else if (data.message === 'Error') {
            toast.error("Error al eliminar prestamo");
          }

        })
        .catch(error => console.log(error))
    }
  }

  // funcion para abrir modal para nueva herramienta a un prestamo existente
  const newToolsLoan = () => {
    setModalAddToolLoan(true);
  }

  // funcion para agregar nuevas herramientas a un prestamo existente
  const newtools = () => {
    // se obtiene la lista de codigos a prestar y se almacena en listCodes sin saltos de linea, separados por coma para guardarlo como cadena de texto
    const listCodes = codes.replace(/\n/g, ',');
    const newloan = {
      codes: listCodes
    };
    if (listCodes === '') {
      toast.warning("Ingresa datos para agregar herramientas al prestamo")
    } else {
      // id del prestamo => datoLoan.id
      fetch(`http://localhost:4000/api/loans/${datoLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newloan)
      })
        .then(response => response.json())
        .then(data => {
          console.log("RECIBIDO: ", data)
          if (data.message === 'Success') { // si la peticion es exitosa
            // se valida si hubo herramientas no disponibles y almacenarlas en una constante
            // para mostrarlo en un modal
            toast.success("Prestamo realizado con exito", { autoClose: 3000 });
            setModalAddToolLoan(false);
            if (data.notAvailableCodes.length > 0 || data.toolBreakCodes.length > 0 || data.missingCodes.length > 0) {
              setNoAvailable(data.notAvailableCodes);
              console.log("No disponibles: ", data.notAvailableCodes)
              setToolbreak(data.toolBreakCodes);
              console.log("Rotas: ", data.toolBreakCodes);
              setCodeMissing(data.missingCodes);
              console.log("No encontrado: ", data.missingCodes);
              setModalOpenInfo(true);
            }
            // se valida si hubo herramientas rotas y almacenarlos en una constante
            // para mostrarlo en un modal
            // se muestra un modal sobre la iformación

            // limpiamos los datos del formulario
            setCodes('');
            handleEditLoanClick(datoLoan);
          } else if (data.message === 'Error') {
            toast.error("Hubo un error al registrar el prestamo");
          } else if (data.message === 'Missing') {
            toast.warning("Herramienta(s) no encontrada(s) en el sistema");
          } else if (data.message === 'Not Available') {
            toast.warning("La herramienta ya esta en prestamo, no hay disponible");
            setNoAvailable(data.notAvailableCodes);
          } else if (data.message === 'Broken') {
            toast.warning("La herramienta está rota o dañada, no se puede realizar el prestamo");
          }
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  // funcion para devolver una herramienta
  const returnTool = (tool) => {
    const data = {
      ...tool,
      idLoan: datoLoan.id
    }
    console.log("tool: ", tool);
    console.log("id del prestamo: ", datoLoan.id)
    console.log("nuevos datos: ", data)
    if (tool.id) {
      fetch(`http://localhost:4000/api/loans/returntool/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          if (data.message === 'Error') {
            toast.error("Error al devolver la herramienta");
          } else if (data.message === 'Success') {
            toast.success("Herramienta devuelta", { autoClose: 3000 })
            handleEditLoanClick(datoLoan);
          }
        })
        .catch(error => console.error(error))
    }
  }

  // funcion para devolver una herramienta rota
  const breaktool = () => {
    const data = {
      // ...tool,
      ...toolReport,
      idLoan: datoLoan.id,
      message: modalMessage
    }
    if (toolReport.id) {
      console.log("DATOS DEL REPORTE: ", data)
      fetch(`http://localhost:4000/api/loans/breaktool/${data.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Success') {
            toast.info("Herramienta reportada", { autoClose: 3000 })
            handleEditLoanClick(datoLoan);
          } else if (data.message === 'Error') {
            toast.error("Error al reportar la herramienta");
          }
        })
        .catch(error => console.error(error))
      setModalReport(false);
    }
  }

  // funcion para finalizar un prestamo de herramientas
  const finishloan = () => {
    fetch(`http://localhost:4000/api/loans/finishloan/${datoLoan.id}`,
      {
        method: 'PUT'
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Success') {
          toast.success("Prestamo finalizado", { autoClose: 3000 })
          // fetch('http://localhost:4000/api/loans')
          //   .then(response => response.json())
          //   .then(data => setDatos(data))
          //   .catch(error => console.error(error))
          fetch('http://localhost:4000/api/loans')
            .then(response => response.json())
            .then(data => {
              const sortedLoans = data.sort((a, b) => {
                const dateA = new Date(a.dateLoan);
                const dateB = new Date(b.dateLoan);

                if (a.dateReturn && !b.dateReturn) {
                  return 1;
                } else if (!a.dateReturn && b.dateReturn) {
                  return -1;
                } else {
                  return dateB - dateA;
                }
              });

              setDatos(sortedLoans);
            })
            .catch(error => console.error(error));
          setTableToolsLoan(false);
          setTableLoans(true);
        } else if (data.message === 'Error') {
          toast.error('Error al finalizar el prestamo');
        } else if (data.message === 'Impossible') {
          toast.warning('No puedes finalizar este prestamo porque no se han devuelto todas las herramientas.');
        }
      })
  }



  // funcion para manejar el cambio en el campo de los códigos y actualizar el estado de codes
  const handleInputChange = (e) => {
    if (e.target.name === 'codigos') {
      setCodes(e.target.value);
    } else if (e.target.name === 'nombreProyecto') {
      setNewLoan({ name: e.target.value })
    }
  }


  // función para generar PDF de lista de prestamo
  function generatePDF(projectName) {
    const doc = new jsPDF();

    // Agregar encabezado
    const imgX = 10;
    const imgY = 5;
    doc.addImage(imgLogo, 'PNG', imgX, imgY, 70, 12);

    // Agregar título centrado
    const title = 'Lista de préstamo';
    const titleY = imgY + 30;
    doc.setFontSize(24);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, titleY, { align: 'center' });
    // agregar nombre del proyecto
    const nameProject ='Proyecto: '+projectName;
    const nameY = titleY + 15;
    doc.setFontSize(14);
    doc.text(nameProject,15,nameY);
    
    let tableData = ''
    if (selectedTool.length > 0) {
      console.log(selectedTool)
      tableData = selectedTool.map((dato) => [
        dato.code,
        dato.name,
        dato.category,
        dato.description,
        dato.status === 1 ? 'PENDIENTE' : 'ENTREGADO',
      ]);
    } else {
      tableData = [
        ['No hay datos']
      ]
    }

    doc.autoTable({
      startY: nameY + 10,
      head: [['Clave', 'Nombre', 'Categoria', 'Descripcion', 'Estado']],
      body: tableData,
    });

    doc.save('listado_de_prestamo.pdf');
  }


  // funcion para modal de reportar herramienta rota o perdida
  const handleBreakTool = (event, dato) => {
    const selectedOption = event.target.value;
    setToolReport(dato);
    if (selectedOption === 'rota') {
      setModalMessage('¿Deseas reportar esta herramienta como rota?');
      setModalReport(true);
    } else if (selectedOption === 'perdida') {
      setModalMessage('¿Deseas reportar esta herramienta como perdida?');
      setModalReport(true);
    }
  }

  const back = () => {
    setTableLoans(true);
    setdatoLoan('');
    setTableToolsLoan(false);
  }

  const handleModalClose = () => {
    setModalOpenAdd(false);
    setModalReport(false);
    setCodes('');
    setNewLoan({ name: '' });
    setToolReport([]);
    setModalAddToolLoan(false);
    setModalDeleteLoan(false);
  }

  const handleModalInfoClose = () => {
    setModalOpenInfo(false)
    setCodeMissing([]);
    setNoAvailable([]);
    setToolbreak([]);
  }

  return (
    <div>
      <ToastContainer />
      {tableLoans ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', fontFamily: 'Nunito' }}>
            <h1>Lista de prestamos</h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <button onClick={handleAddClick} title='Nuevo prestamo para proyecto' className='btn'><FontAwesomeIcon icon={faPlus} /></button>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Proyecto</th>
                <th>Fecha de prestamo</th>
                <th>Fecha de devolución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? ('No hay prestamos disponibles') : (<></>)}
              {datos.map((dato, index) => (
                <tr key={index}>
                  <td>{dato.id}</td>
                  <td>{dato.project}</td>
                  <td>{dato.dateLoan.substring(0, 10)}</td>
                  {dato.dateReturn === null ? (<td>-</td>) : (<td>{dato.dateReturn.substring(0, 10)}</td>)}
                  <td>
                    {/* mostrar boton de editar si la fecha sigue nulo*/}
                    {dato.dateReturn === null ? (
                      <>
                        <button onClick={() => handleEditLoanClick(dato)} className='btnedit'><FontAwesomeIcon icon={faPenToSquare} /></button>
                      </>

                    ) : (
                      <>
                        <button className='btndelivered'><FontAwesomeIcon title='Entregado' color='#1fa780' size='3x' icon={faClipboardCheck} /></button>
                        <button onClick={() => handleDeleteLoan(dato)} className='btndeleteddelivered'><FontAwesomeIcon title='Eliminar prestamo' color='red' size='3x' icon={faTrash} /></button>
                      </>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (<></>)}


      {tableToolsLoan ? (
        <div style={{ padding: '15px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <button onClick={back} className='btnback'><FontAwesomeIcon size='2x' icon={faChevronLeft} /></button>
            </div>
            <div style={{ flex: 1, justifyContent: 'flex-end', display: 'flex' }}>
              <button onClick={finishloan} className='btncheckloan'>Finalizar prestamo   <FontAwesomeIcon icon={faListCheck} /></button>
            </div>
          </div>
          <div style={{ marginLeft: '50px', marginRight: '50px' }}>
            <div>
              <label className='infoloan'>Nombre del proyecto:   </label><label className='infoloan'>{datoLoan.project}</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label className='infoloan'>Herramientas en prestamo:</label>
              </div>
              <div style={{ flex: 1, width: '100%', justifyContent: 'flex-end', display: 'flex' }}>
                <button className='btnpdf' onClick={()=>generatePDF(datoLoan.project)}><FontAwesomeIcon size='2x' icon={faFilePdf} /></button>
                <button onClick={newToolsLoan} className='btn'><FontAwesomeIcon size='2x' icon={faPlus} /></button>
              </div>
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTool.map((dato, index) => (
                    <tr key={index}>
                      <td>{dato.code}</td>
                      <td>{dato.name}</td>
                      <td>{dato.category}</td>
                      <td>
                        {dato.status === 1 ? (
                          <div>
                            <button style={{cursor:'pointer'}} onClick={() => returnTool(dato)} title='Devolver herramienta' className='btnreturn'><FontAwesomeIcon icon={faCheck} /></button>
                            <select style={{cursor:'pointer'}} className='btnselect' onChange={(event) => handleBreakTool(event, dato)}>
                              <option value="">Reportar</option>
                              <option value="rota">Herramienta rota</option>
                              <option value="perdida">Herramienta perdida</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <FontAwesomeIcon title='Entregado' color='#1fa780' size='2x' icon={faClipboardCheck} />
                          </div>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (<></>)}


      {/* modal para agregar prestamo*/}
      {modalOpenAdd && (
        <div className="modal">
          <div className="modal-content">
            <h3>Nuevo prestamo</h3>
            {/* NAME */}
            <label>*Nombre:</label>
            <input
              type="text"
              placeholder='Nombre del proyecto'
              name='nombreProyecto'
              value={newLoan.name}
              onChange={handleInputChange}
            />
            {/* LISTA DE CODIGOS */}
            <label>
              Ingrese los códigos (Eliminar el ultimo salto de linea antes de registrar el prestamo.  )
            </label>
            <textarea
              style={{ maxWidth: '400px', minWidth: '100px', maxHeight: '500px', borderRadius: '5px' }}
              placeholder='Ingresar los códigos de las herramientas'
              name="codigos"
              rows={4}
              value={codes}
              onChange={handleInputChange}
            />
            <div className="modal-buttons">
              <button className="modal-save" onClick={addToolQR}>
                Registrar prestamo
              </button>
              <button className="modal-close" onClick={handleModalClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* modal para agregar nuevas herramientas al prestamo existente*/}
      {modalAddToolLoan && (
        <div className="modal">
          <div className="modal-content">
            {/* LISTA DE CODIGOS */}
            <label>
              Ingrese los códigos (separados por saltos de línea)
            </label>
            <textarea
              style={{ maxWidth: '400px', minWidth: '100px', maxHeight: '500px', borderRadius: '5px' }}
              placeholder='Ingresar los códigos de las herramientas'
              name="codigos"
              rows={4}
              value={codes}
              onChange={handleInputChange}
            />
            <div className="modal-buttons">
              <button className="modal-save" onClick={newtools}>
                Registrar prestamo
              </button>
              <button className="modal-close" onClick={handleModalClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* modal para reportar herramienta */}
      {modalReport && (
        <div className="modal">
          <div className="modal-content">
            <h3>REPORTAR</h3>
            <label>{modalMessage}</label>
            <div className="modal-buttons">
              <button className="modal-save" onClick={breaktool}>
                Reportar
              </button>
              <button className="modal-close" onClick={handleModalClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal para eliminar prestamo */}
      {modalDeleteLoan && (
        <div className="modal">
          <div className="modal-content">
            <h3>ELIMINAR PRESTAMO</h3>
            <label>¿Deseas eliminar este prestamo?</label>
            <div className="modal-buttons">
              <button className="modal-save" onClick={deleteLoan}>
                Eliminar
              </button>
              <button className="modal-close" onClick={handleModalClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* modal para mostrar informacion de herramientas rotas o no disponibles*/}
      {modalOpenInfo && (noAvailable.length > 0 || toolbreak.length > 0 || codeMissing.length > 0) && (
        <div className="modal">
          <div className="modal-content">
            <h3>Información del prestamo</h3>
            <label>El prestamo se registro correctamente pero algunas herramientas no se pudieron registrar dentro del prestamo</label>
            {/* CODIGOS DE HERRAMIENTAS NO ENCONTRADA*/}
            {/* HERRAMIENTAS EN PRESTAMO */}
            {codeMissing.length > 0 ? (
              <>
                <label style={{}}>Códigos proporcionados no encontrados en el sistema</label>
                <div className='table-wrapper'>
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codeMissing.map((dato, index) => (
                        <tr key={index}>
                          <td>{dato.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </>
            ) : (<></>)}
            {noAvailable.length > 0 ? (
              <>
                <label>Herramientas no disponibles porque estan en prestamo y no estan disponibles:</label>
                <div className='table-wrapper'>
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre de la herramienta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noAvailable.map((dato, index) => (
                        <tr key={index}>
                          <td>{dato.code}</td>
                          <td>{dato.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </>
            ) : (<></>)}
            {/* HERRAMIENTAS ROTAS */}
            {toolbreak.length > 0 ? (
              <>
                <label>Herramientas no disponibles porque estan rotas o necesitan reparación:</label>
                <div className='table-wrapper'>
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre de la herramienta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toolbreak.map((dato, index) => (
                        <tr key={index}>
                          <td>{dato.code}</td>
                          <td>{dato.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </>
            ) : (<></>)}
            <button className="modal-close" onClick={handleModalInfoClose}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
