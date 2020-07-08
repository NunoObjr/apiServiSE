const express = require('express');
const router = express.Router();
const Prestador = require('../model/prestadorDeServico')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const config = require('../config/config')

const createUserToken = (userId)=>{
    return jwt.sign({ id:userId}, 'admin123', {expiresIn: '7d'})
}

router.get('/', async (req,res)=>{
    try{
        const prestador = await Prestador.find().populate('servicos');
        return res.status(200).send(prestador);

    }catch(error){
        return res.status(500).send({ error: 'Erro de consulta', erro:error})
    }
});

router.post('/create', async (req,res)=>{
    const obj = req.body;
    if(!obj.email || !obj.senha || !obj.nome || !obj.cpf || !obj.rua || !obj.telefone) 
        return res.status(400).send({error:"dados insuficientes",body:obj})
    
    try{
       if(await Prestador.findOne({cpf:obj.cpf})) return res.status(400).send({error:"Usuario ja existe"})

        const user = await  Prestador.create(req.body)
        user.senha = undefined;
        return res.status(201).send({user,token:createUserToken(user.id)});

    }catch(err){
        return res.status(500).send({error: 'erro ao buscar'})
    }
});

router.post('/login', async (req,res)=>{
    const {cpf,senha} = req.body;
    if(!cpf || !senha) return res.status(400).send({error:"dados insuficientes"})
    try{
        const user =  await Prestador.findOne({cpf}).select("+senha")
        if(!user) return res.send({error: 'dados invalidos'})
        const senha_teste = await bcrypt.compare(senha, user.senha);
        if(!senha_teste) return res.status(401).send({permissao_logar:false,error: 'dados invalidos'})
        user.senha = undefined
        return res.send({permissao_logar:true, user,token:createUserToken(user.id)})
    }catch(err){
        return res.status(500).send({error: 'erro ao buscar'})
    }
})

router.get('/identificarUsuario', auth,async (req,res)=>{
    try{
        const usuarioId = res.locals.autenticacao.id
        const user = await Prestador.findById(usuarioId)
        return res.send({data:user})
    }catch(error){
        return res.status(500).send({error: "houve uma falha de autenticacao"})
    }

})

module.exports = router;