const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const s3 = new aws.S3();

const ImagemSchema = new Schema({
   name:String,
   size:Number,
   key:String,
   url:String,
   usuario: {type: Schema.Types.ObjectId, required:false, ref:'users'},
   created: {type: Date, default:Date.now}
}, { collection : 'Imagem' })

ImagemSchema.pre('save', function() {
   if(!this.url){
      this.url = `${process.env.APP_URL}/images/${this.key}`
   }
})

ImagemSchema.pre("remove", function() {
   if (process.env.STORAGE_TYPE === "s3") {
     return s3
       .deleteObject({
         Bucket: process.env.BUCKET_NAME,
         Key: this.key
       })
       .promise()
       .then(response => {
         console.log(response.status);
       })
       .catch(response => {
         console.log(response.status);
       });
   } else {
     return promisify(fs.unlink)(
       path.resolve(__dirname, "..", "uploads/", this.key)
     );
   }
 });

module.exports = mongoose.model('Imagem', ImagemSchema);