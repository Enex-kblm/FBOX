const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

let players = {};

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.get('/api/loader', (req, res) => {
    const loaderPath = path.join(__dirname, 'loader.js');
    
    if (fs.existsSync(loaderPath)) {
        const loaderContent = fs.readFileSync(loaderPath, 'utf8');
        const scriptMatch = loaderContent.match(/const loaderScript = `([\s\S]*)`;/);
        
        if (scriptMatch && scriptMatch[1]) {
            res.setHeader('Content-Type', 'text/plain');
            res.send(scriptMatch[1]);
        } else {
            res.status(500).send('-- Error loading script');
        }
    } else {
        res.status(404).send('-- Loader not found');
    }
});

app.post('/api/register', (req, res) => {
    try {
        const { pairingCode, playerName, playerId } = req.body;
        
        if (!pairingCode || !playerName || !playerId) {
            return res.status(400).json({ 
                error: 'Data tidak lengkap',
                received: { pairingCode, playerName, playerId }
            });
        }

        if (players[pairingCode]) {
            return res.status(400).json({ 
                error: 'Pairing code sudah digunakan',
                pairingCode: pairingCode 
            });
        }

        players[pairingCode] = {
            playerId: String(playerId),
            playerName: String(playerName),
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };

        res.json({ 
            status: 'success', 
            message: 'Registration successful',
            pairingCode: pairingCode 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Internal Server Error',
            detail: error.message 
        });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { pairingCode } = req.body;
        
        console.log('LOGIN ATTEMPT:', pairingCode);
        console.log('CURRENT PLAYERS:', JSON.stringify(players));
        
        if (!pairingCode) {
            return res.status(400).json({ error: 'Pairing code required' });
        }

        if (players[pairingCode]) {
            console.log('LOGIN SUCCESS:', pairingCode);
            
            players[pairingCode].lastSeen = new Date().toISOString();
            
            return res.json({ 
                status: 'success', 
                player: players[pairingCode] 
            });
        } else {
            console.log('LOGIN FAILED - CODE NOT FOUND:', pairingCode);
            console.log('Available codes:', Object.keys(players));
            return res.status(401).json({ error: 'Invalid pairing code' });
        }
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/players', (req, res) => {
    try {
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/scripts', (req, res) => {
    try {
        const indexPath = path.join(__dirname, '..', 'scripts', 'index.json');
        
        if (!fs.existsSync(indexPath)) {
            return res.json({ categories: [] });
        }
        
        const data = fs.readFileSync(indexPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.json({ categories: [] });
    }
});

app.get('/api/scripts/:category/:name', (req, res) => {
    try {
        const { category, name } = req.params;
        const safeCategory = path.basename(category);
        const safeName = path.basename(name);
        const scriptPath = path.join(__dirname, '..', 'scripts', safeCategory, `${safeName}.lua`);
        
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: 'Script not found' });
        }
        
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        res.json({
            id: safeName,
            name: safeName,
            category: safeCategory,
            script: scriptContent
        });
    } catch (err) {
        res.status(404).json({ error: 'Script not found' });
    }
});

let commands = [];

app.get('/api/command', (req, res) => {
    try {
        if (commands.length > 0) {
            res.send(commands.shift());
        } else {
            res.send('null');
        }
    } catch (err) {
        res.send('null');
    }
});

app.post('/api/command', (req, res) => {
    try {
        const { script } = req.body;
        if (script && typeof script === 'string' && script.trim().length > 0) {
            commands.push(script);
            res.json({ status: 'ok', queueLength: commands.length });
        } else {
            res.status(400).json({ error: 'No script provided' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/queue', (req, res) => {
    try {
        commands = [];
        res.json({ status: 'cleared', message: 'Queue cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/queue/length', (req, res) => {
    try {
        res.json({ length: commands.length });
    } catch (err) {
        res.json({ length: 0 });
    }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

module.exports = app;