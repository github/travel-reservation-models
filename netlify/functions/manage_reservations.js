const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    // Try to find the Python script in development and production paths
    let pythonScriptPath = path.join(__dirname, 'manage_reservations', 'handler.py');
    if (!fs.existsSync(pythonScriptPath)) {
      // Check if we're in the Netlify development server path
      const devPath = path.join(process.cwd(), 'netlify', 'functions', 'manage_reservations', 'handler.py');
      if (fs.existsSync(devPath)) {
        pythonScriptPath = devPath;
      }
    }

    if (!fs.existsSync(pythonScriptPath)) {
      console.error('Could not find Python script at:', pythonScriptPath);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuration error: Python script not found' })
      });
      return;
    }

    console.log('Using Python script at:', pythonScriptPath);
    const python = spawn('python3', [pythonScriptPath]);
    
    let dataString = '';
    let errorString = '';

    python.stdin.write(JSON.stringify({ event, context }));
    python.stdin.end();

    python.stdout.on('data', data => {
      dataString += data.toString();
    });

    python.stderr.on('data', data => {
      errorString += data.toString();
      console.error('Python stderr:', errorString);
    });

    python.on('close', code => {
      if (code !== 0) {
        console.error('Python process exited with code:', code);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Python script failed', stderr: errorString })
        });
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (e) {
        console.error('Failed to parse Python output:', e);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Invalid response from Python script',
            stdout: dataString,
            stderr: errorString
          })
        });
      }
    });

    python.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to execute Python script: ' + err.message })
      });
    });
  });
};