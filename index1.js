const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3002;
app.use(express.json());

function generateAccessToken(user) {
    const payload = {
        id: user.id,
        email: user.email
    };
    const secret = 'your-secret-key';
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token) {
    const secret = 'your-secret-key';
    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }
    const result = verifyAccessToken(token);
    if (!result.success) {
        return res.status(403).json({ error: result.error });
    }
    req.user = result.data;
    next();
}

function generateRefreshToken(user) {
    const payload = {
        id: user.id,
        email: user.email
    };
    const secret = 'your-refresh-token-secret';
    const options = { expiresIn: '7d' };
    return jwt.sign(payload, secret, options);
}

function verifyRefreshToken(token) {
    const secret = 'your-refresh-token-secret';
    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

app.post('/token/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    const result = verifyRefreshToken(refreshToken);
    if (!result.success) {
        return res.status(403).json({ error: result.error });
    }
    const user = result.data;
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
});

const sampleUser = {
    id: 1,
    email: 'user@example.com',
    password: 'password123'
};

app.post('/token', (req, res) => {
    const { email, password } = req.body;
    if (email === sampleUser.email && password === sampleUser.password) {
        const accessToken = generateAccessToken(sampleUser);
        //const refreshToken = generateRefreshToken(sampleUser);
        res.json({ accessToken }); //refreshToken
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.user });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});