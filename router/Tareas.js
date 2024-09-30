const express = require('express');
const router = express.Router();
const Stack = require('../public/Stack');
const historialEliminadas = new Stack();
const BST = require('../public/BST');
const BinaryMinHeap = require('../public/BinaryMinHeap');
const BinaryMaxHeap = require('../public/BinaryMaxHeap');
const ConjuntosDisjuntos = require('../public/ConjuntosDisjuntos');
const Tarea = require('../models/tareas');
const HashTable = require("../public/HashTable");
let hashTableTareas = new HashTable();
const GrafoTareas = require("../public/GrafoTareas");
let grafoTareas = new GrafoTareas();

// txt
const fs = require('fs');
const readline = require('readline');

// txt
const datosFilePath = 'datos.txt'; // Ruta del archivo txt

// Función para leer datos desde un archivo
const leerDatosDesdeArchivo = async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream(datosFilePath),
        crlfDelay: Infinity
    });

    const datos = [];

    for await (const line of rl) {
        // Elimina espacios adicionales y divide la línea
        const [descripcion, fechaVencimiento, prioridad] = line.split(',').map(item => item.trim());

        // Agrega el objeto a la lista de datos
        datos.push({ descripcion, fechaVencimiento, prioridad });
    }

    return datos;
};


// Guardar los datos del txt en MongoDB
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




//Traer todas las tareas con sus subtareas usando conjuntos disjuntos
router.get('/', async (req, res) => {
    try {
        // Obtener todas las tareas
        const tareas = await Tarea.find().lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir cada tarea con su tarea padre (si tiene una)
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear estructura de tareas principales con subtareas
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre) // Filtrar solo las tareas principales
            .map(tarea => {
                // Encontrar todas las subtareas del mismo conjunto, excluyendo la tarea principal
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && // Excluir la tarea principal
                    subtarea.tareaPadre !== null
                );

                return {
                    ...tarea,
                    subtareas
                };
            });

        // Renderizar la vista con las tareas principales y sus subtareas
        res.render("tareas", {
            arrayTareas: tareasPrincipales
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener las tareas');
    }
});




// Buscar tareas según descripción, fecha de vencimiento, prioridad o estado
router.get('/busqueda', async (req, res) => {
    const { descripcion, fecha, prioridad, estado } = req.query;

    try {
        // Construimos el query para filtrar las tareas
        let query = {};

        if (descripcion) {
            query.descripcion = { $regex: descripcion, $options: "i" }; // Búsqueda insensible a mayúsculas
        }

        if (fecha) {
            query.fechaVencimiento = fecha;
        }

        if (prioridad) {
            query.prioridad = prioridad;
        }

        if (estado) {
            query.completado = estado === "Completado";
        }

        // Obtener todas las tareas que coinciden con el query
        const tareas = await Tarea.find(query).lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir cada tarea con su tarea padre (si tiene una)
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear estructura de tareas principales con subtareas
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre) // Filtrar solo las tareas principales
            .map(tarea => {
                // Encontrar todas las subtareas del mismo conjunto, excluyendo la tarea principal
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && // Excluir la tarea principal
                    subtarea.tareaPadre !== null
                );

                return {
                    ...tarea,
                    subtareas
                };
            });

        // Renderizar la vista con las tareas principales y sus subtareas
        res.render("busqueda", {
            tareas: tareasPrincipales, // Cambiar arrayTareas a tareas para que coincida con el frontend
            descripcion, // Pasar el valor de la descripción
            fecha, // Pasar el valor de la fecha de vencimiento
            prioridad, // Pasar el valor de la prioridad
            estado // Pasar el valor del estado
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Error en la búsqueda");
    }
});




// Ruta para ordenar las tareas por fecha de vencimiento descendente
router.get('/ordenar-fecha-asc', async (req, res) => {
    try {
        // Obtener todas las tareas
        const tareas = await Tarea.find().lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir cada tarea con su tarea padre (si tiene una)
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear estructura de tareas principales con sus subtareas
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre) // Filtrar solo las tareas principales
            .map(tarea => {
                // Encontrar todas las subtareas del mismo conjunto, excluyendo la tarea principal
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && // Excluir la tarea principal
                    subtarea.tareaPadre !== null
                );

                return {
                    ...tarea,
                    subtareas
                };
            });

        // Crear una instancia del árbol BST
        const bst = new BST();

        // Insertar cada tarea principal en el árbol BST
        tareasPrincipales.forEach(tarea => {
            bst.insert(tarea);
        });

        // Obtener las tareas en orden descendente utilizando el recorrido inorden descendente del BST
        const tareasOrdenadasAsc = bst.inorderAsc();

        // Renderizar la vista con las tareas ordenadas en forma descendente por fecha de vencimiento
        res.render("tareas", {
            arrayTareas: tareasOrdenadasAsc
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener y ordenar las tareas');
    }
});




