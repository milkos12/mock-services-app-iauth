import db from "./db.js";
import { kv } from "@vercel/kv";

export default async function handlerUsers(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const { id } = req.query;

    let users = await kv.get('users');

    
        await kv.set('users', db.users);
        users = await kv.get('users');
    

    const user = users.find((user) => {
        return user.id == parseInt(id);
    });

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
}
