import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-semicircle';
import getHistogramOptions from './BarOptions';
import ReactECharts from 'echarts-for-react';
import getLineChartOptions from './LineChartOptions';
import getLineChartOpt from './LineChartOpt';
import getLineChartOpt2 from './LineChart2';
import getAreaChartOpt from './AreaChartOpt';
import '../App.css' // Importa tu archivo CSS
import DataTable from './DataTable';


const LTEMap = ({ cellData, Disper_1, Disper_2, RSSI, USSER }) => {
  const [mapCenter, setMapCenter] = useState([40.416775, -3.703790]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [prevCellData, setPrevCellData] = useState([]);
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [histogramOptions, setHistogramOptions] = useState({});
  const [LineOptions, setLineOptions] = useState({});
  const [LineOptions2, setLineOptions2] = useState({});
  const [LineOptions3, setLineOptions3] = useState({});
  const [LineOptions4, setLineOptions4] = useState({});




  const columns = useMemo(
    () => [
      {
        Header: 'Sitio',
        accessor: 'ERBS', // Atributo que coincide con los nombres de las claves de Disper_1 o Disper_2
      },
      {
        Header: 'Celda',
        accessor: 'EutrancellFDD', // Atributo que coincide con los nombres de las claves de Disper_1 o Disper_2
      },
      {
        Header: 'Poligono',
        accessor: 'poligono', // Atributo que coincide con los nombres de las claves de Disper_1 o Disper_2
      },
      {
        Header: 'NUT',
        accessor: 'NUT_MIX2',
      },
      {
        Header: 'RSSI_PUCCH',
        accessor: 'RSSI_PUCCH',
      },



      // Agrega más columnas según tus necesidades
    ],
    []
  );

  const innerJoin = (arr1, arr2, key) => {
    return arr1.map(item1 => ({
      ...item1,
      ...arr2.find(item2 => item2[key] === item1[key]),
    })).filter(item => item[key] !== undefined);
  };

  // Obtener datos combinados y filtrados
  const data = useMemo(() => {
    const joinedData = innerJoin(RSSI, Disper_1, 'EutrancellFDD'); 
    console.log("JOIN",joinedData)// Realiza el join
    return selectedCells.length > 0
      ? joinedData.filter(item => selectedCells.includes(item.EutrancellFDD))
      : joinedData;
    
  }, [RSSI, Disper_1, selectedCells]);

  useEffect(() => {
    const filteredData = selectedCells.length > 0
      ? Disper_1.filter(item => selectedCells.includes(item.EutrancellFDD))
      : Disper_1;

    const options = getHistogramOptions(filteredData);
    setHistogramOptions(options);
    //console.log("opciones histograma", options);
    //console.log("data filtrada", filteredData);
  }, [Disper_1, selectedCells]);

  useEffect(() => {
    const filteredData2 = selectedCells.length > 0
      ? Disper_2.filter(item => selectedCells.includes(item.EutrancellFDD))
      : Disper_2;

    const options = getLineChartOptions(filteredData2);
    setLineOptions(options);
    //console.log("opciones Line", options);
    //console.log("data filtrada", filteredData2);
  }, [Disper_2, selectedCells]);

  useEffect(() => {
    const filteredData3 = selectedCells.length > 0
      ? Disper_2.filter(item => selectedCells.includes(item.EutrancellFDD))
      : [];

    const options = getLineChartOpt(filteredData3);
    setLineOptions2(options);
    
    //console.log("data filtrada", filteredData3);
  }, [ selectedCells,Disper_2]);

  useEffect(() => {
    const filteredData4 = selectedCells.length > 0
      ? Disper_2.filter(item => selectedCells.includes(item.EutrancellFDD))
      : [];

    const options = getAreaChartOpt(filteredData4);
    setLineOptions3(options);
    //console.log("opciones Line", options);
    //console.log("data filtrada", filteredData3);
  }, [ selectedCells,Disper_2]);

  useEffect(() => {
    const filteredData5 = selectedCells.length > 0
      ? USSER.filter(item => selectedCells.includes(item.EutrancellFDD))
      : [];

    const options = getLineChartOpt2(filteredData5);
    setLineOptions4(options);
    console.log("opciones Line", filteredData5);
    console.log("data filtrada", options);
  }, [ selectedCells,USSER]);

  useEffect(() => {
    if (cellData.length > 0 && cellData !== prevCellData) {
      setShouldCenterMap(true);
      
      // Calcular el centro a partir de todas las celdas
      const latitudes = cellData.map(cell => cell.Latitude);
      const longitudes = cellData.map(cell => cell.Longitude);
      
      const centerLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
      const centerLongitude = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
  
      setMapCenter([centerLatitude, centerLongitude]);
      setPrevCellData(cellData);
    }
  }, [cellData, prevCellData]);
  
  const MapWithCenter = () => {
    const map = useMap();
    useEffect(() => {
      if (shouldCenterMap) {
        map.setView(mapCenter, 12.5);
        setShouldCenterMap(false);
      }
    }, [map, shouldCenterMap, mapCenter]); 
    return null;
  };

  const getSemiCircleProps = (elementName) => {
    const initial = elementName[0];
    switch (initial) {
      case 'L':
        return { color: '#3388ff', radius: 110 };
      case 'M':
        return { color: '#ff5733', radius: 80 };
      case 'P':
        return { color: '#33ff88', radius: 50 };
      case 'Q':
        return { color: '#ff33a8', radius: 30 };
      default:
        return { color: '#3388ff', radius: 30 };
    }
  };

  const getColorFromKPI = (elementName) => {
    const kpiData = Disper_1.find(data => data.EutrancellFDD === elementName);
    if (kpiData) {
      switch (kpiData.DL_USER_THP_RANGOS) {
        case 'Menor 2 Mbps':
          return { color: '#C8102E', fillOpacity: 0.9 };
        case 'Entre 2 a 3.3 Mbps':
          return { color: '#F3A3A1', fillOpacity: 0.9 };
        case 'Mayor 3.3 Mbps':
          return { color: '#0056A0', fillOpacity: 0.5 };
        default:
          return { color: '#000000', fillOpacity: 0.5 };
      }
    }
    return { color: '#000000', fillOpacity: 0.1 };
  };

  const handleCellClick = (cellName) => {
    setShouldCenterMap(false);
    setSelectedCells((prevSelectedCells) => {
      const updatedCells = prevSelectedCells.includes(cellName)
        ? prevSelectedCells.filter(name => name !== cellName)
        : isMultiSelect ? [...prevSelectedCells, cellName] : [cellName];

      //console.log("Celdas seleccionadas:", updatedCells);
      return updatedCells;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsMultiSelect(true);

      console.log(setSelectedCells);
       // Limpia la selección de celdas con Esc
      setShouldCenterMap(false);
    };
  
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsMultiSelect(false);
      setShouldCenterMap(false);
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const SemicirclesLayer = () => {
    const map = useMap();
    
    useEffect(() => {
      const semiCirclesGroup = L.layerGroup();
      
      const sortedCellData = [...cellData].sort((a, b) => {
        const nameA = a['Element Name'].toUpperCase();
        const nameB = b['Element Name'].toUpperCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });

      sortedCellData.forEach((cell) => {
        const { radius } = getSemiCircleProps(cell['Element Name']);
        const isSelected = selectedCells.includes(cell['Element Name']);
        const { color, fillOpacity } = getColorFromKPI(cell['Element Name']);
        
        //const semiCircleRadius = isSelected ? radius + 30 : radius;
        const semiCircleOpacity = selectedCells.length > 0 
          ? (isSelected ? fillOpacity : 0.1)
          : fillOpacity;

        const semiCircle = L.semiCircle([cell.Latitude, cell.Longitude], {
          radius: radius,
          startAngle: cell.Azimuth - 30,
          stopAngle: cell.Azimuth + 30,
          color: color,
          fillOpacity: semiCircleOpacity,
          weight: 1, 
        });

        const calculateDirectionalOffset = (angle, distance) => {
          const angleRad = (angle * Math.PI) / 180;
        
          // Calcula el desplazamiento en función del ángulo y la distancia.
          let offsetX = Math.sin(angleRad) * distance;
          let offsetY = -Math.cos(angleRad) * distance;
        
          // Si el ángulo está entre 225° y 315°, invierte el desplazamiento vertical para abrir el popup hacia arriba.
          if (angle >= 135 && angle <= 225) {
            offsetY = -offsetY;
          }
        
          return L.point(offsetX, offsetY);
        };
  
        // Generar el popup con un offset direccional basado en el ángulo ajustado
        semiCircle.bindPopup(`Sitio:${cell['ENODEBNAME']}<br>Cell:${cell['Element Name']}<br>PCI: ${cell['PCI']}<br>TAC: ${cell['TAC']}`, {
          offset: calculateDirectionalOffset(cell.Azimuth, radius+100),
        });
        semiCircle.on('mouseover', function () {
          this.openPopup();
        });
        semiCircle.on('mouseout', function () {
          this.closePopup();
        });
        semiCircle.on('click', () => handleCellClick(cell['Element Name']));
        semiCirclesGroup.addLayer(semiCircle);
      });

      semiCirclesGroup.addTo(map);

      return () => {
        map.removeLayer(semiCirclesGroup);
      };
    }, [map]);

    return null;
  };

  return (
    <div style={{ display: 'flex', height: '90vh', gap: '10px', padding: '20px' }}> {/* Contenedor del dashboard */}
      {/* Contenedor del mapa */}

      <div style={{ display: 'flex', height: '100%', width: '25%', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr', gap: '5px' }}>
        <ReactECharts option={histogramOptions} style={{ height: '100%', width: '100%',display: 'flex',flexWrap: 'wrap' }} notMerge={true} lazyUpdate={true} />
        <ReactECharts option={LineOptions} style={{ height: '100%', width: '100%',display: 'flex',flexWrap: 'wrap' }} notMerge={true} lazyUpdate={true} />
        
      </div>
      <div style={{ display: 'flex', height: '100%', width: '40%', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1.5fr 0.5fr', gap: '10px'  }}> 
        <MapContainer center={mapCenter} zoom={13} style={{ display: 'flex',flexWrap: 'wrap',height: '100%', width: '100%', borderRadius: '8px' }}>
          <MapWithCenter />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <SemicirclesLayer />
        </MapContainer>
        <DataTable columns={columns} data={data}  /> {/* Aquí usamos la tabla */}
      </div>
  
      {/* Contenedor de gráficos */}
      <div style={{ display: 'flex', height: '100%', width: '35%', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '5px' }}>
        <ReactECharts option={LineOptions2} style={{ height: '100%', width: '100%', display: 'flex',flexWrap: 'wrap'}} notMerge={true} lazyUpdate={true} />
        <ReactECharts option={LineOptions3} style={{ height: '100%', width: '100%', display: 'flex',flexWrap: 'wrap'}} notMerge={true} lazyUpdate={true} />
        <ReactECharts option={LineOptions4} style={{ height: '100%', width: '100%', display: 'flex',flexWrap: 'wrap'}} notMerge={true} lazyUpdate={true} />
        
      </div>
    </div>
  );
};

export default LTEMap;
