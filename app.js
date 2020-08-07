require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/config')
const cors = require("cors")
const bodyParser = require('body-parser')
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io')(server);

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
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const indexRoute = require('./Routes/index');
const usersRoute = require('./Routes/users');
const servicoRoute = require('./Routes/servico');
const prestadorRoute = require('./Routes/prestadorDeServico');
const avaliacaoRoute = require('./Routes/avaliacao')

app.use('/',indexRoute)
app.use('/users',usersRoute,express.static(path.resolve(__dirname,"./uploads/")))
app.use('/servico',servicoRoute)
app.use('/prestador',prestadorRoute)
app.use('/users/avl',avaliacaoRoute)

io.on('connection', (socket) => {
    console.log('io connected');
    socket.on('atualizouPerfilPrestador',data=>{
        socket.broadcast.emit('perfilAtualizadoPrestador',data)
    });
    socket.on('statusServicoMudou',data=>{
        socket.broadcast.emit('statusServicoMudado',data)
    });
    socket.on('criouServico',data=>{
        socket.broadcast.emit('servicoCriado',data)
    });
    socket.on('excluiuServico',data=>{
        socket.broadcast.emit('servicoExcluido',data)
    });
    socket.on('excluiuPrestador',data=>{
        socket.broadcast.emit('prestadorExcluido',data)
    })
    socket.once('agendouServico',data=>{
        socket.broadcast.emit('servicoAgendado',data)
    });
    socket.on('usuarioCancelouAgendamento',data=>{
        socket.broadcast.emit('agendamentoCanceladoUsuario',data)
    });
    socket.on('novaAvaliacao',data=>{
        socket.broadcast.emit('avaliacaoCriada',data)
    });
    socket.on('atualizouPerfilUsuario',data=>{
        socket.broadcast.emit('perfilAtualizadoUsuario',data)
    });
  });

server.listen(process.env.PORT || 3000);

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