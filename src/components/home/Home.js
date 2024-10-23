import React,{useState,useEffect} from 'react';
import './home.css';
import {Category} from '../category/Category';
import {Loan} from '../loan/Loan';
import {Report} from '../report/Report';
import {Profile} from '../profile/Profile';

export const Home = ({onLogout,selectedItem}) => {

  const handleLogout = () =>{
    onLogout()
  }

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      if(storedIsLoggedIn && storedIsLoggedIn === 'true'){
        setIsLoggedIn(true);
      }
    }, []);
    

  return (
    <div className='main-container'>
      {selectedItem==='1' && <Category onLogout={handleLogout}/>}
      {selectedItem==='2' && <Loan onLogout={handleLogout}/>}
      {selectedItem==='3' && <Report onLogout={handleLogout}/>}
      {selectedItem==='4' && <Profile onLogout={handleLogout}/>}
    </div>
  )
}
