const express = require('express');
const router = express.Router();
const Stack = require('../public/Stack');
const BST = require('../public/BST');
const AVL = require('../public/AVL');
const BinaryMaxHeap = require('../public/BinaryMaxHeap');
const TernaryMaxHeap = require('../public/TernaryMaxHeap');
const DisjointSetWithPathCompression = require('../public/DisjointSetWithPathCompression');
const DisjointSetOptimized = require('../public/DisjointSetOptimized');
const Tarea = require('../models/tareas');

//txt
const fs = require('fs');
const readline = require('readline');
const QuaternaryMaxHeap = require('../public/QuaternaryMaxHeap');
/////

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
});
//////////////////



//get para obtener tareas(en desorden)
// router.get('/', async (req, res) => {

//     try{

//         const arrayTareasDB = await Tarea.find();

//         res.render("tareas", {
//             arrayTareas: arrayTareasDB
//         })

//     } catch (error){
//         console.log(error);
//     }

    
// });





//get para obtener tareas(ordenadas por prioridad) con un monticulo binario
// router.get('/', async (req, res) => {
//     console.time('binario');
//         try {
//         const arrayTareasDB = await Tarea.find();
//         const heap = new BinaryMaxHeap();

//         arrayTareasDB.forEach(tarea => {
//             heap.insert(tarea);
//         });

//         const tareasOrdenadas = [];
//         while (heap.size() > 0) {
//             tareasOrdenadas.push(heap.extractMax());
//         }

//         res.render("tareas", {
//             arrayTareas: tareasOrdenadas
//         });

//     } catch (error) {
//          console.log(error);
//      }
//     console.timeEnd('binario');
//  });



//get para obtener tareas(ordenadas por prioridad) con un monticulo ternario
// router.get('/', async (req, res) => {
//     console.time('Ternary');
//     try {
//         const arrayTareasDB = await Tarea.find();

//         // Crear un montículo ternario
//         const ternaryHeap = new TernaryMaxHeap();

//         // Insertar todas las tareas en el montículo
//         arrayTareasDB.forEach(tarea => ternaryHeap.insert(tarea));

//         // Extraer las tareas en orden de mayor a menor prioridad
//         const tareasOrdenadas = [];
//         while (ternaryHeap.heap.length > 0) {
//             tareasOrdenadas.push(ternaryHeap.extractMax());
//         }

//         res.render('tareas', {
//             arrayTareas: tareasOrdenadas,
//         });
//     } catch (error) {
//         console.log(error);
//     }
//     console.timeEnd('Ternary');
// });

//get para obtener tareas(ordenadas por prioridad) con un monticulo quaternario
router.get('/', async (req, res) => {
    console.time('quaternario');
    try {
        const arrayTareasDB = await Tarea.find();

        // Crear un montículo ternario
        const quaternaryHeap = new QuaternaryMaxHeap();

        // Insertar todas las tareas en el montículo
        arrayTareasDB.forEach(tarea => quaternaryHeap.insert(tarea));

        // Extraer las tareas en orden de mayor a menor prioridad
        const tareasOrdenadas = [];
        while (quaternaryHeap.heap.length > 0) {
            tareasOrdenadas.push(quaternaryHeap.extractMax());
        }

        res.render('tareas', {
            arrayTareas: tareasOrdenadas,
        });
    } catch (error) {
        console.log(error);
    }
    console.timeEnd('quaternario');
});




router.get('/crear', (req, res) => {
    res.render('crear');
});

router.post('/', async (req, res) => {
    const body = req.body;
    try{
        const tareaDB = new Tarea(body);
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


//Mostar la tarea mas proxima a vencer con BST
// router.post('/proxima', async (req, res) => {
//     console.time('BST');
//     try {
//         const tareas = await Tarea.find();
        
//         const bst = new BST();
        
//         tareas.forEach(tarea => {
//             bst.insert({
//                 descripcion: tarea.descripcion,
//                 fechaVencimiento: tarea.fechaVencimiento,
//                 prioridad: tarea.prioridad
//             });
//         });

//         const proximaTarea = bst.findMin();
        
//         res.render('proxima', {
//             tarea: proximaTarea
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Error interno del servidor');
//     }
//     console.timeEnd('BST');
// });


//Mostar la tarea mas proxima a vencer con AVL
router.post('/proxima', async (req, res) => {
    console.time('AVL');
    try {
        const tareas = await Tarea.find();

        const avl = new AVL();

        tareas.forEach(tarea => {
            avl.insert({
                descripcion: tarea.descripcion,
                fechaVencimiento: tarea.fechaVencimiento,
                prioridad: tarea.prioridad
            });
        });

        const proximaTarea = avl.findMin();

        res.render('proxima', {
            tarea: proximaTarea
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error interno del servidor');
    }
    console.timeEnd('AVL');
});



// Ruta para unir todas las tareas con un conjunto disjunto solo con PAth Compression
// router.post('/unir-tareas', async (req, res) => {
//     try {

//         console.time('Unión de todas las tareas');


//         const tareas = await Tarea.find();
//         const disjointSet = new DisjointSetWithPathCompression(tareas.length);

//         //Unir todas las tareas en un solo conjunto
//         for (let i = 1; i < tareas.length; i++) {
//             disjointSet.union(0, i);  // Unir todas las tareas al primer conjunto
//         }


//         //Imprimir el resultado en la consola
//         disjointSet.printSets();

//         //Responder al cliente
//         res.redirect('/tareas');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Error uniendo tareas.');
//     }
//     console.timeEnd('Unión de todas las tareas');
// });



// Ruta para unir todas las tareas con un conjunto disjunto con ambas optimizaciones
router.post('/unir-tareas', async (req, res) => {
    try {
        // Inicia el temporizador
        console.time('Unión de todas las tareas (Optimizado)');

        const tareas = await Tarea.find();
        const disjointSetOptimized = new DisjointSetOptimized(tareas.length);

        // Une todas las tareas en un solo conjunto
        for (let i = 0; i < tareas.length - 1; i++) {
            disjointSetOptimized.union(i, i + 1);
        }

        // Finaliza el temporizador y muestra el tiempo en la consola

        // Solo imprimir en la consola el resultado
        console.log(disjointSetOptimized.parents);

        //Responder al cliente
        res.redirect('/tareas');

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al intentar unir las tareas.');
    }
    console.timeEnd('Unión de todas las tareas (Optimizado)');
});

module.exports = router;