// Ruta para ordenar las tareas por fecha de vencimiento descendente
router.get('/ordenar-fecha-desc', async (req, res) => {
    try {
        // Obtener todas las tareas
        const tareas = await Tarea.find().lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir cada tarea con su tarea padre (si tiene una)
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear estructura de tareas principales con sus subtareas
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre) // Filtrar solo las tareas principales
            .map(tarea => {
                // Encontrar todas las subtareas del mismo conjunto, excluyendo la tarea principal
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && // Excluir la tarea principal
                    subtarea.tareaPadre !== null
                );

                return {
                    ...tarea,
                    subtareas
                };
            });

        // Crear una instancia del árbol BST
        const bst = new BST();

        // Insertar cada tarea principal en el árbol BST
        tareasPrincipales.forEach(tarea => {
            bst.insert(tarea);
        });

        // Obtener las tareas en orden descendente utilizando el recorrido inorden descendente del BST
        const tareasOrdenadasDesc = bst.inorderDesc();

        // Renderizar la vista con las tareas ordenadas en forma descendente por fecha de vencimiento
        res.render("tareas", {
            arrayTareas: tareasOrdenadasDesc
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener y ordenar las tareas');
    }
});




// Ruta para ordenar por prioridad ascendente
router.get('/ordenar-prioridad-asc', async (req, res) => {
    try {
        const tareas = await Tarea.find().lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir tareas con sus tareas padre
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear instancia de BinaryMinHeap
        const minHeap = new BinaryMinHeap();

        // Insertar tareas principales en el MinHeap
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre) // Filtrar solo tareas principales
            .forEach(tarea => {
                // Encontrar todas las subtareas del mismo conjunto
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && // Excluir tarea principal
                    subtarea.tareaPadre !== null
                );
                
                // Insertar la tarea en el MinHeap con sus subtareas
                minHeap.insert({
                    ...tarea,
                    subtareas
                });
            });

        // Extraer tareas ordenadas por prioridad ascendente
        const tareasOrdenadas = [];
        while (minHeap.size() > 0) {
            tareasOrdenadas.push(minHeap.extractMin());
        }

        // Renderizar la vista con las tareas ordenadas
        res.render('tareas', {
            arrayTareas: tareasOrdenadas
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener las tareas');
    }
});




