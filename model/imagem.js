const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImagemSchema = new Schema({
   name:String,
   size:Number,
   key:String,
   url:String,
   usuario: {type: Schema.Types.ObjectId, required:true, ref:'users'},
   created: {type: Date, default:Date.now}
}, { collection : 'Imagem' })

ImagemSchema.pre('save', function() {
   if(!this.url){
      this.url = `${process.env.APP_URL}/images/${this.key}`
   }
})

module.exports = mongoose.model('Imagem', ImagemSchema);