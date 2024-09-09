const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Directorio donde se servirá el contenido estático
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que sirve la página inicial
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Función para obtener archivos HTML del repositorio
async function obtenerArchivosHTML() {
    const fetch = (await import('node-fetch')).default; // Importación dinámica de node-fetch
    const repoUrl = 'https://api.github.com/repos/Sir-Million/StupidFiles/contents/';  // Sustituye con tu repo

    try {
        const response = await fetch(repoUrl);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('La respuesta de la API no es un array');
        }

        return data.filter(file => file.name.endsWith('.html'));
    } catch (error) {
        console.error('Error al obtener archivos HTML:', error);
        return [];
    }
}

// Ruta para obtener la lista de archivos HTML en formato JSON
app.get('/api/archivos', async (req, res) => {
    const archivos = await obtenerArchivosHTML();
    res.json(archivos);
});

// Ruta dinámica para servir archivos HTML del repositorio
app.get('/:archivo', async (req, res) => {
    const archivoNombre = req.params.archivo + '.html';
    const archivos = await obtenerArchivosHTML();
    const archivo = archivos.find(file => file.name === archivoNombre);

    if (archivo) {
        const fetch = (await import('node-fetch')).default; // Importación dinámica de node-fetch
        const fileResponse = await fetch(archivo.download_url);
        const fileContent = await fileResponse.text();
        res.send(fileContent);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
