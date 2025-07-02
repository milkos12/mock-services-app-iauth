// Ruta: /api/validate-username.js
import db from "./db.js";
import { kv } from "@vercel/kv";

export default async function handlerValidateUsername(req, res) {
    // 1. Configuración de cabeceras CORS (sin cambios)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Manejo de la petición de pre-vuelo (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 3. Lógica principal solo para el método POST
    if (req.method === "POST") {
        try {
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ success: false, message: "Username is required." });
            }

            let users = await kv.get('users');
            if (!users) {
                await kv.set('users', db.users);
                users = await kv.get('users');
            }

            const userExists = users.some(
                (user) => user.username.toLowerCase() === username.toLowerCase()
            );

            // 4. Construir la respuesta SIEMPRE CON CÓDIGO 202
            if (userExists) {
                // Usuario existe -> success: false
                // ANTES: res.status(200) -> AHORA: res.status(202)
                return res.status(202).json({
                    success: false,
                    username: username
                });
            } else {
                // Usuario NO existe -> success: true
                // ANTES: res.status(200) -> AHORA: res.status(202)
                return res.status(202).json({
                    success: true,
                    username: username
                });
            }

        } catch (error) {
            console.error("Error in /api/validate-username:", error);
            // Los errores internos del servidor SÍ deben devolver un código de error
            return res.status(500).json({ success: false, message: "An internal server error occurred." });
        }
    }

    // 5. Los errores de método SÍ deben devolver un código de error
    return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
    });
}