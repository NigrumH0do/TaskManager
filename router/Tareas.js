const express = require('express');
const router = express.Router();
const Stack = require('../public/Stack');
const Tarea = require('../models/tareas');
//txt
const fs = require('fs');
const readline = require('readline');
//Colas
const PriorityQueue = require('../public/Cola');

const tareasEliminadasStack = [];
//txt
const datosFilePath = 'datos.txt';//ruta del archivo txt

const leerDatosDesdeArchivo = async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream(datosFilePath),
        crlfDelay: Infinity
    });

    const datos = [];

    for await (const line of rl) {
        const [descripcion, fechaVencimiento, prioridad] = line.split(','); // Suponiendo que los datos están separados por coma
        datos.push({ descripcion, fechaVencimiento, prioridad });
    }

    return datos;
};

router.post('/guardar-txt', async (req, res) => {
    console.time('Guardar-Datos');
    try {
        const datos = await leerDatosDesdeArchivo();
        
        // Guardar cada dato en MongoDB
        for (const dato of datos) {
            const tarea = new Tarea(dato);
            await tarea.save();
        }
        
        res.send('Datos cargados en MongoDB exitosamente');
    } catch (error) {
        console.error('Error al cargar los datos en MongoDB:', error);
        res.status(500).send('Error interno del servidor');
    }
    console.timeEnd('Guardar-Datos');
});
//////////////////
function compararPrioridad(a, b) {
    // Comparar por fecha de vencimiento
    if (a.fechaVencimiento < b.fechaVencimiento) {
      return -1;
    } else if (a.fechaVencimiento > b.fechaVencimiento) {
      return 1;
    } else {
      // Si tienen la misma fecha de vencimiento, comparar por prioridad
      if (a.prioridad < b.prioridad) {
        return -1;
      } else if (a.prioridad > b.prioridad) {
        return 1;
      } else {
        return 0;
      }
    }
  }
  router.get('/', async (req, res) => {
    console.time('Tiempo de espera Tareas');
    try {
      const arrayTareasDB = await Tarea.find();
  
      // Crear una instancia de la cola con prioridad
      const colaPrioridad = new PriorityQueue();
  
      // Agregar cada tarea a la cola con prioridad
      arrayTareasDB.forEach(tarea => {
        // Calcular la prioridad basada en la fecha de vencimiento y la prioridad de la tarea
        const prioridad = tarea.fechaVencimiento.getTime() + (1000000 - tarea.prioridad);
        colaPrioridad.enqueue(tarea, prioridad);
      });
  
      // Crear un nuevo arreglo con las tareas ordenadas
      const arrayTareasOrdenadas = [];
      while (!colaPrioridad.isEmpty()) {
        arrayTareasOrdenadas.push(colaPrioridad.dequeue());
      }
  
      res.render("tareas", { arrayTareas: arrayTareasOrdenadas });
    } catch (error) {
      console.log(error);
    }
    console.timeEnd('Tiempo de espera Tareas');
  });
  
  
/*
router.get('/', async (req, res) => {

    try{

        const arrayTareasDB = await Tarea.find();
        res.render("tareas", {
            arrayTareas: arrayTareasDB
        })

    } catch (error){
        console.log(error);
    }

    
});
*/
router.get('/crear', (req, res) => {
    res.render('crear');
});

router.post('/', async (req, res) => {
    const body = req.body;
    try{
        const tareaDB = new Tarea({
            descripcion: body.descripcion,
            fechaCreacion: body.fechaCreacion,
            fechaVencimiento: body.fechaVencimiento,
            prioridad: body.prioridad,
            completado: body.completado,
        });
        await tareaDB.save();
        res.redirect('/tareas');
    }catch(error){
        console.log(error);
    }
});

router.get('/busqueda', async (req, res) => {
    const descripcion = req.query.descripcion;
    const fechaVencimiento = req.query.fechaVencimiento;
    
    try{

        let query = {};

        if (descripcion) {
            query.descripcion = descripcion;
        }

        if (fechaVencimiento) {
            query.fechaVencimiento = fechaVencimiento;
        }

        const arrayTareasDB = await Tarea.find(query);

        res.render("busqueda", {
            arrayTareas: arrayTareasDB
        })

    } catch (error){
        console.log(error);
    }
});

router.get('/:id', async (req, res) => {

    const id = req.params.id;

    try {
        const tareaDB = await Tarea.findOne({_id: id});

        res.render('detalle', {
            tarea: tareaDB,
            error: false
        });

    } catch (error) {
        res.render('detalle', {
            error: true,
            mensaje: 'No se encuentra el id seleccionado'
        });
    }

});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const tareaDB = await Tarea.findByIdAndDelete({_id: id});

        if(tareaDB){
            tareasEliminadasStack.push(tareaDB);
    
            res.json({
                estado: true,
                mensaje: 'Eliminado'
            });
        } else {
            res.json({
                estado: false,
                mensaje: 'Fallo al eliminar'
            });
        }

    } catch (error) {
        console.log(error);
    }

});

router.put('/:id', async (req, res) => {

    const id = req.params.id;
    const body = req.body;

    try {

        const tareaDB = await Tarea.findByIdAndUpdate(id, body, {useFindAndModify: false});

        res.json({
            estado: true,
            mensaje: 'Editado'
        });
        
    } catch (error) {
        res.json({
            estado: false,
            mensaje: 'Fallo al editar'
        });
    }
});

router.post('/restaurar-ultima-eliminada', async (req, res) => {
    try {
        const tareaRestaurada = tareasEliminadasStack.pop();
        if (tareaRestaurada) {
            const tareaValida = {};
            for (const key in tareaRestaurada) {
                if (Tarea.schema.paths.hasOwnProperty(key)) {
                    tareaValida[key] = tareaRestaurada[key];
                }
            }
            const nuevaTarea = new Tarea(tareaValida);
            await nuevaTarea.save();
            res.redirect('/tareas');
        } else {
            res.send('No hay tareas eliminadas para restaurar');
        }
    } catch (error) {
        console.log(error);
        res.send('Error al restaurar la tarea');
    }
});



module.exports = router;