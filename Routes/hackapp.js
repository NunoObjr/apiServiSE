const express = require('express');
const router = express.Router();
const config = require('../config/config')
const multer = require('multer')
const multerConfig = require('../multerConfig/multer')
const Users = require('../model/user');

router.post('/create', multer(multerConfig).single('foto'),async (req,res)=>{
    try{
        const user = await Users.findOne({cpf:'941.274.870-11'})
        const { originalname: name, size,filename: key, location: url = "" } = req.file;
            const imagem = await Imagem.create({
                name,
                size,
                key,
                url,
                usuario:user
            })
       return res.send(imagem)
    }catch(err){
        console.log(err)
        return res.send(err)
    }
})


module.exports = router;