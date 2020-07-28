const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const Servico = require('./servico')

const PrestadorSchema = new Schema({
    nome: {type: String, required: true},
    email: {type: String, required: true},
    rua: {type: String, required: true},
    foto: {type: String, required: false},
    complemento: {type: String, required: false},
    cep:{type: String, required:true},
    telefone: {type: String, required: true},
    cpf: {type: String, required: true, unique:true},
    rendaGerada:{type:Number, required:false, default:0},
    diaDoPagamentoSistema:{type:Date, default:Date.now},
    servicosAgendados:{type: Number, required:false, default:0},
    servicosConcluidos:{type: Number, required:false, default:0},
    servicosCanceladosFornecedor:{type: Number, required:false, default:0},
    servicosCanceladosUsuario:{type:Number, required:false, default:0},
    senha: {type: String, required:true, select:false},
    servicos:[{type:Schema.Types.ObjectId ,required:false, ref: 'Servico'}],
    nota:{type: Number, required:false, default:0},
    created: {type: Date, default:Date.now}
}, { collection : 'Prestador' })

PrestadorSchema.pre('save',async function(next){
    let user = this;
    if(!user.isModified('senha')) return next();
    user.senha = await bcrypt.hash(user.senha,10);
    return next();
})

module.exports = mongoose.model('Prestador', PrestadorSchema);