const express = require('express');
const router = express.Router();
const Servico = require('../model/servico');
const ServicoAgendado = require('../model/servicoAgendado');
const Avaliacao = require('../model/avaliacao')
const Prestador = require('../model/prestadorDeServico')
const Users = require('../model/user');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongoose');


router.post('/avaliar',auth,async (req,res)=>{
    const obj = req.body

    if(!obj.nota || !obj.servicoAgendado) return res.status(400).send({error:"dados insuficientes",body:obj})

    try{
        const avaliacao = await Avaliacao.create(obj)
        const user = await Users.findById(res.locals.autenticacao.id)
        avaliacao.usuario=user
        avaliacao.save()
        const servisoAgendado = await ServicoAgendado.findById(obj.servicoAgendado).populate('avaliacao')
        servisoAgendado.avaliacao.push(avaliacao)
        let nota =0
            for(let i =0; i<servisoAgendado.avaliacao.length; i++){
                nota = nota + servisoAgendado.avaliacao[i].nota
            }
        nota=(nota/servisoAgendado.avaliacao.length)
        servisoAgendado.nota = nota
        servisoAgendado.save()
        const serv = await Servico.findOne({prestador:servisoAgendado.prestador,nome:servisoAgendado.nome}).populate('avaliacao')
        serv.avaliacao.push(avaliacao)
        serv.save()
        let nota2 =0
            for(let i =0; i<serv.avaliacao.length; i++){
                nota2 = nota2 + serv.avaliacao[i].nota
            }
        nota2=(nota2/serv.avaliacao.length)
        serv.nota = nota2
        serv.save()
        const prestadorDeServico =  await Prestador.findById(servisoAgendado.prestador).populate('servicos')
        let nota3 = 0
        for(let i=0;i<prestadorDeServico.servicos.length;i++){
            nota3 = nota3 + prestadorDeServico.servicos[i].nota
        }
        nota3 = (nota3/(prestadorDeServico.servicos.length))
        prestadorDeServico.nota = nota3
        prestadorDeServico.save()
        return res.status(201).send({message:"Avaliacao criada",avaliacao})
    }catch(err){
        console.log(err)
        return res.status(500).send({error:"Nao foi possivel criar uma avaliacao",body:obj,err})
    }
});

module.exports = router;