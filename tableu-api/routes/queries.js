// routes/data.js
const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const XLSX = require('xlsx');
const path = require('path');

// Cargar el archivo Excel una sola vez al iniciar el servidor
let excelData = [];

const loadExcelData = () => {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, './Celdas_LTE.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    excelData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Datos de Excel cargados correctamente');
  } catch (error) {
    console.error('Error al cargar el archivo Excel:', error);
  }
};

// Llama a loadExcelData para cargar los datos al iniciar el servidor
loadExcelData();

// Consulta inicial para obtener todos los nombres de los polígonos únicos
const getPolygonsQuery = () => {
  return `
    SELECT DISTINCT polygon 
    FROM listado_nacional 
    WHERE \`release\` = 'Ericsson LTE FDD'
      AND (tipo_solucion NOT IN ( 'maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
      -- AND ran_device_status NOT LIKE 'ELIMINADO'
      -- AND ran_device_status NOT LIKE 'PREVIO'
      ORDER BY polygon;
  `;
};

// Consulta para obtener datos específicos de un polígono
const buildQuery = (polygon) => {
  return `
    SELECT DISTINCT
      cell_name,
      pop_name,
      polygon
    FROM listado_nacional
    WHERE \`release\` = 'Ericsson LTE FDD'
      AND (tipo_solucion NOT IN ('maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
      -- AND ran_device_status NOT LIKE 'ELIMINADO'
      -- AND ran_device_status NOT LIKE 'PREVIO'
      ${polygon ? `AND polygon = '${polygon}'` : ''};
  `;
};

const buildDisp_1 = (params) => {
  return `with
sitios as 
(
	select distinct ran_device_id as nodos,polygon as poligono
	from PM_ENTEL.listado_nacional 
	where \`release\` like "Ericsson LTE FDD" 
  AND (tipo_solucion NOT IN ('maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
  -- AND ran_device_status NOT LIKE 'ELIMINADO'
  -- AND ran_device_status NOT LIKE 'PREVIO'
  and 
	(
    polygon = '${params.polygon}'

    )
)
select
	case left(eutrancellFDD,1) when 'L' then 'B2600' when 'P' then 'B1900 C' when 'M' then 'B700' when 'Q' then 'B1900 A' else 'Other' end as band,
    b.poligono,
	ERBS,
	EutrancellFDD,
	round(SUM(NUM_NUT_PEAK_USER),3) as Volumen,
	SUM(NUM_NUT_PEAK_VOL)/SUM(DEN_NUT_PEAK_VOL) as NUT_VOL,
	SUM(NUM_NUT_PEAK_USER)/SUM(DEN_NUT_PEAK_USER) as NUT_USER,
	SUM(NUM_EXITO_PAQUETES3)/SUM(DEN_EXITO_PAQUETES3) as EXITO_PKT,
	round(SUM(NUM2_NUT_MIX2)/SUM(DEN2_NUT_MIX2),2) as NUT_MIX2,
	case when SUM(NUM2_NUT_MIX2)/SUM(DEN2_NUT_MIX2)<2 then 'Menor 2 Mbps' when SUM(NUM2_NUT_MIX2)/SUM(DEN2_NUT_MIX2)<3.3 then 'Entre 2 a 3.3 Mbps'  when SUM(NUM2_NUT_MIX2)/SUM(DEN2_NUT_MIX2)>3.3 then 'Mayor 3.3 Mbps' else 'Other' end as DL_USER_THP_RANGOS
from PM_ENTEL.NUT_EUTRANCELLFDD_DAY a
left outer join sitios b on a.ERBS = b.nodos
where  date_id between '${params.dateRange.start}' and '${params.dateRange.end}' and ERBS in (select nodos from sitios)
group by band,EutrancellFDD,ERBS;
  `;
};