// Ruta para ordenar las tareas por prioridad descendente
router.get('/ordenar-prioridad-desc', async (req, res) => {
    try {
        // Obtener todas las tareas
        const tareas = await Tarea.find().lean();

        // Crear instancia de conjuntos disjuntos
        const conjuntosDisjuntos = new ConjuntosDisjuntos();

        // Inicializar conjuntos disjuntos para cada tarea
        tareas.forEach(tarea => {
            conjuntosDisjuntos.makeSet(tarea._id.toString());
        });

        // Unir cada tarea con su tarea padre (si tiene una)
        tareas.forEach(tarea => {
            if (tarea.tareaPadre) {
                conjuntosDisjuntos.union(tarea.tareaPadre.toString(), tarea._id.toString());
            }
        });

        // Crear estructura de tareas principales con subtareas
        const tareasPrincipales = tareas
            .filter(tarea => !tarea.tareaPadre)
            .map(tarea => {
                const subtareas = tareas.filter(subtarea =>
                    conjuntosDisjuntos.find(subtarea._id.toString()) === conjuntosDisjuntos.find(tarea._id.toString()) &&
                    subtarea._id.toString() !== tarea._id.toString() && 
                    subtarea.tareaPadre !== null
                );

                return {
                    ...tarea,
                    subtareas
                };
            });

        // Crear una instancia de BinaryMaxHeap
        const maxHeap = new BinaryMaxHeap();

        // Insertar las tareas principales en el montículo
        tareasPrincipales.forEach(tarea => {
            maxHeap.insert(tarea);
        });

        // Extraer las tareas en orden de prioridad descendente
        const tareasOrdenadas = [];
        while (maxHeap.size() > 0) {
            tareasOrdenadas.push(maxHeap.extractMax());
        }

        // Renderizar la vista con las tareas ordenadas por prioridad descendente
        res.render("tareas", {
            arrayTareas: tareasOrdenadas
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al ordenar las tareas por prioridad');
    }
});



///////Boton recomendar tarea con tabla hash///////////////////////////////////////////////
//Llenar la tabla hash al inicio solo con tareas principales

// Tarea.find({ tareaPadre: null }).then(tareas => {
//     tareas.forEach(tarea => {
//         if (!tarea.completado && new Date(tarea.fechaVencimiento) >= new Date()) {
//             hashTableTareas.set(tarea.fechaVencimiento, tarea);
//         }
//     });
// }).catch(err => console.error('Error al cargar las tareas en la tabla hash:', err));

//Ruta para recomendar la tarea más próxima

// router.get('/recomendar', async (req, res) => {
//     console.time('Hash');
//     try {
//         const fechaActual = new Date();
//         const tareaRecomendada = hashTableTareas.getClosestAfter(fechaActual);

//         if (tareaRecomendada) {
//             res.json({
//                 success: true,
//                 tarea: tareaRecomendada,
//             });
//         } else {
//             res.json({
//                 success: false,
//                 message: 'No hay tareas disponibles que no hayan vencido.',
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Ocurrió un error al recomendar la tarea.',
//         });
//     }
//     console.timeEnd('Hash');
// });

///////////////////////////////////////////////////////////////////////////////////////////






/////////////grafos///////////////////////////////////////////////
// Llenar el grafo al inicio solo con tareas principales
Tarea.find({ tareaPadre: null }).then(tareas => {
    tareas.forEach(tarea => {
        if (!tarea.completado && new Date(tarea.fechaVencimiento) >= new Date()) {
            grafoTareas.agregarTarea(tarea);
        }
    });

    // Conectar tareas en función de sus fechas de vencimiento
    tareas.forEach(tarea1 => {
        tareas.forEach(tarea2 => {
            if (new Date(tarea1.fechaVencimiento) < new Date(tarea2.fechaVencimiento)) {
                grafoTareas.conectarTareas(tarea1, tarea2, 1);  // Puedes cambiar el peso según la lógica que prefieras
            }
        });
    });
}).catch(err => console.error('Error al cargar las tareas en el grafo:', err));

// Ruta para recomendar la tarea más próxima
router.get('/recomendar', async (req, res) => {
    console.time('Grafos');
    try {
        const fechaActual = new Date();
        const tareaRecomendada = grafoTareas.recomendarTarea(fechaActual);

        if (tareaRecomendada) {
            res.json({
                success: true,
                tarea: tareaRecomendada,
            });
        } else {
            res.json({
                success: false,
                message: 'No hay tareas disponibles que no hayan vencido.',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al recomendar la tarea.',
        });
    }
    console.timeEnd('Grafos');
});
//////////////////////////////////////////////////////////////////////////////////








// Restaurar la última tarea eliminada
router.post('/restaurar-ultima-eliminada', async (req, res) => {
    try {
        if (historialEliminadas.isEmpty()) {
            return res.status(200).json({ success: false, message: 'No hay tareas para restaurar' });
        }

        const { tareaPrincipal, subtareas } = historialEliminadas.pop();

        await Tarea.create(tareaPrincipal);

        if (subtareas.length > 0) {
            await Tarea.insertMany(subtareas);
        }

        res.status(200).json({ success: true, message: 'Tarea restaurada con éxito' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al restaurar la tarea' });
    }
});




// Ruta para mostrar el formulario de creación de tarea
router.get('/crear', (req, res) => {
    res.render('crear-tarea'); // Renderiza la vista crear-tarea.ejs
});

// Ruta para crear una nueva tarea
router.post('/crear', async (req, res) => {
    const { descripcion, fechaVencimiento, prioridad, estado } = req.body;

    try {
        // Crear la nueva tarea
        const nuevaTarea = new Tarea({
            descripcion,
            fechaVencimiento,
            prioridad,
            completado: estado === "Completado", // Convertimos el estado a booleano
            tareaPadre: null // Es una tarea principal
        });

        // Guardar la tarea en la base de datos
        await nuevaTarea.save();


        //////tabla hash///////////////////////////////////////////////
        // Verificar si la tarea no está completada y tiene una fecha de vencimiento futura, agregarla a la tabla hash
        if (!nuevaTarea.completado && new Date(nuevaTarea.fechaVencimiento) >= new Date()) {
            hashTableTareas.set(nuevaTarea.fechaVencimiento, nuevaTarea);
        }
        //////////////////////////////////////////////////////////////



        ////////grafo///////////////////////////////////////////////
        // Agregar la nueva tarea al grafo si no está completada y tiene fecha de vencimiento futura
        // if (!nuevaTarea.completado && new Date(nuevaTarea.fechaVencimiento) >= new Date()) {
        //     grafoTareas.agregarTarea(nuevaTarea);

        //     // Conectar la nueva tarea con las tareas existentes en el grafo
        //     grafoTareas.nodos.forEach(nodo => {
        //         const fechaNodo = new Date(nodo.tarea.fechaVencimiento);
        //         const fechaNuevaTarea = new Date(nuevaTarea.fechaVencimiento);

        //         // Conectar las tareas en función de las fechas de vencimiento
        //         if (fechaNuevaTarea < fechaNodo) {
        //             grafoTareas.conectarTareas(nuevaTarea, nodo.tarea, 1);
        //         } else if (fechaNodo < fechaNuevaTarea) {
        //             grafoTareas.conectarTareas(nodo.tarea, nuevaTarea, 1);
        //         }
        //     });
        // }
        //////////////////////////////////////////////////////////////



        // Redirigir al listado de tareas
        res.redirect('/tareas');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al crear la tarea');
    }
});




// Mostrar la página de confirmación de eliminación de una tarea o subtarea
router.get('/:id/eliminar', async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la tarea por su ID
        const tarea = await Tarea.findById(id);

        if (!tarea) {
            return res.status(404).send('Tarea no encontrada');
        }

        // Renderizar la página de confirmación
        res.render('eliminar', { tarea });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar la tarea');
    }
});

// Eliminar la tarea o subtarea después de la confirmación
router.post('/:id/eliminar', async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener la tarea a eliminar
        const tareaPrincipal = await Tarea.findById(id).lean();
        if (!tareaPrincipal) {
            return res.status(404).send('Tarea no encontrada');
        }

        // Obtener todas las subtareas de la tarea si existen
        const subtareas = await Tarea.find({ tareaPadre: id }).lean();

        // Guardar la tarea principal y sus subtareas en la pila antes de eliminarlas
        historialEliminadas.push({
            tareaPrincipal,  // Almacenar la tarea principal
            subtareas        // Almacenar las subtareas
        });

        // Eliminar la tarea principal y sus subtareas
        await Tarea.deleteMany({ $or: [{ _id: id }, { tareaPadre: id }] });



        //////tabla hash///////////////////////////////////////////////
        //Eliminar la tarea principal de la tabla hash si no está completada y su fecha de vencimiento es futura
        if (!tareaPrincipal.completado && new Date(tareaPrincipal.fechaVencimiento) >= new Date()) {
            hashTableTareas.delete(tareaPrincipal.fechaVencimiento);
        }
        //////////////////////////////////////////////////////////////////////


        ////////////grafo///////////////////////////////////////////////
        // Eliminar la tarea del grafo
        // grafoTareas.eliminarTarea(tareaPrincipal._id);

        // subtareas.forEach(subtarea => {
        //     grafoTareas.eliminarTarea(subtarea._id);
        // });
        /////////////////////////////////////////////////////////////////



        // Redirigir al usuario a la página principal
        res.redirect('/tareas');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al eliminar la tarea');
    }
});




// Ruta para mostrar el formulario de edición de una tarea
router.get('/:id/editar', async (req, res) => {
    try {
        const tarea = await Tarea.findById(req.params.id); // Obtener la tarea por ID
        if (!tarea) {
            return res.status(404).send("Tarea no encontrada");
        }
        res.render('editar-tarea', { tarea }); // Renderizar la vista EJS con los datos de la tarea
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al obtener la tarea");
    }
});

// Ruta para manejar la actualización de la tarea
router.post('/:id/editar', async (req, res) => {
    try {
        const { descripcion, fechaVencimiento, prioridad, completado } = req.body;

        // Obtener la tarea antes de la actualización
        const tareaExistente = await Tarea.findById(req.params.id);

        if (!tareaExistente) {
            return res.status(404).send("Tarea no encontrada");
        }

        // Actualizar los campos de la tarea
        const tareaActualizada = await Tarea.findByIdAndUpdate(req.params.id, {
            descripcion,
            fechaVencimiento,
            prioridad,
            completado: completado === "on" ? true : false // Manejar el checkbox de completado
        }, { new: true });

        if (!tareaActualizada) {
            return res.status(404).send("Tarea no encontrada");
        }





        //////tabla hash///////////////////////////////////////////////
        // Si la tarea antes de la actualización estaba en la tabla hash, eliminarla
        if (!tareaExistente.completado && new Date(tareaExistente.fechaVencimiento) >= new Date()) {
            hashTableTareas.delete(tareaExistente.fechaVencimiento);
        }

        //Si la tarea actualizada no está completada y la fecha de vencimiento es futura, agregarla a la tabla hash
        if (!tareaActualizada.completado && new Date(tareaActualizada.fechaVencimiento) >= new Date()) {
            hashTableTareas.set(tareaActualizada.fechaVencimiento, tareaActualizada);
        }
        /////////////////////////////////////////////////////////////////////////////////




        ////////////grafo///////////////////////////////////////////////
        // Si la tarea existía en el grafo y ha sido actualizada, actualizarla en el grafo
        // if (!tareaExistente.completado && new Date(tareaExistente.fechaVencimiento) >= new Date()) {
        //     // Eliminar la tarea del grafo
        //     grafoTareas.eliminarTarea(tareaExistente._id);    
        // }

        // // Agregar la tarea actualizada al grafo si no está completada y tiene fecha de vencimiento futura
        // if (!tareaActualizada.completado && new Date(tareaActualizada.fechaVencimiento) >= new Date()) {
        //     grafoTareas.agregarTarea(tareaActualizada);

        //     // Actualizar conexiones con otras tareas
        //     grafoTareas.nodos.forEach(nodo => {
        //         const fechaNodo = new Date(nodo.tarea.fechaVencimiento);
        //         const fechaTareaActualizada = new Date(tareaActualizada.fechaVencimiento);

        //         // Conectar las tareas en función de las fechas de vencimiento
        //         if (fechaTareaActualizada < fechaNodo) {
        //             grafoTareas.conectarTareas(tareaActualizada, nodo.tarea, 1);
        //         } else if (fechaNodo < fechaTareaActualizada) {
        //             grafoTareas.conectarTareas(nodo.tarea, tareaActualizada, 1);
        //         }
        //     });
        // }
        //////////////////////////////////////////////////////////////////////////////////////




        res.redirect('/tareas'); // Redirigir a la lista de tareas tras actualizar
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al actualizar la tarea");
    }
});




// Ruta para mostrar el formulario de creación de subtarea
router.get('/:id/subtarea', async (req, res) => {
    const { id } = req.params;
    const tareaPadre = await Tarea.findById(id);
    if (!tareaPadre) {
        return res.status(404).send('Tarea principal no encontrada');
    }
    res.render('crear-subtarea', { tareaPadre });
});


//Guarda la subtarea en la base de datos
router.post('/:id/subtarea', async (req, res) => {
    const tareaPadre = await Tarea.findById(req.params.id);
    const { descripcion } = req.body;
    const nuevaSubtarea = new Tarea({
        descripcion,
        fechaVencimiento: tareaPadre.fechaVencimiento,
        prioridad: tareaPadre.prioridad,
        completado: false,
        tareaPadre: tareaPadre._id
    });
    await nuevaSubtarea.save();
    res.redirect(`/tareas`);
});




// Ruta para mostrar el formulario de edición de una subtarea
router.get('/:id/editar-subtarea', async (req, res) => {
    try {
        const subtarea = await Tarea.findById(req.params.id); // Obtener la tarea por ID
        if (!subtarea) {
            return res.status(404).send("Tarea no encontrada");
        }
        res.render('editar-subtarea', { subtarea }); // Renderizar la vista EJS con los datos de la subtarea
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al obtener la tarea");
    }
});

// Ruta para manejar la actualización de la subtarea
router.post('/:id/editar-subtarea', async (req, res) => {
    try {
        const { descripcion, completado } = req.body;

        // Actualizar los campos de la tarea
        const subtareaActualizada = await Tarea.findByIdAndUpdate(req.params.id, {
            descripcion,
            completado: completado === "on" ? true : false // Manejar el checkbox de completado
        }, { new: true });

        if (!subtareaActualizada) {
            return res.status(404).send("Subtarea no encontrada");
        }

        res.redirect('/tareas'); // Redirigir a la lista de tareas tras actualizar
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al actualizar la subtarea");
    }
});




module.exports = router;
