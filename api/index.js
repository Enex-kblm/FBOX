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

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.post('/api/register', async (req, res) => {
    try {
        const { pairingCode, playerName, playerId } = req.body;
        
        if (!pairingCode || !playerName || !playerId) {
            return res.status(400).json({ 
                error: 'Data tidak lengkap',
                received: { pairingCode, playerName, playerId }
            });
        }

        const dbPath = path.join(__dirname, '..', 'database.json');
        console.log('📁 Database path:', dbPath);

        let db = { players: {} };
        
        if (fs.existsSync(dbPath)) {
            try {
                const data = fs.readFileSync(dbPath, 'utf8');
                db = JSON.parse(data);
                console.log('✅ Database berhasil dibaca');
            } catch (readError) {
                console.error('❌ Gagal baca database:', readError);
                db = { players: {} };
            }
        } else {
            console.log('📁 Database belum ada, akan dibuat baru');
        }

        if (db.players[pairingCode]) {
            return res.status(400).json({ 
                error: 'Pairing code sudah digunakan',
                pairingCode: pairingCode
            });
        }

        db.players[pairingCode] = {
            playerId: String(playerId),
            playerName: String(playerName),
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };

        try {
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            console.log('✅ Player berhasil disimpan:', pairingCode);
        } catch (writeError) {
            console.error('❌ Gagal menulis database:', writeError);
            return res.status(500).json({ 
                error: 'Gagal menyimpan data',
                detail: writeError.message 
            });
        }

        res.json({ 
            status: 'success', 
            message: 'Registration successful',
            pairingCode: pairingCode
        });

    } catch (error) {
        console.error('🔥 UNHANDLED ERROR:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            detail: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { pairingCode } = req.body;
        
        if (!pairingCode) {
            return res.status(400).json({ error: 'Pairing code required' });
        }
        
        const dbPath = path.join(__dirname, '..', 'database.json');
        let db = { players: {} };
        
        if (fs.existsSync(dbPath)) {
            try {
                const data = fs.readFileSync(dbPath, 'utf8');
                db = JSON.parse(data);
            } catch (readError) {
                console.error('❌ Gagal baca database:', readError);
                return res.status(500).json({ error: 'Database error' });
            }
        }
        
        if (db.players[pairingCode]) {
            db.players[pairingCode].lastSeen = new Date().toISOString();
            
            try {
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            } catch (writeError) {
                console.error('❌ Gagal update last seen:', writeError);
            }
            
            res.json({ 
                status: 'success', 
                player: db.players[pairingCode]
            });
        } else {
            res.status(401).json({ error: 'Invalid pairing code' });
        }
    } catch (error) {
        console.error('🔥 Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/players', (req, res) => {
    try {
        const dbPath = path.join(__dirname, '..', 'database.json');
        
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            const db = JSON.parse(data);
            res.json(db.players || {});
        } else {
            res.json({});
        }
    } catch (err) {
        console.error('❌ Error get players:', err);
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
        console.error('❌ Error loading scripts:', err);
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
        console.error('❌ Error loading script:', err);
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
        console.error('❌ Error get command:', err);
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
        console.error('❌ Error post command:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/queue', (req, res) => {
    try {
        commands = [];
        res.json({ status: 'cleared', message: 'Queue cleared' });
    } catch (err) {
        console.error('❌ Error clear queue:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/queue/length', (req, res) => {
    try {
        res.json({ length: commands.length });
    } catch (err) {
        console.error('❌ Error get queue length:', err);
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