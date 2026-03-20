require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(cors());
// IMPORTANTE: Render necesita que el servidor acepte JSON y datos grandes por las fotos
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CONEXIÓN A MONGODB ATLAS ---
const mongoURI = process.env.MONGO_URI; 

// Configuración de conexión más robusta
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Conexión exitosa a MongoDB Atlas"))
.catch(err => {
    console.error("❌ Error CRÍTICO al conectar a MongoDB:");
    console.error(err.message);
});

// --- MODELO DE DATOS ---
const VendedorSchema = new mongoose.Schema({
    nombre: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    productos: String,
    whatsapp: String,
    ubicacion: String,
    encargado: String,
    foto_granja: String // Guarda la imagen en Base64
});

const Vendedor = mongoose.model('Vendedor', VendedorSchema);

// --- RUTAS API ---

// Ruta de prueba (Health Check): Útil para que Render sepa que el servidor inició bien
app.get('/', (req, res) => {
    res.send('🚀 Servidor de AgroLocal funcionando correctamente');
});

// 1. Registro de nuevo vendedor
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, email, password, productos, whatsapp } = req.body;
        const nuevoVendedor = new Vendedor({ 
            nombre, email, password, productos, whatsapp,
            ubicacion: "", encargado: "", foto_granja: "" // Campos vacíos iniciales
        });
        await nuevoVendedor.save();
        res.status(200).json({ message: "Vendedor registrado con éxito" });
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ message: "Error: El correo ya existe o faltan datos." });
    }
});

// 2. Login de vendedor
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Vendedor.findOne({ email, password });
        
        if (user) {
            res.status(200).json({ 
                message: "Login exitoso", 
                user: {
                    id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    productos: user.productos,
                    ubicacion: user.ubicacion,
                    whatsapp: user.whatsapp,
                    encargado: user.encargado 
                }
            });
        } else {
            res.status(401).json({ message: "Credenciales incorrectas" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error en el servidor durante el login" });
    }
});

// 3. Guardar/Actualizar perfil
app.post('/api/actualizar-perfil', async (req, res) => {
    try {
        const { email, productos, ubicacion, whatsapp, encargado, foto_granja } = req.body;
        
        const update = { productos, ubicacion, whatsapp, encargado, foto_granja };
        const userUpdated = await Vendedor.findOneAndUpdate({ email: email }, update, { new: true });
        
        if (!userUpdated) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Perfil actualizado correctamente" });
    } catch (err) {
        console.error("Error al actualizar:", err.message);
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
});

// 4. Obtener todos los vendedores (Para el catálogo principal)
app.get('/api/vendedores', async (req, res) => {
    try {
        const vendedores = await Vendedor.find({}, 'nombre productos ubicacion whatsapp encargado foto_granja');
        res.status(200).json(vendedores);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener vendedores" });
    }
});

// --- ARRANCAR SERVIDOR ---
// Render asigna un puerto automáticamente en process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor de AgroLocal corriendo en puerto ${PORT}`);
});