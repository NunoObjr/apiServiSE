const env = process.env.NODE_ENV || 'dev';

const config = ()=>{
    switch (env){
        case 'dev':
            return{
                bd_string:'mongodb+srv://nunoobjr:Junior123@servise-zrnqe.mongodb.net/<dbname>?retryWrites=true&w=majority',
                jwt_pass:'admin123',
                jwt_expires_in:'7d'
            }
        case 'hml':
            return{
                bd_string:'mongodb+srv://nunoobjr:Junior123@servise-zrnqe.mongodb.net/<dbname>?retryWrites=true&w=majority',
                
            }
        case 'prod':
            return{
                bd_string:'mongodb+srv://nunoobjr:Junior123@servise-zrnqe.mongodb.net/<dbname>?retryWrites=true&w=majority',
                
        }
    }
}

console.log(env.toUpperCase())
module.exports = config()