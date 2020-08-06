const express = require('express');
const router = express.Router();
const Prestador = require('../model/prestadorDeServico')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const config = require('../config/config')
const Imagem = require("../model/imagem")
const multer = require('multer')
const validarCpf = require('validar-cpf');
const multerConfig = require('../multerConfig/multer')

const createUserToken = (userId)=>{
    return jwt.sign({ id:userId}, config.jwt_pass, {expiresIn: config.jwt_expires_in})
}

router.get('/', async (req,res)=>{
    try{
        const prestador = await Prestador.find().populate({path:'servicos',populate:{path:'avaliacao'}});
        return res.status(200).send(prestador);

    }catch(error){
        return res.status(500).send({ error: 'Erro de consulta', erro:error})
    }
});

router.put('/updateCpf', auth,async (req, res)=>{
    const {cpf, senha} = req.body
    if(!cpf) return res.status(400).send({error:"dados insuficientes",body:req.body})
    if(!(validarCpf(cpf))) return res.status(400).send("Cpf invalido")
    try{
        if(await Prestador.findOne({cpf:cpf})) return res.status(400).send({error:"Prestador ja existe"})
        const prestadorID = res.locals.autenticacao.id
        const prestador = await Prestador.findById(prestadorID).select("+senha")
        const senha_teste = await bcrypt.compare(senha, prestador.senha);
        if(!senha_teste) return res.status(500).send({message:"Senha incorreta"})
        prestador.cpf = cpf
        prestador.save()
        prestador.senha = undefined
        return res.status(200).send({message:"prestador atualizado com sucesso",prestador})

    }catch(error){
        return res.status(500).send({message:"erro ao buscar prestador",error})
    }
})
router.put('/updatePass', auth,async (req, res)=>{
    const {senhaAntiga, novaSenha} = req.body
    if(!senhaAntiga || !novaSenha) return res.status(400).send({error:"dados insuficientes",body:req.body})
    try{
        const prestadorID = res.locals.autenticacao.id
        const prestador = await Prestador.findById(prestadorID).select("+senha")
        const senha_teste = await bcrypt.compare(senhaAntiga, prestador.senha);
        if(!senha_teste) return res.status(500).send({message:"Senha incorreta"})
        prestador.senha = novaSenha
        prestador.save()
        return res.status(200).send({message:"Senha atualizada com sucesso"})

    }catch(error){
        return res.status(500).send({message:"erro ao buscar prestador",error})
    }
})
router.post('/create',multer(multerConfig).single('foto'), async (req,res)=>{
    const obj = req.body;
    console.log(req.file)
    console.log(obj)
    console.log('')
    if(!obj.email || !obj.senha || !obj.cep || !obj.nome || !obj.cpf || !obj.rua || !obj.telefone || !req.file) 
        return res.status(400).send({error:"dados insuficientes",body:obj})
    if(!(validarCpf(obj.cpf))) return res.status(400).send("Cpf invalido")
    try{
       if(await Prestador.findOne({cpf:obj.cpf})) return res.status(400).send({error:"Prestador ja existe"})
        
        const prestador = await  Prestador.create(req.body)
        const { originalname: name, size,filename: key, location: url = "" } = req.file;
            const imagem = await Imagem.create({
                name,
                size,
                key,
                url,
                usuario:prestador
            })
            const usuario = await Prestador.findById(prestador._id)
            usuario.foto = imagem
            usuario.save()
         return res.status(201).send({
             nome:usuario.nome,email:usuario.email,
             foto:usuario.foto.url,cpf:usuario.cpf,
             rua:usuario.rua,complemento:usuario.complemento,
             id:usuario._id,telefone:usuario.telefone,
             token:createUserToken(usuario._id)
         })

    }catch(err){
        return res.status(500).send({error: 'erro ao buscar'})
    }
});


