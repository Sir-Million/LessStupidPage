const express = require('express');
const fetch = require('node-fetch'); // Para hacer peticiones a la API de GitHub
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Directorio donde se servirá el contenido estático (index.html)
app.use(express.static(path.join(__dirname, 'views')));

// Ruta principal que sirve la página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Función para obtener archivos HTML del repositorio
async function obtenerArchivosHTML() {
    const repoUrl = 'https://api.github.com/repos/{usuario}/{repositorio}/contents/';  // Sustituye con tu repo
    const response = await fetch(repoUrl);
    const data = await response.json();

    // Filtrar los archivos que terminen en .html
    return data.filter(file => file.name.endsWith('.html'));
}

// Función para crear rutas dinámicas basadas en los archivos HTML
async function crearRutas() {
    const archivos = await obtenerArchivosHTML();

    archivos.forEach(archivo => {
        const ruta = `/${archivo.name.replace('.html', '')}`;
        app.get(ruta, async (req, res) => {
            const fileUrl = archivo.download_url;
            const fileResponse = await fetch(fileUrl);
            const fileContent = await fileResponse.text();
            res.send(fileContent);
        });
    });
}

// Llamar a la función para generar las rutas dinámicas
crearRutas();

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
