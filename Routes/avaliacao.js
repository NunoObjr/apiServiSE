const express = require('express');
const router = express.Router();
const Servico = require('../model/servico');
const ServicoAgendado = require('../model/servicoAgendado');
const Avaliacao = require('../model/avaliacao')
const Prestador = require('../model/prestadorDeServico')
const Users = require('../model/user');
const auth = require('../middleware/auth')

router.post('/avaliar',auth,async (req,res)=>{
    const obj = req.body

    if(!obj.nota || !obj.servicoAgendado) return res.status(400).send({error:"dados insuficientes",body:obj})

    try{
        const avaliacao = await Avaliacao.create(obj)
        const user = await Users.findById(res.locals.autenticacao.id)
        avaliacao.usuario=user
        avaliacao.save()
        const servicoAgendado = await ServicoAgendado.findById(obj.servicoAgendado)
        servicoAgendado.avaliacao.push(avaliacao)
        let nota =0
            for(let i =0; i<servicoAgendado.avaliacao.length; i++){
                nota = nota + servicoAgendado.avaliacao[i].nota
            }
        nota=(nota/servicoAgendado.avaliacao.length)
        servicoAgendado.nota = nota
        servicoAgendado.save()
        const serviso = await Servico.find({nome:servicoAgendado.nome})
        serviso[0].avaliacao.push(avaliacao)
        let nota2 =0
            for(let i =0; i<serviso[0].avaliacao.length; i++){
                nota2 = nota2 + serviso[0].avaliacao[i].nota
            }
        nota2=(nota2/serviso[0].avaliacao.length)
        serviso[0].nota = avaliacao.nota
        serviso[0].save()
        const prestadorDeServico =  await Prestador.findById(servicoAgendado.prestador).populate({path:'servicos',populate:{path:'avaliacao'}})
        const servicos = prestadorDeServico.servicos
        let nota3 = 0
        for(let i=0;i<servicos.length;i++){
            let notaAvaliacoes = 0
            for(let j=0; j<servicos[i].avaliacao.length;j++){
                notaAvaliacoes = notaAvaliacoes + servicos[i].avaliacao[j].nota
            }
            nota3 = nota3 + (notaAvaliacoes/(servicos[i].avaliacao.length))
        }
        nota3 = (nota3/(servicos.length))
        prestadorDeServico.nota = nota3
        prestadorDeServico.save()
        return res.status(201).send({message:"Avaliacao criada",avaliacao})
    }catch(err){
        return res.status(500).send({error:"Nao foi possivel criar uma avaliacao",body:obj,err})
    }
});

module.exports = router;