//CONSUMIBLES
import React from 'react'
import imgConstruction from '../../images/construction.png';
import './consumable.css'

export const Consumable = () => {
  return (
    <div className='container'>
        <h1>Proximamente consumibles</h1>
        <img src={imgConstruction} alt='Imagen'/>
    </div>
  )
}
