import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-semicircle';
import '../App.css' // Importa tu archivo CSS
import DataTable from './DataTable';


const LTEMap2 = ({ cellData, Disper_1, RSSI }) => {
  const [mapCenter, setMapCenter] = useState([40.416775, -3.703790]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [prevCellData, setPrevCellData] = useState([]);
  const [shouldCenterMap, setShouldCenterMap] = useState(true);





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
        Header: 'RSSI_PUCCH',
        accessor: 'RSSI_PUCCH',
      },



      // Agrega más columnas según tus necesidades
    ],
    []
  );



  // Obtener datos combinados y filtrados
  const data = useMemo(() => {
    return selectedCells.length > 0
      ? RSSI.filter(item => 
          selectedCells.includes(item.EutrancellFDD) &&
          ((item.RSSI_PUCCH > -100 && item.RSSI_PUCCH < -70) ||
           (item.RSSI_PUCCH <= -100 && item.RSSI_PUCCH >= -105))
        )
      : RSSI.filter(item =>
          (item.RSSI_PUCCH > -100 && item.RSSI_PUCCH < -70) ||
          (item.RSSI_PUCCH <= -100 && item.RSSI_PUCCH >= -105)
        );
  }, [RSSI, selectedCells]);


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
    }, [map]); 
    return null;
  };

  const getSemiCircleProps = (elementName) => {
    const initial = elementName[0];
    switch (initial) {
      case 'L':
        return { color: '#3388ff', radius: 180 };
      case 'M':
        return { color: '#ff5733', radius: 150 };
      case 'P':
        return { color: '#33ff88', radius: 120 };
      case 'Q':
        return { color: '#ff33a8', radius: 90 };
      default:
        return { color: '#3388ff', radius: 90 };
    }
  };

  const getColorFromKPI = (elementName) => {
    const kpiData = RSSI.find(data => data.EutrancellFDD === elementName);
    if (kpiData) {
        
        
        if (kpiData.RSSI_PUCCH > -100 && kpiData.RSSI_PUCCH < -70 ) {
          return { color: '#FF0000', fillOpacity: 0.9 };
        } else if (kpiData.RSSI_PUCCH <= -100 && kpiData.RSSI_PUCCH >= -105 ) {
          return { color: '#FFD700', fillOpacity: 0.9 };
        } else {
          return { color: '#000000', fillOpacity: 0 };
        }
      }
      
      // Valor de retorno en caso de que kpiData sea `null` o `undefined`
      return { color: '#000000', fillOpacity: 0 };
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

      const filteredCellData = cellData.filter(cell => 
        data.some(filteredItem => filteredItem.EutrancellFDD === cell['Element Name'])
      );
      
      const sortedCellData = [...filteredCellData].sort((a, b) => {
        const nameA = a['Element Name'].toUpperCase();
        const nameB = b['Element Name'].toUpperCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });

      filteredCellData.forEach((cell) => {
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
          color: 'black',
          weight: 0,
          fillColor: color,
          fillOpacity: semiCircleOpacity,
          weight: 1, 
        });

        const calculateDirectionalOffset = (angle, distance) => {
          const angleRad = (angle * Math.PI) / 180;
        
          // Calcula el desplazamiento en función del ángulo y la distancia.
          let offsetX = Math.sin(angleRad) * distance;
          let offsetY = -Math.cos(angleRad) * distance;
        
          // Si el ángulo está entre 225° y 315°, invierte el desplazamiento vertical para abrir el popup hacia arriba.
          if (angle >= 150 && angle <= 210) {
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

      <div style={{ height: '100%', width: '100%', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gridTemplateRows: '1fr', gap: '10px'  }}> 
        <MapContainer center={mapCenter} zoom={13} style={{ display: 'flex',flexWrap: 'wrap',height: '100%', width: '100%', borderRadius: '8px' }}>
          <MapWithCenter />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <SemicirclesLayer />
        </MapContainer>
        <DataTable columns={columns} data={data} style={{ display: 'flex',flexWrap: 'wrap',height: '100%', width: '100%', borderRadius: '8px' }}/> {/* Aquí usamos la tabla */}
      </div>

    </div>
  );
};

export default LTEMap2;
