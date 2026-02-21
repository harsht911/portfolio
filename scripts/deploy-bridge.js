const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Port for the bridge service
const PORT = 9000;

const server = http.createServer((req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/deploy') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { version, notes } = JSON.parse(body);
            console.log(`[Bridge] Starting automated deployment for version ${version}...`);

            try {
                // 1. Update package.json version
                const pkgPath = path.resolve(__dirname, '../package.json');
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                pkg.version = version;
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
                console.log(`[Bridge] Updated package.json to ${version}`);

                // 2. Run Build and Deploy
                // We use 'npm run deploy' which already has build and firebase deploy
                const deployCmd = 'npm run deploy';

                exec(deployCmd, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[Bridge] Deploy Error: ${error.message}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                        return;
                    }

                    console.log(`[Bridge] Deployment Successful!\n${stdout}`);

                    // 3. Create a record in Firestore (optional but good for history)
                    // Note: We'll let the Admin CMS handle the record creation after the bridge returns success
                    // to avoid complex Firebase Admin SDK setup in this tiny script.

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Deployed successfully' }));
                });

            } catch (err) {
                console.error(`[Bridge] System Error: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `🚀 Deployment Bridge is running on http://localhost:${PORT}`);
    console.log(`\x1b[90m%s\x1b[0m`, `Leave this running to allow CMS-triggered deployments.`);
});
