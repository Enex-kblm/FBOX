const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.post('/api/register', (req, res) => {
    const { pairingCode, playerName, playerId } = req.body;
    
    if (!pairingCode || !playerName || !playerId) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    
    const dbPath = path.join(__dirname, '..', 'database.json');
    let db = { players: {} };
    
    if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    
    if (db.players[pairingCode]) {
        return res.status(400).json({ error: 'Pairing code sudah digunakan' });
    }
    
    db.players[pairingCode] = {
        playerId: playerId,
        playerName: playerName,
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
    };
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    res.json({ status: 'success', message: 'Registration successful' });
});

app.post('/api/login', (req, res) => {
    const { pairingCode } = req.body;
    
    if (!pairingCode) {
        return res.status(400).json({ error: 'Pairing code required' });
    }
    
    const dbPath = path.join(__dirname, '..', 'database.json');
    let db = { players: {} };
    
    if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    
    if (db.players[pairingCode]) {
        db.players[pairingCode].lastSeen = new Date().toISOString();
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        res.json({ 
            status: 'success', 
            player: db.players[pairingCode]
        });
    } else {
        res.status(401).json({ error: 'Invalid pairing code' });
    }
});

app.get('/api/scripts', (req, res) => {
    try {
        const indexPath = path.join(__dirname, '..', 'scripts', 'index.json');
        const data = fs.readFileSync(indexPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.json({ categories: [] });
    }
});

app.get('/api/scripts/:category/:name', (req, res) => {
    try {
        const { category, name } = req.params;
        const scriptPath = path.join(__dirname, '..', 'scripts', category, `${name}.lua`);
        
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: 'Script not found' });
        }
        
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        res.json({
            id: name,
            name: name,
            category: category,
            script: scriptContent
        });
    } catch (err) {
        res.status(404).json({ error: 'Script not found' });
    }
});

let commands = [];

app.get('/api/command', (req, res) => {
    if (commands.length > 0) {
        res.send(commands.shift());
    } else {
        res.send('null');
    }
});

app.post('/api/command', (req, res) => {
    const { script } = req.body;
    if (script) {
        commands.push(script);
        res.json({ status: 'ok', queueLength: commands.length });
    } else {
        res.status(400).json({ error: 'No script' });
    }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;