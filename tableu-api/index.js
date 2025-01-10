const express = require('express');
const app = express();
const port = 3010; // O el puerto que prefieras
const queriesRouter = require('./routes/queries'); // Ruta correcta

app.use(express.json());
app.use('/api', queriesRouter); // Usar las rutas de queries

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});