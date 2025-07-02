// Ruta: /api/validate-password.js

import db from "./db.js";
import { kv } from "@vercel/kv";

export default async function handlerPassword(req, res) {
    // --- 1. Configuración de Cabeceras CORS (Esto está bien) ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // --- 2. Manejo de Petición OPTIONS (¡ESTA ES LA CORRECCIÓN!) ---
    // Si la petición es de pre-vuelo (OPTIONS), respondemos OK y terminamos.
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return; // Detiene la ejecución aquí.
    }

    // --- 3. Lógica para Peticiones POST (Tu código original) ---
    if (req.method === "POST") {
        const { username, password } = req.body;

        let users = await kv.get('users');

        if (!users) {
            await kv.set('users', db.users);
            users = await kv.get('users');
        }
        
        // Encuentra el usuario para verificar si existe y si la contraseña es correcta
        const user = users.find((u) => u.username === username);

        if (!user) {
            // Si el usuario ni siquiera existe, la contraseña es inválida.
            return res.status(202).json({ success: false, message: "User not found." });
        }
        
        // Lógica de intentos y bloqueo
        if (user.isLocked) {
             return res.status(202).json({ success: false, message: "Account is locked." });
        }

        if (user.password !== password) {
            // Contraseña incorrecta, incrementamos intentos
            user.numberAttempts = (user.numberAttempts || 0) + 1;
            if (user.numberAttempts >= 3) {
                user.isLocked = true;
            }
            // Actualizamos la base de datos con los nuevos datos del usuario
            await kv.set('users', users);
            
            if (user.isLocked) {
                 return res.status(429).json({ success: false, message: "Account locked due to too many failed attempts." });
            }
            
            return res.status(202).json({ success: false, message: "Invalid password." });
        }

        // Contraseña correcta, reseteamos los intentos
        user.numberAttempts = 0;
        await kv.set('users', users);

        // Devolvemos la respuesta de éxito
        return res.status(202).json({
            success: true,
            name: user.name,
            username: user.username
        });
    }

    // --- 4. Manejo de otros métodos ---
    // Si llega aquí, es un método no permitido (ej. GET, PUT...)
    return res.status(405).json({ message: "Method Not Allowed" });
}