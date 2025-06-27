import db from "./db.js";
import { kv } from "@vercel/kv";
export default async function handlerPassword (req, res) {

    if (req.method === "POST") {
        const { username, password } = req.body;
        let user = db.users.find((user) => {
            return user.username === username && user.password === password;
        });

        let wrongPassword = db.users.find((user) => {
            return user.username === username && user.password !== password;
        });

        wrongPassword.numberAttempts = wrongPassword.numberAttempts + 1;

        if (wrongPassword.numberAttempts >= 3) {
            wrongPassword.isLocked = true;
        } 

        await kv.set('users', db.users);

        let json = {
            success: false,
            name: "",
            username: ""
        }

        if (user) {
            json = {
                success: true,
                name: user.name,
                username: user.username
            } 
        }

        return res.status(200).json(json);
    }

    return res.status(404).json({
        message: "Method not allowed"
    });
}


