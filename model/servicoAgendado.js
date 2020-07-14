const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicoAgendadoSchema = new Schema({
    nome: {type: String, required: true},
    preco: {type: Number, required:true},
    nota:{type:Number, required:false, default:0},
    horario: [{
        hora:{type: String, required:true},
        dia:{type: String, required:true}
    }],
    usuario: {type: Schema.Types.ObjectId, required:true, ref:'users'},
    prestador: {type: Schema.Types.ObjectId, required:true, ref:'Prestador'},
    avaliacao: [{type: Schema.Types.ObjectId, required:false, ref:'Avaliacao'}],
    status:{type:String, required:false, default:"Pendente"},
    created: {type: Date, default:Date.now}
}, { collection : 'ServicoAgendado' })

module.exports = mongoose.model('ServicoAgendado', ServicoAgendadoSchema);