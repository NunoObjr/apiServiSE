const env = process.env.NODE_ENV || 'dev';

const config = {
    APP_URL:3000,
    bd_string:'mongodb+srv://nunoobjr:Junior123@servise-zrnqe.mongodb.net/<dbname>?retryWrites=true&w=majority',
    jwt_pass:'admin123',
    jwt_expires_in:'7d'
}

console.log(env.toUpperCase())
module.exports = config()