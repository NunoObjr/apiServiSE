const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

router.get('/', auth,(req,res)=>{
    return res.send({message:'GET raiz'});
});

router.post('/',(req,res)=>{
    return res.send({message:'POST raiz'});
});

module.exports = router;