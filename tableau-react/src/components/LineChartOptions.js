import moment from 'moment';
const getLineChartOptions = (filteredData = []) => {

    filteredData.forEach(item => {
        item.Date_id = moment(item.Date_id).format('YYYY-MM-DD');
    });
    // Crear un objeto para almacenar las cuentas por fecha y rango en formato tabular
    const countsByDateAndRange = {};

    // Organizar `filteredData` por fecha y rango
    filteredData.forEach(item => {
        const date = item.Date_id; // La fecha
        const range = item.DL_USER_THP_RANGOS || "otro"; // Rango de velocidad de descarga

        // Inicializar si no existe la fecha en `countsByDateAndRange`
        if (!countsByDateAndRange[date]) countsByDateAndRange[date] = { date };

        // Inicializar el rango si no existe para la fecha
        if (!countsByDateAndRange[date][range]) countsByDateAndRange[date][range] = 0;

        // Incrementar la cuenta para ese rango en esa fecha
        countsByDateAndRange[date][range]++;
    });

    // Convertir `countsByDateAndRange` en un array ordenado por fechas
    const dates = Object.keys(countsByDateAndRange).sort();
    
    if (dates.length === 0) {
        //console.log("No se encontraron fechas en los datos filtrados.");
        return {
            title: { text: "Dispersión" },
            xAxis: { type: 'category', data: [] },
            yAxis: { type: 'value', name: 'Número de Celdas' },
            series: []
        };
    }

    const structuredData = dates.map(date => countsByDateAndRange[date]);

    // Obtener los rangos únicos presentes en `filteredData`
    const ranges = Array.from(
        new Set(
            filteredData.map(item => item.DL_USER_THP_RANGOS || "otro")
        )
    );
    console.log("ranges",ranges)
    // Crear las series en base a los rangos
    const series = ranges.map(range => {
        const data = structuredData.map(entry => entry[range] || 0);
        return {
            name: range,
            type: 'line',
            data: data,
            symbol: 'none'
        };
    });

    return {
        title: {
            text: 'Dispersión',
            top: '-1%',
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
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
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                fontSize: 10
            },
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        yAxis: {
            type: 'value',
            name: '# Cells',
            nameLocation: 'center',
            nameGap: 40,
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        series: series,
        legend: {
            type: 'scroll',
            top: '5%',
            data: ranges,
        },
    };
};

export default getLineChartOptions;
