//CATEGORIA
import React, { useState } from 'react';
import './category.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faChair, faHelmetSafety, faScrewdriverWrench, faStapler } from '@fortawesome/free-solid-svg-icons';
import { Tool } from '../tool/Tool';
import { Consumable } from '../consumable/Consumable';
import { Epp } from '../epp/Epp';
import { FixedAssets } from '../fixedAssets/FixedAssets';
import { Furniture } from '../furniture/Furniture';

export const Category = () => {
    // herramientas
    const [tools, setTools] = useState(true);
    // consumibles
    const [consumable, setConsumable] = useState(false);
    // EPP
    const [epp, setEpp] = useState(false);
    // activo fijo
    const [fixedAssets, setFixedAssets] = useState(false);
    // mobiliario
    const [furniture, setFurniture] = useState(false);


        const btntool = () => {
            setTools(true);
            setConsumable(false);
            setEpp(false);
            setFixedAssets(false);
            setFurniture(false);
        }

        const btnconsumable = () => {
            setConsumable(true);
            setTools(false);
            setEpp(false);
            setFixedAssets(false);
            setFurniture(false);
        }

        const btnepp = () => {
            setEpp(true);
            setConsumable(false);
            setTools(false);
            setFixedAssets(false);
            setFurniture(false);
        }

        const btnfixedassets = () => {
            setFixedAssets(true);
            setEpp(false);
            setConsumable(false);
            setTools(false);
            setFurniture(false);
        }

        const btnfurniture = () => {
            setFurniture(true);
            setFixedAssets(false);
            setEpp(false);
            setConsumable(false);
            setTools(false);
        }



        return (
            <div className='category-container'>
                <div className='subcategory-container'>
                    {tools ? (
                        <button className='btntool'><u style={{ color: 'cornflowerblue' }}>Herramientas  <FontAwesomeIcon icon={faScrewdriverWrench} /></u></button>
                    ) : (
                        <button onClick={btntool} className='btntool'>Herramientas  <FontAwesomeIcon icon={faScrewdriverWrench} /></button>
                    )}

                    {consumable ? (
                        <button className='btnconsumable'><u style={{ color: 'cornflowerblue' }}>Consumibles  <FontAwesomeIcon icon={faStapler} /></u></button>
                    ) : (
                        <button onClick={btnconsumable} className='btnconsumable'>Consumibles  <FontAwesomeIcon icon={faStapler} /></button>
                    )}

                    {epp ? (
                        <button className='btnepp'><u style={{ color: 'cornflowerblue' }}>EPP  <FontAwesomeIcon icon={faHelmetSafety} /></u></button>
                    ) : (
                        <button onClick={btnepp} className='btnepp'>EPP  <FontAwesomeIcon icon={faHelmetSafety} /></button>
                    )}

                    {fixedAssets ? (
                        <button className='btnfixedassets'><u style={{ color: 'cornflowerblue' }}>Activo fijo  <FontAwesomeIcon icon={faBuilding} /></u></button>
                    ) : (
                        <button onClick={btnfixedassets} className='btnfixedassets'>Activo fijo  <FontAwesomeIcon icon={faBuilding} /></button>
                    )}

                    {furniture ? (
                        <button className='btnfurniture'><u style={{ color: 'cornflowerblue' }}>Mobiliario  <FontAwesomeIcon icon={faChair} /></u></button>
                    ) : (
                        <button onClick={btnfurniture} className='btnfurniture'>Mobiliario  <FontAwesomeIcon icon={faChair} /></button>
                    )}

                </div>
                <div className='table-container'>
                    {tools ? (<Tool />) : <></>}
                    {consumable ? (<Consumable />) : (<></>)}
                    {epp ? (<Epp />) : (<></>)}
                    {fixedAssets ? (<FixedAssets />) : (<></>)}
                    {furniture ? (<Furniture />) : (<></>)}
                </div>

            </div>
        )
    }
