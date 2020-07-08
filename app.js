const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config')

const url = config.bd_string
const options = { poolSize: 5, useNewUrlParser:true, useUnifiedTopology:true };

mongoose.connect(url, options);
mongoose.set('useCreateIndex', true);

mongoose.connection.on('error',(err)=>{
    console.log('Erro '+err)
})

mongoose.connection.on('disconnected', ()=>{
    console.log("App disconectada")
})

mongoose.connection.on('connected',()=>{
    console.log("App conectada")
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const indexRoute = require('./Routes/index');
const usersRoute = require('./Routes/users');
const servicoRoute = require('./Routes/servico');
const prestadorRoute = require('./Routes/prestadorDeServico');
const avaliacaoRoute = require('./Routes/avaliacao')

app.use('/',indexRoute)
app.use('/users',usersRoute)
app.use('/servico',servicoRoute)
app.use('/prestador',prestadorRoute)
app.use('/users/avl',avaliacaoRoute)
app.listen(3000);

module.exports = app;

/*
200 - OK
201 - Created
202 - Accepted 
400 - Bad request
401 - Unauthorized -- AUTENTICAÇÃO, tem caráter temporário.
403 - Forbidden -- AUTORIZAÇÃO, tem caráter permanente.
404 - Not found.
500 - Internal server error
501 - Not implemented - a API não suporta essa funcionalidade
503 - Service Unavailable - a API executa essa operação, mas no momento está indisponível
*/