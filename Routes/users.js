const express = require('express');
const router = express.Router();
const Users = require('../model/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const config = require('../config/config')
const ServicoAgendado = require('../model/servicoAgendado')
const Prestador = require("../model/prestadorDeServico")
const Imagem = require("../model/imagem")
const multer = require('multer')
const multerConfig = require('../multerConfig/multer')

const createUserToken = (userId)=>{
    return jwt.sign({ id:userId}, config.jwt_pass, {expiresIn: config.jwt_expires_in})
}

router.get('/', async (req,res)=>{
    try{
        const users = await Users.find({}).populate('foto');
        return res.send(users);

    }catch(error){
        return res.status(500).send({ error: 'Erro de consulta'})
    }
});

router.post('/create', multer(multerConfig).single('foto'),async (req,res)=>{
    const obj = req.body;
    if(!obj.email || !obj.senha || !obj.nome || !obj.cpf || !obj.rua || !obj.telefone) return res.status(400).send({error:"dados insuficientes",body:obj})
    
    try{
        if(await Users.findOne({cpf:obj.cpf})) return res.status(400).send({error:"Usuario ja existe"})

        const user = await  Users.create(obj)
        if(req.file){
            const { originalname: name, size,filename: key, location: url = "" } = req.file;
            const imagem = await Imagem.create({
                name,
                size,
                key,
                url,
                usuario:user
            })
            const usuario = await Users.findById(user._id)
            usuario.foto = imagem
            usuario.save()
         return res.status(201).send({
             nome:usuario.nome,email:usuario.email,
             foto:usuario.foto.url,cpf:usuario.cpf,
             rua:usuario.rua,complemento:usuario.complemento,
             id:usuario._id,telefone:usuario.telefone,
             token:createUserToken(usuario._id)
         })
        }else{
            const usuario = await Users.findById(user._id)
            return res.status(201).send({
                nome:usuario.nome,email:usuario.email,
                cpf:usuario.cpf,rua:usuario.rua,
                complemento:usuario.complemento,
                id:usuario._id,telefone:usuario.telefone,
                token:createUserToken(usuario._id)
            })
        }

    }catch(err){
        return res.status(500).send({error: 'erro ao criar',erro:err})
    }
});

router.put('/update', auth,async (req, res)=>{
    const obj = req.body;
    if(!obj.email || !obj.nome || !obj.cpf || !obj.rua || !obj.telefone) return res.status(400).send({error:"dados insuficientes",body:obj})
    try{
        const usuarioId = res.locals.autenticacao.id
        const user = await Users.findById(usuarioId).populate('foto');
        user.nome = obj.nome;
        user.cpf = obj.cpf;
        user.telefone = obj.telefone;
        user.rua = obj.rua
        user.email = obj.email
        user.complemento = obj.complemento
        if(user.foto !== null && req.file){
            const imagem = await Imagem.findById(user.foto._id)
            imagem.deleteOne()
        }
        if(req.file){
            const { originalname: name, size,filename: key, location: url = "" } = req.file;
            const imagem = await Imagem.create({
                name,
                size,
                key,
                url,
                usuario:user
            })
            user.foto = imagem
        }
        user.save()
        return res.status(200).send({message:"usuario atualizado com sucesso",user})

    }catch(error){
        return res.status(500).send({message:"erro ao buscar usuario",error})
    }
})

router.delete('/delete', async (req,res)=>{
    const {ID} = req.body;
    if(!ID) return res.status(400).send({error:"dados insuficientes",body:req.body})
    
    try{
        const user = await Users.findById(ID)
       if(!user) return res.status(404).send({error:"Usuario nao existe"})

        user.deleteOne()
        return res.status(200).send({message:"Usuario removido",user});

    }catch(err){
        return res.status(500).send({error: 'erro ao criar',erro:err})
    }
});

router.post('/agendar', auth,async (req,res)=>{
    const {nome,preco,prestador,usuario,horario} = req.body;
    if(!nome || !preco || !prestador || !usuario|| !horario) return res.status(400).send({error:"dados insuficientes"})
    try{
        const user = await Users.findById(usuario)
        if(!user) res.status(404).send({error:"Usuario nao encontrado"})
        const prest = await Prestador.findById(prestador)
        if(!prest) res.status(404).send({error:"Prestador nao encontrado"})
        const servicoAgendado = await ServicoAgendado.create(req.body)
        user.agendamentos.push(servicoAgendado)
        user.save()
        return res.status(201).send({res:"Servico agendado",servicoAgendado,user:{nome:user.nome,cpf:user.cpf}})

    }catch(err){
        return res.status(500).send({error: 'erro ao agendar',erro:err})
    }
});

router.get('/agendamentos', auth,async(req,res)=>{
    try{
        const usuarioId = res.locals.autenticacao.id
        const user = await Users.findById(usuarioId).populate({path:'agendamentos',populate:{path:'prestador',populate:{path:'servicos'}}})
        return res.status(200).send({data:user})
    }catch(error){
        return res.status(500).send({error: "houve uma falha de autenticacao"})
    }
})

router.post('/login', async (req,res)=>{
    const {cpf,senha} = req.body;
    if(!cpf || !senha) return res.status(400).send({error:"dados insuficientes"})
    try{
        const user =  await Users.findOne({cpf}).select("+senha").populate('foto')
        if(!user) return res.status(401).send({error: 'dados invalidos'})
        const senha_teste = await bcrypt.compare(senha, user.senha);
        if(!senha_teste) return res.status(401).send({permissao_logar:false,error: 'dados invalidos'})
        user.senha = undefined
        return res.status(200).send({
            permissao_logar:true, nome:user.nome,
            email:user.email,cpf:user.cpf,rua:user.rua,
            complemento:user.complemento,id:user._id,
            telefone:user.telefone,foto:user.foto == null?null:user.foto.url
            ,token:createUserToken(user.id)})
    }catch(err){
        return res.status(500).send({error: 'erro ao buscar'})
    }
})

router.get('/identificarUsuario', auth,async (req,res)=>{
    try{
        const usuarioId = res.locals.autenticacao.id
        const user = await Users.findById(usuarioId)
        return res.send({data:user})
    }catch(error){
        return res.status(500).send({error: "houve uma falha de autenticacao"})
    }

})

module.exports = router;