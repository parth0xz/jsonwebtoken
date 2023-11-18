const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;
const users = [];


app.use(express.json());
app.listen(port, () => {
    console.log(`app running on http://127.0.0.1:${port}`)
});
app.post('/register', async (req, res) => {
    try {
        if (users.some(user => user.email === req.body.email)) {
            const err = new Error('Email Taken!')
            err.status = 400;
            throw err;
        }
        const user = {
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 12),
        }
        users.push(user);
        res.status(201).json({
            status: 'success',
            message: 'User Registered!',
            data: {
                user: {
                    email: user.email,
                },
            },
        });
    } catch (err) {
        res.status(err.status).json({
            status: 'fail',
            message: err.message,
        });
    }
});



app.post('/login', async (req, res) => {
    try {
        const user = users.find(user => user.email === req.body.email);
        if (!user) {
            const err = new Error('User Not Found!')
            err.status = 400;
            throw err;
        } else if (await bcrypt.compare(req.body.password, user.password)) {
            const tokenPayload = {
                email: user.email,
            };
            const accessToken = jwt.sign(tokenPayload, 'SECRET');
            res.status(201).json({
                status: 'success',
                message: 'User Logged In!',
                data: {
                    accessToken,
                },
            });
        } else {
            const err = new Error('Wrong Password!');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        res.status(err.status).json({
            status: 'fail',
            message: err.message,
        });
    }
});

const auth = require('./authenticate');

app.get('/profile', auth, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Logged In User Information.',
        data: {
            user: {
                email: req.user.email,
            },
        },
    });
});
