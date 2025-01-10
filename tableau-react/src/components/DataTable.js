import React, { useMemo } from 'react';
import { useTable, useFilters, useSortBy } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './DataTable.css'; 

const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => (
  <input
    value={filterValue || ''}
    onChange={e => setFilter(e.target.value || undefined)}
    placeholder="Filtrar..."
    style={{ fontSize: '0.6em', padding: '1px', borderRadius: '1px' }}
  />
);

const DataTable = ({ columns, data }) => {
  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFilters,
    useSortBy // Agregando el hook para ordenamiento
  );

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headerNames = columns.map(col => col.Header);
    const csvRows = [
      headerNames.join(','), // Agrega la fila de encabezado
      ...rows.map(row => row.cells.map(cell => cell.value).join(',')), // Agrega las filas de datos
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tabla_datos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%', margin: '2px 0' }}>
      <Button variant="dark" onClick={exportToCSV}>
        Exportar CSV
      </Button>
      <table {...getTableProps()} className="data-table">
        <thead>
          {headerGroups.map((headerGroup, headerIndex) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`header-${headerIndex}`} role="row">
              {headerGroup.headers.map((column, colIndex) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={`header-${headerIndex}-col-${colIndex}`} role="columnheader" colSpan={column.colSpan}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, rowIndex) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`row-${rowIndex}`} role="row" style={{ backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                {row.cells.map((cell, cellIndex) => (
                  <td {...cell.getCellProps()} key={`row-${rowIndex}-cell-${cellIndex}`} role="cell">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
