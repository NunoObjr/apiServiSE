// Valores sensíveis vêm do arquivo .env (carregado por `dotenv` em app.js).
// Veja .env.example para a lista de variáveis esperadas.
const env = process.env.NODE_ENV || 'dev';

const config = {
    APP_URL: 3000,
    bd_string: process.env.MONGO_URI,
    jwt_pass: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
}

if (!config.bd_string || !config.jwt_pass) {
    console.error('Defina MONGO_URI e JWT_SECRET no arquivo .env (veja .env.example)')
}

console.log(env.toUpperCase())
module.exports = config
