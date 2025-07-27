const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); // ← Add Nodemailer
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Example honeypot services
let services = [
    { id: 'ssh', name: 'SSH', port: 22, status: false },
    { id: 'ftp', name: 'FTP', port: 21, status: false },
    { id: 'http', name: 'HTTP', port: 80, status: false }
];

// Email transporter setup (replace with your credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nupoornikate3@gmail.com',          // ← Your email
        pass: 'wmadrdfuwmcxoydy'              // ← App password (not regular password!)
    }
});

// API to get available services
app.get('/services', (req, res) => {
    res.json(services);
});

// API to toggle service status
app.post('/services/:id/toggle', (req, res) => {
    const service = services.find(s => s.id === req.params.id);
    if (service) {
        service.status = !service.status;
        console.log(`[INFO] ${service.name} toggled to ${service.status ? 'ON' : 'OFF'}`);
        res.json(service);
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// 🌟 API to send email alert
app.post('/send-email-alert', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }

    try {
        await transporter.sendMail({
            from: '"Honeypot Alerts" <your-email@gmail.com>',
            to,
            subject,
            text: message
        });

        console.log(`[EMAIL] Alert sent to ${to}`);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, error: 'Email failed to send' });
    }
});

// Health check/default route
app.get('/', (req, res) => {
    res.send('🚀 Honeypot Backend API is running! Visit /services to see available services.');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
