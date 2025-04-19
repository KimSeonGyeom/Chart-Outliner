const { spawn } = require('child_process');
const path = require('path');

// Define the path to the Python executable and Flask app
const pythonPath = 'python'; // This assumes python is in your PATH
const flaskApp = path.join('backend', 'app.py');

console.log('Starting Flask backend server...');

// Spawn a new process to run the Flask app
const flaskProcess = spawn(pythonPath, [flaskApp], {
  stdio: 'inherit', // Pipe child's stdio to parent
  env: { ...process.env, FLASK_ENV: 'development', FLASK_PORT: '5000' }
});

// Handle process events
flaskProcess.on('error', (err) => {
  console.error('Failed to start Flask process:', err);
});

flaskProcess.on('close', (code) => {
  console.log(`Flask process exited with code ${code}`);
});

// Handle termination signals to gracefully shut down the Flask server
process.on('SIGINT', () => {
  console.log('Shutting down Flask server...');
  flaskProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down Flask server...');
  flaskProcess.kill('SIGTERM');
}); 