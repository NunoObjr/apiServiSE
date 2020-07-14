const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicoSchema = new Schema({
    nome: {type: String, required: true},
    preco: {type: Number, required:true},
    nota:{type:Number, required:false, default:0},
    horario: [{
        hora:{type: String, required:true},
        dia:{type: String, required:true}
    }],
    avaliacao: [{type: Schema.Types.ObjectId, required:false, ref:'Avaliacao'}],
    prestador: {type: Schema.Types.ObjectId, required:true, ref:'Prestador'},
    created: {type: Date, default:Date.now}
}, { collection : 'Servico' })

module.exports = mongoose.model('Servico', ServicoSchema);