const express = require('express');
const router = express.Router();
const Servico = require('../model/servico');
const Prestador = require('../model/prestadorDeServico')
const bcrypt = require('bcrypt')

router.get('/', async (req,res)=>{
    try{
        const servicos = await Servico.find().populate('avaliacao');
        return res.send(servicos);

    }catch(error){
        return res.status(500).send({ error: 'Erro de consulta', message:error})
    }
});

router.post('/update', async (req,res)=>{
    const {ID, action} = req.body
    if(!ID || !action) return res.status(400).send("Dados insuficientes")
    try{
        const servico = await Servico.findById(ID)
        if(action === 'Recusar'){
            servico.deleteOne()
            return res.status(200).send({message:"Servico recusado"});
        }else if(action === 'Aceitar'){
            servico.status = 'Agendado'
            servico.save()
            return res.status(200).send({message:"Servico agendado"});
        }else if(action === 'Concluir'){
            servico.status = 'Concluido'
            servico.save()
            return res.status(200).send({message:"Servico concluido"});
        }else if(action === 'Cancelar'){
            servico.deleteOne()
            return res.status(200).send({message:"Servico cancelado"});
        }
    }catch(err){
        return res.status(500).send({error: 'Erro na consultar',message:err})
    }
})

router.post('/create', async (req,res)=>{
    const obj = req.body;
    if(!obj.nome || !obj.preco || !obj.prestador || !obj.horario || !obj.senha) return res.status(400).send({error:"dados insuficientes",body:obj})
    
    try{
       const prestadorDeServico = await Prestador.findById(obj.prestador).select("+senha")
        if(!prestadorDeServico) return res.status(400).send({error:"Prestador de servico nao encontrado"})
        if(await Servico.findOne({nome:obj.nome,prestador:obj.prestador})) return res.status(400).send({error:"Servico ja existe"})
        const senha_teste = await bcrypt.compare(obj.senha, prestadorDeServico.senha);
        if(!senha_teste) return res.status(500).send({message:"Senha incorreta"})
        console.log('ate la')
        const newServico = await Servico.create(obj)
        console.log('kk')
        console.log(obj)
        prestadorDeServico.servicos.push(newServico)
        prestadorDeServico.save()
        return res.status(201).send({newServico});

    }catch(err){
        return res.status(500).send({error: 'erro ao criar',erro:err})
    }
});


router.delete('/delete', async (req,res)=>{
    const array = req.body.servicos
    if(!array) return res.status(400).send("Dados insuficientes")
    try{
        for (const id of array) {
            const serv = await Servico.findById(id)
            const prest = await Prestador.findById(serv.prestador)
            var novoVetor = []
            for(let i=0; i<prest.servicos.length;i++){
                if(!serv._id.equals(prest.servicos[i])) novoVetor.push(prest.servicos[i])
            }
            serv.deleteOne()
            prest.servicos = novoVetor
            prest.save()
        }
        return res.status(200).send({menssagem:"servicos deletados"})
    }catch(err){
        return res.status(500).send({error: 'erro ao buscar',erro:err})
    }
   
    
});

module.exports = router;