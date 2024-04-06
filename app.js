const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//Formularios
app.use(bodyParser.urlencoded({extended: false}));
//JSON
app.use(bodyParser.json());

require('dotenv').config();

const port = process.env.PORT;

// Conexión a basa de datos
const mongoose = require('mongoose');

const uri = `mongodb+srv://andres5003g:w2YacuJmeK0b5KEv@cluster1.7dqshga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

mongoose.connect(uri, {
        
    })
        .then(() => console.log('Conexión a la base de datos exitosa'))
        .catch(e => console.log(e));

// motor de plantillas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'))

// Rutas
app.use('/', require('./router/Rutas'));
app.use('/tareas', require('./router/Tareas'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});