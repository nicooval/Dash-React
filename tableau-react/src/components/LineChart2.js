import moment from 'moment';
const getLineChartOpt2 = (data = []) => {
    // Organizar datos por eutrancellfdd

    data.forEach(item => {
        item.date_id = moment(item.date_id).format('YYYY-MM-DD');
    });
    const dataByEutrancell = {};
    console.log("Aaqui",data);

    data.forEach(item => {
        const eutrancell = item.EutrancellFDD; // Ej: "L00837"
        const date = item.date_id; // Ej: "2024-09-01"
        const nutMix2Value = item.peak_UserRRC; // Velocidad de descarga
        const erbs = item.ERBS; // Sitio al que pertenece la celda

        // Inicializa la estructura si no existe
        if (!dataByEutrancell[eutrancell]) {
            dataByEutrancell[eutrancell] = { erbs, values: [] };
        }

        // Agregar los valores de cada fecha al array del eutrancell
        dataByEutrancell[eutrancell].values.push({ date, value: nutMix2Value });
    });

    // Obtener todas las fechas únicas para el eje X
    const dates = Array.from(new Set(data.map(item => item.date_id))).sort();

    // Crear las series
    const series = [];

    // Crear series para cada eutrancellfdd
    for (const eutrancell in dataByEutrancell) {
        const eutrancellData = dataByEutrancell[eutrancell].values;

        // Mapear la data a los valores en orden de fechas
        const dataPoints = dates.map(date => {
            const point = eutrancellData.find(d => d.date === date);
            return point ? point.value : null; // Si no hay dato, retornar null
        });

        series.push({
            name: eutrancell, // Nombre de la celda (eutrancellfdd)
            type: 'line',
            data: dataPoints,
            symbol: 'none'
            // No se especifican colores, se usan los por defecto
        });
    }

    //console.log('Series:', series); // Para ver las series generadas
    //console.log('Dates:', dates); // Para verificar las fechas generadas

    return {
        title: {
            text: 'User RRC',
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
                        return `${param.marker} ${param.seriesName} (Sitio: ${site}): ${param.value} #`;
                    }).join('<br/>');
                    return `Fecha: ${date}<br/>${values}`;
                } else {
                    const { seriesName, marker, value, name: date } = params;
                    const site = dataByEutrancell[seriesName]?.erbs;
                    return `Fecha: ${date}<br/>Sitio: ${site}<br/>${marker} ${seriesName}: ${value} #`;
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
        legend: {
            data: series.map(s => s.name), // Leyenda para cada eutrancellfdd
            type: 'scroll',
            top: '5%',
        },
        xAxis: {
            type: 'category',
            data: dates, // Fechas en el eje X
            name: 'Fecha',
            axisLabel: { fontSize: 10 },
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        yAxis: {
            type: 'value',
            name: '#Peak usser RRC',
            nameLocation: 'center',
            nameGap: 40,
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        series: series, // Series con los datos de cada eutrancellfdd
    };
};

export default getLineChartOpt2;