const buildDisp_2 = (params) => {
  return `WITH
sitios AS (
    SELECT DISTINCT ran_device_id AS nodos, polygon AS poligono
    FROM PM_ENTEL.listado_nacional 
    WHERE \`release\` LIKE "Ericsson LTE FDD" 
      AND (tipo_solucion NOT IN ('maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
      -- AND ran_device_status NOT LIKE 'ELIMINADO'
      -- AND ran_device_status NOT LIKE 'PREVIO'
      AND polygon = '${params.polygon}'
)
SELECT
    CASE LEFT(eutrancellFDD, 1) 
        WHEN 'L' THEN 'B2600' 
        WHEN 'P' THEN 'B1900 C' 
        WHEN 'M' THEN 'B700' 
        WHEN 'Q' THEN 'B1900 A' 
        ELSE 'Other' 
    END AS band,
    Date_id,
    b.poligono,
    ERBS,
    EutrancellFDD,
    SUM(NUM_NUT_PEAK_USER) as Volumen,
    SUM(NUM_NUT_PEAK_VOL) / SUM(DEN_NUT_PEAK_VOL) AS NUT_VOL,
    SUM(NUM_NUT_PEAK_USER) / SUM(DEN_NUT_PEAK_USER) AS NUT_USER,
    SUM(NUM_EXITO_PAQUETES3) / SUM(DEN_EXITO_PAQUETES3) AS EXITO_PKT,
    round(SUM(NUM2_NUT_MIX2) / SUM(DEN2_NUT_MIX2),2) AS NUT_MIX2,
    CASE 
        WHEN SUM(NUM2_NUT_MIX2) / SUM(DEN2_NUT_MIX2) < 2 THEN 'Menor 2 Mbps' 
        WHEN SUM(NUM2_NUT_MIX2) / SUM(DEN2_NUT_MIX2) < 3.3 THEN 'Entre 2 a 3.3 Mbps'  
        WHEN SUM(NUM2_NUT_MIX2) / SUM(DEN2_NUT_MIX2) > 3.3 THEN 'Mayor 3.3 Mbps' 
        ELSE 'Other' 
    END AS DL_USER_THP_RANGOS
FROM PM_ENTEL.NUT_EUTRANCELLFDD_DAY a
LEFT OUTER JOIN sitios b ON a.ERBS = b.nodos
WHERE date_id BETWEEN DATE_SUB('${params.dateRange.end}', INTERVAL 40 DAY) AND '${params.dateRange.end}'
  AND ERBS IN (SELECT nodos FROM sitios) 
  AND DAYOFWEEK(Date_id) BETWEEN 2 AND 6
GROUP BY band, EutrancellFDD, ERBS, Date_id;

  `;
};


const build_RSSI = (params) => {
  return `with
sitios as 
(
	select distinct ran_device_id as nodos, polygon as poligono
	from PM_ENTEL.listado_nacional 
	where \`release\` like "Ericsson LTE FDD"
  AND (tipo_solucion NOT IN ('maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
   and (polygon = '${params.polygon}')
)

select 
	ERBS,EutrancellFDD,
    b.poligono,
    round(10*log(10,(1000*avg(pow(10,(RSSI_PUCCH_dbm/10))/1000))),1) as RSSI_PUCCH,
	round(10*log(10,(1000*avg(pow(10,(RSSI_PUSCH_dbm/10))/1000))),1) as RSSI_PUSCH    
    from PM_ENTEL.EUTRANCELLFDD_V_HOUR a
    left outer join sitios b on a.ERBS = b.nodos
	where hour_id in ('9','10','11','12','13','14','15','16','17','18','19','20','21','22')
		  and date_id between '${params.dateRange.start}' and '${params.dateRange.end}'


and ERBS in (select nodos from sitios)
	Group by ERBS,EutrancellFDD;

  `;
};


