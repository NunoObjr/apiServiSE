const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvaliacaoSchema = new Schema({
    nota: {type: Number, required: true, default:0},
    comentario: {type: String, required: false, lowercase:true},
    servico:{type:Schema.Types.ObjectId, required:false, ref: 'Servico'},
    usuario: {type: Schema.Types.ObjectId, required:false, ref:'users'},
    servicoAgendado:{type:Schema.Types.ObjectId, required:true, ref: 'ServicoAgendado'},
    created: {type: Date, default:Date.now}
}, { collection : 'Avaliacao' })


module.exports = mongoose.model('Avaliacao', AvaliacaoSchema);