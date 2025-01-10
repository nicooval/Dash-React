import moment from 'moment';
const getAreaChartOpt = (data = []) => {
    // Organizar datos por eutrancellfdd

    data.forEach(item => {
        item.Date_id = moment(item.Date_id).format('YYYY-MM-DD');
    });

    const dataByEutrancell = {};

    data.forEach(item => {
        const eutrancell = item.EutrancellFDD; // Ej: "L00837"
        const date = item.Date_id; // Ej: "2024-09-01"
        const Vol = item.Volumen / (1e6); // Convertir a GB (asumiendo que Vol está en bytes)
        const erbs = item.ERBS; // Sitio al que pertenece la celda

        // Inicializa la estructura si no existe
        if (!dataByEutrancell[eutrancell]) {
            dataByEutrancell[eutrancell] = { erbs, values: [] };
        }

        // Agregar los valores de cada fecha al array del eutrancell
        dataByEutrancell[eutrancell].values.push({ date, value: Vol });
    });

    // Obtener todas las fechas únicas para el eje X
    const dates = Array.from(new Set(data.map(item => item.Date_id))).sort();

    // Crear las series
    const series = [];

    // Crear series para cada eutrancellfdd
    for (const eutrancell in dataByEutrancell) {
        const eutrancellData = dataByEutrancell[eutrancell].values;

        // Mapear la data a los valores en orden de fechas
        const dataPoints = dates.map(date => {
            const point = eutrancellData.find(d => d.date === date);
            return point ? point.value : 0; // Si no hay dato, retornar 0
        });

        series.push({
            name: eutrancell, // Nombre de la celda (eutrancellfdd)
            type: 'line', 
            data: dataPoints,
            areaStyle: {}, 
            stack: 'total', 
            symbol: 'none'
        });
    }

    return {
        title: {
            text: 'Volumen',
            top: '-1%',
        },
        tooltip: {
            axisPointer: { type: 'line' },
            trigger: 'axis',
            formatter: function (params) {
                if (Array.isArray(params)) {
                    const date = params[0].name;
                    const values = params.map(param => {
                        const site = dataByEutrancell[param.seriesName]?.erbs;
                        return `${param.marker} ${param.seriesName} (Sitio: ${site}): ${param.value.toFixed(5)} GB`;
                    }).join('<br/>');
                    return `Fecha: ${date}<br/>${values}`;
                } else {
                    const { seriesName, marker, value, name: date } = params;
                    const site = dataByEutrancell[seriesName]?.erbs;
                    return `Fecha: ${date}<br/>Sitio: ${site}<br/>${marker} ${seriesName}: ${value.toFixed(5)} GB`;
                }
            }
        },
        toolbox: {
            feature: {
                saveAsImage: {
                    title: 'Export'  // Personaliza el título si quieres
                }
            }
        },
        grid: {
            left: '15%', // Aumenta el espacio en el lado izquierdo para los valores del eje Y
            //right: '10%', // Puedes ajustar el espacio en el lado derecho si es necesario
            //top: '15%', // Aumenta el espacio en la parte superior si es necesario
            //bottom: '15%' // Aumenta el espacio en la parte inferior para el eje X
          },
        legend: {
            data: series.map(s => s.name),
            type: 'scroll',
            top: '5%',
        },
        xAxis: {
            type: 'category',
            data: dates,
            name: 'Fecha',
            axisLabel: { fontSize: 10 },
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        yAxis: {
            type: 'value',
            name: 'GB',
            nameLocation: 'center',
            nameGap: 70,
            axisLabel: {
                formatter: function (value) {
                    return `${value.toFixed(3)} GB`; // Abreviar y redondear a un decimal
                }
            },
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        series: series,
    };
};

export default getAreaChartOpt;
