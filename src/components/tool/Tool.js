//HERRAMIENTAS
import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import './tool.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faFilePdf, faPenToSquare, faTrash, faCircleInfo, faPlus, faGear } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const Tool = ({ onLogout }) => {

    //alamcena si hay datos cargados
    const [isLoading, setIsLoading] = useState(true);
    // almacenar los datos recibidos de la bdd de herramientas
    const [datos, setDatos] = useState([]);
    // almacenar los datos a editar de la herramienta dentro del modal
    const [selectedTool, setSelectedTool] = useState([]);
    // almacenar la imagen para previsualizar
    const [previewImage, setPreviewImage] = useState(null);
    // almacenar las categorias de la herramienta
    const [toolCategory, setToolCategory] = useState([])
    // controlar paginacion de la tabla
    const [currentPage, setCurrentPage] = useState(1);
    // cantidad de filas por pagina
    const rowsPerPage = 20
    // buscador
    const [searchTerm, setSearchTerm] = useState('');
    // cambiar estado para mostrar o no la contrasena
    const [showPassword, setShowPassword] = useState(false)
    // almacenar contrasena de confirmacion
    const [password, setPassword] = useState('')
    // modal de edit
    const [modalOpen, setModalOpen] = useState(false);
    // modal de info
    const [modalOpenInfo, setModalOpenInfo] = useState(false);
    // modal de delete
    const [modalOpenDelete, setModalOpenDelete] = useState(false);
    // modal de add
    const [modalOpenAdd, setModalOpenAdd] = useState(false)
    // modal para reparar o eliminar
    const [modalOpenRepair, setModalOpenRepair] = useState(false);
    // modal para agregar nueva categoria
    const [modalOpenAddCategory, setModalOpenAddCategory] = useState(false);
    // modal para confirmar eliminacion mediante contrasena
    const [modalOpenDeleteConfirm, setModalOpenDeleteConfirm] = useState(false)
    // almacenar nombre de la nueva categoria
    const [nameCategory, setNameCategory] = useState({ name: '' });
    //mensaje de tamaño de imagen
    const [imageSizeError, setImageSizeError] = useState(false);
    // almacenar lista de codigos QR
    const [qrCodes, setQrCodes] = useState([]);

    // OBTENER LOS DATOS DE LA BDD CONSUMINEOD LA API

    // función para obtener info de las herramientas y mostrar en tabla
    useEffect(() => {
        setTimeout(()=>{
            fetch('http://localhost:4000/api/tools')
                    .then(response => response.json())
                    .then(data => setDatos(data))
                    .catch(error => console.error(error));
                fetch('http://localhost:4000/api/toolcategories')
                    .then(response => response.json())
                    .then(data => {
                        //mapeamos los datos para usarlos en el select
                        const transformedOptions = data.map(item => ({
                            value: item.id,
                            label: item.name
                        }));
                        setToolCategory(transformedOptions);
                    })
                   .catch(error => console.error(error));
                setIsLoading(false);
        },1000);//demora de 1 segundos
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    const handleInputChange = (event) => {
        setPassword(event.target.value);
    };

    //función para obtener info de la herramienta en específico y editar
    const handleEditClick = tool => {
        if (tool.id) {
            fetch(`http://localhost:4000/api/tools/${tool.id}`)
                .then(response => response.json())
                .then(data => {
                    setSelectedTool(data);
                    setModalOpen(true);
                })
                .catch(error => console.log(error));
        }
    }

    // funcion para cambiar la pagina actual
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    // funcion para info de la busqueda
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    }

    const filteredTool = datos.filter((dato) =>
        dato.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dato.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dato.description.toLowerCase().includes(searchTerm.toLowerCase())
    )


    // obtener el indice de inicio y fin de cada fila
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const rowsToShow = filteredTool.slice(indexOfFirstRow, indexOfLastRow);

    // función para hacer la actualización de la información de la herramienta
    const handleSaveChanges = async () => {
        const { id, name, inventoryQuantity, description, image } = selectedTool;
        if (selectedTool.name === '') {
            toast.warning("Nombre no debe de ir vacio");
        } else if (selectedTool.inventoryQuantity <= 0) {
            toast.warning("La cantidad en almacén debe ser mayor o igual a 1");
        } else {
            const updateTool = {
                name,
                image,
                description,
                inventoryQuantity
            };
            await fetch(`http://localhost:4000/api/tools/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateTool)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Success') {
                        toast.success('Herramienta actualizada correctamente');
                    } else if (data.message === 'Impossible') {
                        toast.error('Herramienta no actualizada, no puede restar dicha cantidad si hay herramientas en prestamo');
                    } else if (data.message === 'Error') {
                        toast.error('Herramienta no actualizada, hubo un error por parte del servidor');
                    }
                    setModalOpen(false);
                    fetch('http://localhost:4000/api/tools')
                        .then(response => response.json())
                        .then(data => setDatos(data))
                        .catch(error => console.error(error));
                })
                .catch(error => console.error(error));
        }

    }


    // función para obtener info de herramienta específica y mostrar
    const handleInfoClick = (tool) => {
        if (tool.id) {
            fetch(`http://localhost:4000/api/tools/${tool.id}`)
                .then(response => response.json())
                .then(data => { setSelectedTool(data); setModalOpenInfo(true); })
                .catch(error => console.log(error));
        }
    }

    // FUNCION PARA ELIMINAR DE SOBRA,
    const handleDeleteClick = (tool) => {
        if (tool.id) {
            fetch(`http://localhost:4000/api/tools/${tool.id}`)
                .then(response => response.json())
                .then(data => { setSelectedTool(data); setModalOpenDelete(true); })
                .catch(error => console.log(error));
        }
    }

    // funcion para validar contrasena de confirmacion de eliminacion
    const confirmPassword = () => {
        if (password === '') {
            toast.error('Llene el campo de contraseña')
        } else {
            fetch('http://localhost:4000/api/users/1')
                .then(response => response.json())
                .then(data => {
                    if (password === data.password) {
                        deleteClick()
                        setModalOpenDeleteConfirm(false);
                        setPassword('');
                    } else {
                        toast.error('Contraseña incorrecta');
                    }
                })
        }
    }

    const changeModalDelte = () => {
        setModalOpenDelete(false);
        setModalOpenRepair(false);
        setModalOpenDeleteConfirm(true);
    }

    //función para eliminar herramienta en específico mediante su id
    const deleteClick = () => {
        fetch(`http://localhost:4000/api/tools/${selectedTool.id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Success') {
                    setSelectedTool(data);
                    toast.success('Herramienta eliminada correctamente');
                } else if (data.message === 'Impossible') {
                    toast.warning('No se pudo eliminar, la herramienta esta en prestamo');
                } else if (data.message === 'Repair') {

                }
                fetch('http://localhost:4000/api/tools')
                    .then(response => response.json())
                    .then(data => setDatos(data))
                    .catch(error => console.error(error));
            })
            .catch(error => console.log(error));
    }

    const handleRepairOrDelete = (tool) => {
        if (tool.id) {
            fetch(`http://localhost:4000/api/tools/${tool.id}`)
                .then(response => response.json())
                .then(data => {
                    setSelectedTool(data);
                    setModalOpenRepair(true);
                })
                .catch(error => console.log(error));
        }
    }

    const repairClick = () => {
        fetch(`http://localhost:4000/api/tools/repair/${selectedTool.id}`, {
            method: "PUT"
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Success') {
                    toast.success("Se actualizo correctamente la herramienta");
                } else if (data.message === 'Error') {
                    toast.error("Error al actualizar la herramienta, intente más tarde");
                }
                setModalOpenRepair(false);
                fetch('http://localhost:4000/api/tools')
                    .then(response => response.json())
                    .then(data => setDatos(data))
                    .catch(error => console.error(error));
            })
    }

    const handleAddClick = () => {
        //obtenemos todas las  categorias de las herramientas                        
        setModalOpenAdd(true)
        setSelectedTool({
            name: '',
            idCategory: '',
            image: '',
            description: '',
            inventoryQuantity: 1,
        })
    }

    const handleAddCategory = () => {
        setModalOpenAddCategory(true);
        setNameCategory({ name: '' })
    }
    //funcion para  agregar nueva categoria
    const addCategory = () => {
        if (nameCategory.name === '') {
            toast.warning("Llena el campo del nombre para registrar una nueva categoria");
        } else {
            fetch('http://localhost:4000/api/toolcategories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nameCategory)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Success') {
                        toast.success("Nueva categoria registrada")
                        fetch('http://localhost:4000/api/toolcategories')
                            .then(response => response.json())
                            .then(data => {
                                //mapeamos lod datos para usarlos en el select
                                const transformedOptions = data.map(item => ({
                                    value: item.id,
                                    label: item.name
                                }));
                                setToolCategory(transformedOptions);
                            })
                            .catch(error => console.error(error))
                        setModalOpenAddCategory(false);
                    } else if (data.message === 'Already exists') {
                        toast.error("Categoria ya existente")
                    }
                })
                .catch(error => console.log(error));
        }
    }

    //función para agregar la herramienta a la base de datos
    const addTool = () => {
        if (selectedTool.name === '' || selectedTool.idCategory === "") {
            toast.error("Llenar todos los campos que tengan: ASTERISCO ( * )")
        } else if (selectedTool.inventoryQuantity <= 0) {
            toast.warning("Ingrese un valor mayor o igual a 1 en la cantidad de almacen");
        } else {
            fetch('http://localhost:4000/api/tools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedTool)
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.message === 'Success') {
                        toast.success(`La Herramienta ${selectedTool.name} se ha agregado correctamente`)
                        fetchData();
                    } else if (data.message === 'Bad Request') {
                        toast.error(`Error en la petición`);
                    } else if (data.message === "Error") {
                        toast.warning("Error al registrar");
                    }
                })
            setModalOpenAdd(false);
            setPreviewImage(null);
        }
    }

    const fetchData = () => {
        fetch('http://localhost:4000/api/tools')
        .then(response => response.json())
        .then(data => setDatos(data))
        .catch(error => console.error(error));
    };

    // función para cambiar la imagen de una herramienta
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setImageSizeError(true);
            } else {
                setImageSizeError(false);
                const reader = new FileReader();
                reader.onload = () => {
                    const imageUrl = reader.result;
                    setSelectedTool({ ...selectedTool, image: imageUrl });
                    setPreviewImage(imageUrl);
                };

                if (file) {
                    reader.readAsDataURL(file);
                }
            }
        }


    }

    const toolLoan = () => {
        toast.warning("no se pueden eliminar herramientas en prestamo")
    }


    // función para obtener lista de codigos QR
    const handleListQR = async () => {
        try {
            fetch('http://localhost:4000/api/listqr')
                .then(response => response.json())
                .then(data => {
                    const qrCodeList = data.map(item => ({
                        code: item.code,
                        name: item.name,
                        qrBase64: item.barcode,
                        description: item.description
                    }));
                    setQrCodes(qrCodeList);
                    generatePDF();
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log('Error:', error); // Verifica si hay errores en la llamada a la API
        }

    }



    const generatePDF = async () => {
        const doc = new jsPDF();
        // Generar la tabla principal de datos
        const tableData = qrCodes.map(dato => [dato.code, dato.name, dato.description]);
        if (tableData.length === 0) {
            toast.info("Click de nuevo para generar los BarCode")
        } else if (tableData.length > 0) {
            console.log("SI HAY")
            doc.autoTable({
                head: [['Clave', 'Nombre', 'Descripción']],
                body: tableData,
            });

            // Agregar un salto de página después de la tabla principal
            doc.addPage();

            // Calcular el número de códigos QR por fila y columna
            const qrCodesPerPage = 15; // Número de códigos QR por página
            const qrCodesPerRow = 5; // Número de códigos QR por fila
            const qrCodesPerColumn = qrCodesPerPage / qrCodesPerRow; // Número de códigos QR por columna

            // Generar la tabla adicional de códigos QR
            let qrRow = 0; // Fila actual de códigos QR en la página
            let qrColumn = 0; // Columna actual de códigos QR en la página

            for (let i = 0; i < qrCodes.length; i++) {
                const qrCode = qrCodes[i];

                // Crear el contenedor para el QR y el código
                const containerWidth = doc.internal.pageSize.getWidth() / qrCodesPerRow; // Ancho del contenedor
                const containerHeight = doc.internal.pageSize.getHeight() / qrCodesPerColumn; // Altura del contenedor
                const containerX = containerWidth * qrColumn; // Coordenada X del contenedor
                const containerY = containerHeight * qrRow; // Coordenada Y del contenedor

                // Ajustar el tamaño del QR y el código según el tamaño del contenedor
                const qrSize = Math.min(containerWidth - 20, containerHeight - 40);
                const codeSize = 14; // Tamaño de fuente para el código

                // Agregar el QR
                const qrImage = new Image();
                qrImage.src = 'data:image/png;base64,' + qrCode.qrBase64;
                doc.addImage(qrImage, 'PNG', containerX + 10, containerY + 10, qrSize, qrSize);

                // Agregar el código
                doc.setFontSize(codeSize);
                doc.text(qrCode.code, containerX + 10, containerY + qrSize + codeSize + 15);

                qrColumn++; // Incrementar la columna actual

                if (qrColumn >= qrCodesPerRow) {
                    qrColumn = 0; // Reiniciar la columna cuando alcanza el máximo
                    qrRow++; // Pasar a la siguiente fila

                    if (qrRow >= qrCodesPerColumn) {
                        qrRow = 0; // Reiniciar la fila cuando alcanza el máximo
                        doc.addPage(); // Pasar a la siguiente página de códigos QR
                    }
                }
            }
            // Guardar el PDF
            doc.save('Lista_QR_de_Herramientas.pdf');
        }
    };

    // función para cerrar modales
    const handleModalClose = () => {
        setPreviewImage(null);
        setModalOpen(false);
        setModalOpenInfo(false);
        setModalOpenDelete(false);
        setModalOpenAdd(false);
        setModalOpenRepair(false);
        setImageSizeError(false);
        setNameCategory(false);
        setModalOpenAddCategory(false);
        setModalOpenDeleteConfirm(false);
        setPassword('');
    }

    // asignar un color al status
    const colorstatus = (status, invetoryQuantity) => {
        if (invetoryQuantity === 1) {
            if (status === 1) { //disponible
                return 'green';
            } else if (status === 2) { // en prestamo
                return 'orange';
            } else if (status === 3) { // herramienta rota o perdida
                return 'red';
            }
        } else {
            return 'gray';
        }
    }


    return (
        <div>
            <ToastContainer />
            <div>
                <div style={{ display: 'flex', justifyContent: 'center', fontFamily: 'Nunito' }}>
                    <h1>Tabla de herramientas</h1>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: '150px', marginRight: '150px', alignItems: 'center' }}>
                    <div style={{}}>
                        <button onClick={() => handleListQR()} style={{ backgroundColor: '#BC2525', padding: '15px',cursor:'pointer'}}>
                            <FontAwesomeIcon size='2x' icon={faFilePdf} />
                        </button>
                    </div>
                    <div>
                        <button onClick={() => handleAddClick()} style={{ fontSize: '25px', paddingTop: '10px', paddingBottom: '10px' }} className='btn'>
                            <FontAwesomeIcon icon={faPlus} />
                        </button></div>
                    <div>
                        <button style={{ paddingTop: '15px', paddingBottom: '15px' }} onClick={() => handleAddCategory()} className='btn'><FontAwesomeIcon size='2x' icon={faTableList} /></button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px', marginRight: '150px' }}>
                    <input
                        style={{ borderWidth: '1px', backgroundColor: '#E7E7E7' }}
                        type='text'
                        value={searchTerm}
                        placeholder='Buscar herramienta'
                        onChange={handleSearchChange}
                    />
                </div>                  
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '15px' }}>
                    {Array.from({ length: Math.ceil(datos.length / rowsPerPage) }, (_, index) => (
                        <button key={index} onClick={() => handlePageChange(index + 1)} style={{ cursor:'pointer',borderRadius: '8px', color: 'black', margin: '10px', padding: '15px', background: currentPage === index + 1 ? '#BC2525' : '#C9C7C7' }}>{index + 1}</button>
                    ))}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Estatus</th>
                            <th>Clave</th>
                            <th>Nombre</th>
                            <th>Cantidad disponible</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading?(<tr><td colSpan={"5"} style={{textAlign:"center"}}><div className='loading-spinner'><div className='circle'/><div className='circle'/><div className='circle'/></div></td></tr>):rowsToShow.length === 0 ? ('No hay herramientas registradas') : null}
                        {rowsToShow.map((dato, index) => (
                            <tr key={index}>
                                <td>
                                    <button style={{ padding: '10px', borderRadius: '20px', backgroundColor: colorstatus(dato.status, dato.inventoryQuantity) }}></button>
                                </td>
                                <td>{dato.code}</td>
                                <td>{dato.name}</td>
                                <td>{dato.quantityAvailable}</td>
                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button title='Editar herramienta' onClick={() => handleEditClick(dato)} className='btnedit'><FontAwesomeIcon icon={faPenToSquare} /></button>
                                    {dato.inventoryQuantity === 1 ? (dato.status === 1 ? (<button onClick={() => handleDeleteClick(dato)} className='btndelete'><FontAwesomeIcon icon={faTrash} /></button>) : (dato.status === 3 ? (<button onClick={() => handleRepairOrDelete(dato)} title='Reparar herramienta' className='btnrepair'><FontAwesomeIcon icon={faGear} /></button>) : (<button onClick={toolLoan} className='btndelete'><FontAwesomeIcon icon={faTrash} /></button>))) : (<></>)}
                                    <button title='Información de la herramienta' onClick={() => handleInfoClick(dato)} className='btninfo'><FontAwesomeIcon icon={faCircleInfo} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', paddingBottom: '35px' }}>
                    {Array.from({ length: Math.ceil(datos.length / rowsPerPage) }, (_, index) => (
                        <button key={index} onClick={() => handlePageChange(index + 1)} style={{ color: 'black', margin: '15px', padding: '15px', backgroundColor: currentPage === index + 1 ? '#BC2525' : '#C9C7C7' }}>{index + 1}</button>
                    ))}
                </div>

                {/* modal para agregar categoria */}
                {modalOpenAddCategory && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <h3>Nueva categoria</h3>
                            {/* NAME */}
                            <label>*Nombre:</label>
                            <input
                                type='text'
                                placeholder='Nombre de la categoria'
                                value={nameCategory.name}
                                onChange={e => setNameCategory({ ...nameCategory, name: e.target.value })}
                            />
                            <div className="modal-buttons">
                                <button className="modal-save" onClick={addCategory}>
                                    Agregar herramienta
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* modal para confirmar eliminacion de herramienta mediante contrasena */}
                {modalOpenDeleteConfirm && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <h3>Confirmación de eliminación</h3>
                            <label>*Ingrese la contraseña de usuario:</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder="•••••••••••"
                                value={password}
                                onChange={handleInputChange}
                                className='input-password'
                            />
                            <button className='btn-showpassword' type='button' onClick={togglePasswordVisibility}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</button>

                            <div className="modal-buttons">
                                <button className="modal-save" onClick={confirmPassword}>
                                    Confirmar eliminación
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* modal para agregar*/}
                {modalOpenAdd && selectedTool && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Nueva herramienta</h3>
                            {/* NAME */}
                            <label>*Nombre:</label>
                            <input
                                type="text"
                                placeholder='Nombre de la herramienta'
                                value={selectedTool.name}
                                onChange={e => setSelectedTool({ ...selectedTool, name: e.target.value })}
                            />
                            {/* IdCategory */}
                            <label>*Categoria:</label>
                            <Select
                                placeholder=''
                                options={toolCategory}
                                value={selectedTool.idCategory}
                                onChange={selectedOption => setSelectedTool({ ...selectedTool, idCategory: selectedOption })}
                            />
                            {/* DESCRIPTION */}
                            <label>Descripción:</label>
                            <input
                                type="text"
                                placeholder='Marca, color, alguna descripción'
                                value={selectedTool.description}
                                onChange={e => setSelectedTool({ ...selectedTool, description: e.target.value })}
                            />
                            {/* inventoryQuantity */}
                            <label>*Cantidad en almacén:</label>
                            <input
                                type="number"
                                min={1}
                                value={selectedTool.inventoryQuantity}
                                onChange={e => setSelectedTool({ ...selectedTool, inventoryQuantity: e.target.value })}
                            />
                            {/* IMAGE */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex' }}>
                                    <label>Imagen de la herramienta:</label>
                                    <input style={{ borderColor: 'transparent' }} type='file' accept='image/*' onChange={handleImageChange} />
                                </div>
                                {imageSizeError && (<p style={{ color: 'red' }}>La imagen debe ser menor a 10MB.</p>)}
                                <div style={{ maxHeight: '200px', maxWidth: '400px', overflow: 'auto' }}>
                                    {previewImage === null ? (<img style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} src={selectedTool.image} alt="Imagen" />) : (<img style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} src={previewImage} alt="Previsualización de la imagen" />)}
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button className="modal-save" onClick={addTool}>
                                    Agregar herramienta
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* modal para editar */}
                {modalOpen && selectedTool && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Editar herramienta</h3>
                            <label>Clave:</label>
                            <input style={{ backgroundColor: 'rgba(208, 208, 208, 0.5)' }} type="text" value={selectedTool.code} disabled />
                            <label>*Nombre:</label>
                            <input
                                type="text"
                                value={selectedTool.name}
                                onChange={e => setSelectedTool({ ...selectedTool, name: e.target.value })}
                            />
                            <label>*Cantidad en inventario:</label>
                            <input
                                type="number"
                                value={selectedTool.inventoryQuantity}
                                min={1}
                                onChange={e => setSelectedTool({ ...selectedTool, inventoryQuantity: e.target.value })}
                            />
                            <label>Descripción:</label>
                            <input
                                type="text"
                                value={selectedTool.description}
                                onChange={e => setSelectedTool({ ...selectedTool, description: e.target.value })}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex' }}>
                                    <label>Imagen de la herramienta:</label>
                                    <input style={{ borderColor: 'transparent' }} type='file' accept='image/*' onChange={handleImageChange} />
                                </div>
                                {imageSizeError && (<p style={{ color: 'red' }}>La imagen debe ser menor a 10MB.</p>)}
                                <div style={{ maxHeight: '200px', maxWidth: '400px', overflow: 'auto' }}>
                                    {previewImage === null ? (<img style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} src={selectedTool.image} alt="Imagen" />) : (<img style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} src={previewImage} alt="Previsualización de la imagen" />)}
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button className="modal-save" onClick={handleSaveChanges}>
                                    Guardar cambios
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* modal para mostrar info */}
                {modalOpenInfo && selectedTool && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="row">
                                <div className="col-md-6">
                                    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'cornflowerblue', borderRadius: '5px' }}>
                                        <h3>Información de la herramienta</h3>
                                    </div>
                                    <p>Clave: {selectedTool.code}</p>
                                    <p>Nombre: {selectedTool.name}</p>
                                    <p>Categoria: {selectedTool.category}</p>
                                    <p>Descripción: {selectedTool.description}</p>
                                    <p>Cantidad en almacén: {selectedTool.inventoryQuantity}</p>
                                    <p>Cantidad disponíble: {selectedTool.quantityAvailable}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '30px' }}>
                                    <div>
                                        <h4>Imágen de la herramienta:</h4>
                                        <img style={{ maxWidth: '100%', maxHeight: '200px' }} src={selectedTool.image} alt="Imagen de la herramienta no disponible" />
                                    </div>
                                    <div>
                                        <h4>Código QR:</h4>
                                        <img style={{ width: '150px' }} src={selectedTool.barcode} alt="Código QR" />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}





                {/* modal para eliminar */}
                {modalOpenDelete && selectedTool && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Eliminar</h3>
                            <label>¿Desea eliminar esta herramienta?</label>
                            <div className="modal-buttons">
                                <button className="modal-save" onClick={changeModalDelte}>
                                    Eliminar
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* modal para reparar o eliminar */}
                {modalOpenRepair && selectedTool && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Reparar</h3>
                            <label>¿Desea reparar o eliminar esta herramienta?</label>
                            <div className="modal-buttons">
                                <button className="modal-save" onClick={repairClick}>
                                    Reparar
                                </button>
                                <button className="modal-delete" onClick={changeModalDelte}>
                                    Eliminar
                                </button>
                                <button className="modal-close" onClick={handleModalClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}