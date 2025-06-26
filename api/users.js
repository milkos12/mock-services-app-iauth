import bd from "./bd.js";

export default function handlerUsers (req, res) {
    const { id } = req.query;

    const user = bd.users.find((user) => {
        return user.id == parseInt(id);
    });

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
}
