import React, { useEffect, useState } from 'react';
import LTEMap from './LTEmap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import '../App.css' // Importa tu archivo CSS
import Button from 'react-bootstrap/Button';

const Panel = () => {
  const [polygons, setPolygons] = useState([]); // Guarda los nombres de los polígonos
  const [selectedPolygon, setSelectedPolygon] = useState(''); // Guarda el polígono seleccionado
  const [cellData, setCellData] = useState([]); // Guarda los datos combinados de la consulta y el Excel
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [Disper_1, setDisper_1] = useState([]);
  const [Disper_2, setDisper_2] = useState([]);
  const [RSSI, setRSSI] = useState([]);
  const [USSER, setUSSER] = useState([]);

  // Consulta inicial para obtener todos los polígonos al cargar la página
  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await fetch('/api/polygons');
        const data = await response.json();
        setPolygons(data ? data.map((polygon) => ({ label: polygon, value: polygon })) : []);
      } catch (error) {
        console.error('Error fetching polygons:', error);
        setPolygons([]);
      }
    };
    fetchPolygons();
  }, []);

//   useEffect(() => {
//     const fetchPolygons = async () => {
//       try {
//         const response = await fetch('/api/polygons');
//         const data = await response.json();
//         setPolygons(data ? data.map((polygon) => ({ label: polygon, value: polygon })) : []);
//       } catch (error) {
//         console.error('Error fetching polygons:', error);
//         setPolygons([]); // Asegura que `polygons` no sea null en caso de error
//       }
//     };
//     fetchPolygons();
//   }, []);

  console.log("pol",polygons)

  // Consulta específica para obtener datos de un polígono seleccionado y el Excel filtrado
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/data?polygon=${selectedPolygon}`);
      const {queryData, excelData} = await response.json();
      setCellData(excelData); // Actualiza el estado con los datos del Excel filtrado
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Consulta específica para obtener datos de dispersión
  const fetchDisp_1 = async () => {
    try {
      const response = await fetch(`/api/Disp_1?start_date=${formattedStartDate}&end_date=${formattedEndDate}&polygon=${selectedPolygon}`);
      const result_disp_1 = await response.json();
      setDisper_1(result_disp_1);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchDisp_2 = async () => {
    try {
      const response = await fetch(`/api/Disp_2?end_date=${formattedEndDate}&polygon=${selectedPolygon}`);
      const result_disp_2 = await response.json();
      setDisper_2(result_disp_2);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchRSSI = async () => {
    try {
      const response = await fetch(`/api/RSSI?start_date=${formattedStartDate}&end_date=${formattedEndDate}&polygon=${selectedPolygon}`);
      const result_RSSI = await response.json();
      setRSSI(result_RSSI);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUSSER = async () => {
    try {
      const response = await fetch(`/api/USSER?end_date=${formattedEndDate}&polygon=${selectedPolygon}`);
      const result_USSER = await response.json();
      setUSSER(result_USSER);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Maneja el clic del botón para buscar datos
  const handleSearch = () => {

    if (selectedPolygon && startDate && endDate) {
      fetchData();
      fetchDisp_1();
      fetchDisp_2();
      fetchRSSI();
      fetchUSSER();
    } else {
      alert('Selecciona un polígono y fechas antes de buscar.');
    }
  };

  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
//console.log("A",Disper_1)
//console.log("B",Disper_2)
//console.log("C",RSSI)
console.log("D",USSER)
return (
    <div className="panel-container">
      <div style={{ display: 'flex', alignItems: 'center',padding: '0px',zIndex: 3 }}>
        <Select
          className="basic-single"
          value={polygons ? polygons.find((polygon) => polygon.value === selectedPolygon) : null}
          onChange={(selectedOption) => setSelectedPolygon(selectedOption.value)}
          options={polygons || []}
          isSearchable={true}
          placeholder="Selecciona un polígono"
          
          styles={{

            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? 'lightgray' : 'white', // Color de fondo al pasar el mouse
              color: state.isFocused ? 'black' : 'black', // Color del texto
              cursor: 'pointer', // Cursor al pasar el mouse
            }),
            container: (provided) => ({
              ...provided,
              flex: 1,
              maxWidth: '30%', // Limitar a la mitad del ancho
            }),
            control: (provided) => ({
              ...provided,
              height: '39px', // Reducir la altura
              minHeight: '30px', // Asegurar altura mínima
              border: '2px solid #ccc', // Bordes más delgados
              boxShadow: 'none', // Sin sombra
              '&:hover': {
                border: '2px solid black', // Color al pasar el mouse
              },
            }),
            singleValue: (provided) => ({
              ...provided,
              fontSize: '11px', // Tamaño de fuente más pequeño
            }),
            placeholder: (provided) => ({
              ...provided,
              fontSize: '11px', // Tamaño de fuente más pequeño para el placeholder
            
          
            }),
            
          }}
        />

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showIcon
          dateFormat="yyyy-MM-dd"
          placeholderText="Fecha de inicio"
          className="date-picker"
          style={{ height: '30px' }} // Reducir altura
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          showIcon
          dateFormat="yyyy-MM-dd"
          placeholderText="Fecha de fin"
          className="date-picker"
          style={{ height: '30px' }} // Reducir altura

          
        />
        <Button variant="dark" onClick={handleSearch}>Buscar</Button>
      </div>

      

      <div style={{ height: '100vh', width: '100%' }}>
        <LTEMap cellData={cellData} Disper_1={Disper_1} Disper_2={Disper_2} RSSI={RSSI} USSER={USSER} />
      </div>
    </div>
  );
};

export default Panel;
