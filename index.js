const express = require('express')
const app = express()
const secretKey = 'secretKey'
const jwt = require('jsonwebtoken')
const user = 
    {
        name: 'parth',
        password: 'user'
    }
function verifyToken(req,res,next)
{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined')
    {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        req.token = token;
        next();
    }
    else
    {res.send({result: 'Token is not Valid'})}
} 

app.get('/',(req,res)=>{
    console.log('route is- /')
})

app.post('/login',(req,res)=>{
    if(user.name === 'parth')
    {
        const getToken =  jwt.sign({user},secretKey , { expiresIn: '1d' },(err,token) => {
            res.send({token})
        })
    }
    else{res.send({result: 'invalid username'})}
})

app.post('/profile',verifyToken,(req,res)=>{
    jwt.verify(req.token,secretKey,(err, authData) =>{
        if(err)
        {
            res.send({result: "Invalid Token"})
        }
        else
        {
            res.json({
                message: "profile access",
                authData
            })
        }
    })
})

app.listen(3000,()=>{
    console.log('API App is running on 3000')
})