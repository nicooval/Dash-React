import moment from 'moment';
const getLineChartOpt = (data = []) => {

    data.forEach(item => {
        item.Date_id = moment(item.Date_id).format('YYYY-MM-DD');
    });
    // Organizar datos por eutrancellfdd
    const dataByEutrancell = {};
    console.log(data);

    data.forEach(item => {
        const eutrancell = item.EutrancellFDD; // Ej: "L00837"
        const date = item.Date_id; // Ej: "2024-09-01"
        const nutMix2Value = item.NUT_MIX2; // Velocidad de descarga

        // Inicializa la estructura si no existe
        if (!dataByEutrancell[eutrancell]) {
            dataByEutrancell[eutrancell] = [];
        }

        // Agregar los valores de cada fecha al array del eutrancell
        dataByEutrancell[eutrancell].push({ date, value: nutMix2Value });
    });

    // Obtener todas las fechas únicas para el eje X
    const dates = Array.from(new Set(data.map(item => item.Date_id))).sort();

    // Crear las series
    const series = [];

    // Crear series para cada eutrancellfdd
    for (const eutrancell in dataByEutrancell) {
        const eutrancellData = dataByEutrancell[eutrancell];

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

    console.log('Series:', series); // Para ver las series generadas
    console.log('Dates:', dates); // Para verificar las fechas generadas

    return {
        title: {
            text: 'NUT',
            top: '-1%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line' },
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
            name: 'Mbps',
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

export default getLineChartOpt;
