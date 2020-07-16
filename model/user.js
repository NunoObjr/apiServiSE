const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    nome: {type: String, required: true},
    rua: {type: String, required: true},
    complemento: {type: String, required: false},
    telefone: {type: String, required: true},
    email: {type: String, required: true},
    cpf: {type: String, required: true, unique:true},
    senha: {type: String, required:true, select:false},
    agendamentos:[{type:Schema.Types.ObjectId ,required:false, ref: 'ServicoAgendado'}],
    foto:{type:Schema.Types.ObjectId, required:false, ref: 'Imagem',default:null},
    created: {type: Date, default:Date.now}
}, { collection : 'users' })

UserSchema.pre('save',async function(next){
    let user = this;
    if(!user.isModified('senha')) return next();
    user.senha = await bcrypt.hash(user.senha,10);
    return next();
})

module.exports = mongoose.model('users', UserSchema);