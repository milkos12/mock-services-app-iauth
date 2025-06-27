import db from "./db.js";
import { kv } from "@vercel/kv";
export default async function handlerPassword(req, res) {

    if (req.method === "POST") {
        const { username, password } = req.body;

        let users = await kv.get('users');

        if (!users) {
            await kv.set('users', db.users);
            users = await kv.get('users');
        }

        let user = users.find((user) => {
            return user.username === username;
        });

        let wrongPassword = users.find((user) => {
            return user.username === username && user.password !== password;
        });

        let json = {
            success: false,
            name: "",
            username: ""
        }

        if (user) {
            json = {
                success: true,
                name: user.name,
                username: user.username,
                isLocked: user.isLocked,
                numberAttempts: user.numberAttempts
            }
        }

        let codeRequest = 200;

        if (wrongPassword) {
            json.success = false;
            wrongPassword.numberAttempts = wrongPassword.numberAttempts + 1;

            if (wrongPassword.numberAttempts >= 3) {
                wrongPassword.isLocked = true;
                codeRequest = 429;
            }

            users[wrongPassword.id - 1] = wrongPassword;
        }

        if(json.numberAttempts  >= 3) {
            json.success = false;
            codeRequest = 429;
        }
        await kv.set('users', users);
        return res.status(codeRequest).json(json);
    }

    return res.status(404).json({
        message: "Method not allowed"
    });
}


