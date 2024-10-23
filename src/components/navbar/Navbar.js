import React,{useState} from 'react';
import './navbar.css';
import logo from '../../images/Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge,faListOl,faFile,faUser,faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';


export const Navbar = ({onLogout,onSelection}) => {

    const [btnCategory, setBtnCategory] = useState(true);
    const [btnLoans, setBtnLoans] = useState(false);
    const [btnReports, setBtnReports] = useState(false);
    const [btnProfile, setBtnProfile] = useState(false);

    const btncategory=()=>{
        setBtnCategory(true);
        handleItemClick('1');
        setBtnLoans(false);
        setBtnReports(false);
        setBtnProfile(false);
    }

    const btnloans=()=>{
        setBtnLoans(true);
        handleItemClick('2');
        setBtnReports(false);
        setBtnProfile(false);
        setBtnCategory(false);
    }

    const btnreports=()=>{
        setBtnReports(true);
        handleItemClick('3');
        setBtnLoans(false);
        setBtnProfile(false);
        setBtnCategory(false);
    }

    const btnprofile=()=>{
        setBtnProfile(true);
        handleItemClick('4');
        setBtnLoans(false);
        setBtnReports(false);
        setBtnCategory(false);
    }

    const handleItemClick=(item)=>{
        onSelection(item);
    }

  return (
    <div className='navbar-container'>
        <div>
            <img className='logo-navbar' src={logo} alt='Logo'/>
        </div>
        <div className='navbar'>
            {btnCategory?(
            <button className='btn-navbar'><u style={{color:'cornflowerblue'}}>Categorias  <FontAwesomeIcon icon={faTableCellsLarge}/></u></button>    
            ):(
            <button onClick={btncategory} className='btn-navbar'>Categorias  <FontAwesomeIcon icon={faTableCellsLarge}/></button>
            )}

            {btnLoans?(
                <button className='btn-navbar'><u style={{color:'cornflowerblue'}}>Prestamos  <FontAwesomeIcon icon={faListOl}/></u></button>
            ):(
                <button onClick={btnloans} className='btn-navbar'>Prestamos  <FontAwesomeIcon icon={faListOl}/></button>
            )}

            {btnReports?(
                <button className='btn-navbar'><u style={{color:'cornflowerblue'}}>Reportes  <FontAwesomeIcon icon={faFile}/></u></button>
            ):(
                <button onClick={btnreports} className='btn-navbar'>Reportes  <FontAwesomeIcon icon={faFile}/></button>
            )}

            {btnProfile?(
                <button className='btn-navbar'><u style={{color:'cornflowerblue'}}>Perfil  <FontAwesomeIcon icon={faUser}/></u></button>
            ):(
                <button onClick={btnprofile} className='btn-navbar'>Perfil  <FontAwesomeIcon icon={faUser}/></button>
            )}
            <button className='btn-navbar' onClick={onLogout}>Cerrar sesión  <FontAwesomeIcon icon={faArrowRightFromBracket}/></button>
        </div>
        <div className='navbar-content'></div>
    </div>
  )
}