router.put('/update', auth,multer(multerConfig).single('foto'),async (req, res)=>{
    const obj = req.body;
    if(!obj.email || !obj.nome || !obj.cep  || !obj.senha || !obj.rua || !obj.telefone || !req.file) return res.status(400).send({error:"dados insuficientes",body:obj})
    try{
        const prestadorId = res.locals.autenticacao.id
        const user = await Prestador.findById(prestadorId).select("+senha").populate('foto');
        const senha_teste = await bcrypt.compare(obj.senha, user.senha);
        if(!senha_teste) return res.status(500).send({message:"Senha incorreta"})
        user.nome = obj.nome;
        user.telefone = obj.telefone;
        user.rua = obj.rua
        user.email = obj.email
        user.complemento = obj.complemento
        user.cep = obj.cep
        user.save()
        if(user.foto.name !== req.file.name && user.foto.size !== req.file.size){
            const image = await Imagem.findById(user.foto._id)
            image.deleteOne()
            const { originalname: name, size,filename: key, location: url = "" } = req.file;
            const imagem = await Imagem.create({
                name,
                size,
                key,
                url,
                usuario:user._id
            })
            const usuario = await Prestador.findById(prestadorId);
            usuario.foto = imagem
            usuario.save()
            return res.status(200).send({
                message:"usuario atualizado com sucesso",
                nome:usuario.nome,email:usuario.email,
                foto:usuario.foto.url,cpf:usuario.cpf,
                rua:usuario.rua,complemento:usuario.complemento,
                id:usuario._id,telefone:usuario.telefone,cep:usuario.cep
            })
        }
        const usuario = await Prestador.findById(usuarioId);
        return res.status(200).send({
            nome:usuario.nome,email:usuario.email,
            foto:usuario.foto.url,cpf:usuario.cpf,
            rua:usuario.rua,complemento:usuario.complemento,
            id:usuario._id,telefone:usuario.telefone,cep:usuario.cep
        })

    }catch(error){
        return res.status(500).send({message:"erro ao buscar usuario",error})
    }
})

router.post('/login', async (req,res)=>{
    const {cpf,senha} = req.body;
    if(!cpf || !senha) return res.status(400).send({error:"dados insuficientes"})
    try{
        const user =  await Prestador.findOne({cpf}).select("+senha")
        if(!user) return res.send({error: 'dados invalidos'})
        const senha_teste = await bcrypt.compare(senha, user.senha);
        if(!senha_teste) return res.status(401).send({permissao_logar:false,error: 'dados invalidos'})
        user.senha = undefined
        return res.send({permissao_logar:true, user,token:createUserToken(user._id)})
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

router.delete('/delete', async (req,res)=>{
    const {ID} = req.body;
    if(!ID) return res.status(400).send({error:"dados insuficientes",body:req.body})
    
    try{
        const user = await Prestador.findById(ID)
       if(!user) return res.status(404).send({error:"Prestador nao existe"})

        user.deleteOne()
        return res.status(200).send({message:"Prestador removido",user});

    }catch(err){
        return res.status(500).send({error: 'erro ao criar',erro:err})
    }
});
router.post('/login', async (req,res)=>{
    const {cpf,senha} = req.body;
    if(!cpf || !senha) return res.status(400).send({error:"dados insuficientes"})
    try{
        const user =  await Prestador.findOne({cpf}).populate('foto').select("+senha")
        if(!user) return res.status(401).send({error: 'dados invalidos'})
        const senha_teste = await bcrypt.compare(senha, user.senha);
        if(!senha_teste) return res.status(401).send({permissao_logar:false,error: 'dados invalidos'})
        return res.status(200).send({
            permissao_logar:true, nome:user.nome,
            email:user.email,cpf:user.cpf,rua:user.rua,
            complemento:user.complemento,id:user._id,
            telefone:user.telefone,foto:user.foto == null?null:user.foto.url,
            cep:user.cep
            ,token:createUserToken(user.id)})
    }catch(err){
        return res.status(500).send({error: 'erro ao buscar'})
    }
})

module.exports = router;