const build_USSER = (params) => {
  return `WITH sitios AS 
(
    SELECT DISTINCT 
        ran_device_id AS nodos, 
        polygon AS poligono
    FROM PM_ENTEL.listado_nacional 
    WHERE \`release\` = "Ericsson LTE FDD"
    AND (tipo_solucion NOT IN ('maqueta', 'evento', 'San Antonio') OR tipo_solucion IS NULL)
    AND polygon = '${params.polygon}'
),

filtered_data AS
(
    SELECT 
        date_id,
        hour_id,
        b.poligono,
        a.ERBS,
        a.EutrancellFDD,
        a.pmRrcConnLevSum,
        a.pmRrcConnLevSamp
    FROM PM_ENTEL.EUTRANCELLFDD_HOUR a
    INNER JOIN sitios b 
        ON a.ERBS = b.nodos
    WHERE 
        date_id BETWEEN DATE_SUB('${params.dateRange.end}', INTERVAL 40 DAY) AND '${params.dateRange.end}'
        AND DAYOFWEEK(date_id) NOT IN (1, 7)  -- Excluir domingos (1) y sábados (7)
),

userRRC_values AS
(
    SELECT 
        date_id,
        hour_id,
        poligono,
        ERBS,
        EutrancellFDD,
        SUM(pmRrcConnLevSum) / NULLIF(SUM(pmRrcConnLevSamp), 0) AS UserRRC
    FROM filtered_data
    GROUP BY 
        date_id, 
        hour_id,
        poligono, 
        ERBS, 
        EutrancellFDD
),

max_userRRC_daily AS
(
    SELECT 
        date_id,
        EutrancellFDD,
        MAX(UserRRC) AS MaxUserRRC
    FROM userRRC_values
    GROUP BY 
        date_id, 
        EutrancellFDD
),

peak_hour AS
(
    SELECT 
        a.date_id,
        a.poligono,
        a.ERBS,
        a.EutrancellFDD,
        a.hour_id,
        a.UserRRC,
        b.MaxUserRRC
    FROM 
        userRRC_values a
    INNER JOIN 
        max_userRRC_daily b 
    ON 
        a.date_id = b.date_id 
        AND a.EutrancellFDD = b.EutrancellFDD 
        AND a.UserRRC = b.MaxUserRRC
)

SELECT 
    date_id,
    poligono,
    ERBS,
    EutrancellFDD,
    hour_id AS peak_hour,
    ROUND(MaxUserRRC, 3) AS peak_UserRRC
FROM 
    peak_hour
ORDER BY 
    date_id, 
    EutrancellFDD;

  `;
};



router.get('/USSER', (req, res) => {
  const params = {
    dateRange: {
      end: req.query.end_date
    },
    polygon: req.query.polygon,
  };

  const sqlQuery = build_USSER(params);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(results);
  });
});

router.get('/RSSI', (req, res) => {
  const params = {
    dateRange: {
      start: req.query.start_date,
      end: req.query.end_date
    },
    polygon: req.query.polygon,
  };

  const sqlQuery = build_RSSI(params);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(results);
  });
});

router.get('/Disp_1', (req, res) => {
  const params = {
    dateRange: {
      start: req.query.start_date,
      end: req.query.end_date
    },
    polygon: req.query.polygon,
  };

  const sqlQuery = buildDisp_1(params);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(results);
  });
});

router.get('/Disp_2', (req, res) => {
  const params = {
    dateRange: {
      end: req.query.end_date
    },
    polygon: req.query.polygon,
  };

  const sqlQuery = buildDisp_2(params);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(results);
  });
});

// Ruta para obtener todos los nombres de los polígonos
router.get('/polygons', (req, res) => {
  pool.query(getPolygonsQuery(), (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results.map(row => row.polygon));
  });
});

// Ruta para obtener datos de un polígono específico y filtrar el Excel
router.get('/data', (req, res) => {
  const { polygon } = req.query;
  const sqlQuery = buildQuery(polygon);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Extrae los nombres de las celdas de la consulta
    const cellNames = results.map(row => row.cell_name);

    // Filtra los datos del Excel con base en los nombres de celda
    const filteredExcelData = excelData
    .filter(item => {
      const excelCellName = item['Element Name'].split('_')[0]; // Obtén solo el nombre principal
      return cellNames.includes(excelCellName);
    })
    .map(item => {
      // Crea un nuevo objeto con los datos originales
      const { 'Element Name': originalName, ...rest } = item;
      return {
        ...rest,
        'Element Name': originalName.split('_')[0], // Mantén solo la parte antes del '_'
      };
    });
  
  // Retorna los datos de la consulta junto con el Excel filtrado
  res.json({ queryData: results, excelData: filteredExcelData });
  });
});

module.exports = router;
