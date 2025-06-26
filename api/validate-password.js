import bd from "./db.js";
export default function handlerPassword(req, res) {
    const { username, password } = req.query;

    if (req.method === "POST") {
        let user = bd.users.find((user) => {
            return user.username === username && user.password === password;
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
                username: user.username
            } 
        }

        return res.status(200).json(json);
    }

    return res.status(404).json({
        message: "Method not allowed"
    });
}


