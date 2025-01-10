const getHistogramOptions = (filteredData = []) => {
    // Crear un objeto vacío para las cuentas por rango y banda
    const countsByRangeAndBand = {};

    // Construir las cuentas basadas en `filteredData`
    filteredData.forEach(item => {
        const band = item.band;
        const range = item.DL_USER_THP_RANGOS || "otro";

        // Inicializar el rango y la banda si no existen en `countsByRangeAndBand`
        if (!countsByRangeAndBand[range]) countsByRangeAndBand[range] = {};
        if (!countsByRangeAndBand[range][band]) countsByRangeAndBand[range][band] = 0;

        // Incrementar la cuenta para el rango y la banda específicos
        countsByRangeAndBand[range][band]++;
    });


    // Obtener los rangos (ejes X) a partir de las llaves de `countsByRangeAndBand`
    const ranges = Object.keys(countsByRangeAndBand);

    // Asegurarse de obtener las bandas únicas presentes en `filteredData`
    const bands = Array.from(
        new Set(
            filteredData.map(item => item.band)
        )
    );

    // Crear las series en base a `bands` y `ranges`
    
    const series = bands.map(band => {
        const data = ranges.map(range => countsByRangeAndBand[range][band] || 0);
        return {
            name: band,
            type: 'bar',
            data: data,
        };
    }).filter(serie => serie.data.some(count => count > 0)); // Filtrar series vacías

    return {
        title: {
            text: 'Histograma Dispersion',
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
            
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
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
            data: ranges,
            axisLabel: {
                fontSize: 9,
                rotate: 45 
            },
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial',  // Título del eje x en negrita
            }
        },
        yAxis: {
            type: 'value',
            name: '# Recuento de celdas',
            nameLocation: 'center',
            nameGap: 40,
            nameTextStyle: {
                fontWeight: 'bold',
                fontFamily: 'Arial', // Título del eje x en negrita
            }
        },
        series: series,
        // Asegurarse de que legend solo contenga las bandas actuales de `filteredData`
        legend: {
            type: 'scroll',
            top: '5%',
            data: bands,  // Usa `bands` filtradas en lugar de `[...bands]`
        },
    };
};

export default getHistogramOptions;
