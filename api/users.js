export default function handlerUsers (req, res) {
    const { id } = req.query;
    const users = [
        { id: 1, name: "Ada Lovelace", role: "Programmer" },
        { id: 2, name: "Grace Hopper", role: "Admiral" },
        { id: 3, name: "Margaret Hamilton", role: "Software Engineer" },
    ]

    const user = users.find((user) => {
        return user.id == parseInt(id);
    });

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
}
