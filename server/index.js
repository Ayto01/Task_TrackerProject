import express from 'express';
import cors from 'cors';
import { randomUUID } from "node:crypto";

const app = express();
app.use(cors({origin: 'http://localhost:63342'}));
app.use(express.json());

const port = 3000;
const host = '127.0.0.1';

const tasks = [
    {id: "1", title: "Study JavaScript", completed: false},
    {id: "2", title: "JavaScript", completed: true},
    {id: "3", title: "Uyu", completed: true}
];

app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

app.post("/api/tasks", (request, response) => {
    const title = request.body?.title;

    if (typeof title !== "string" || title.trim() === "") {
        return response.status(400).json({ error: "Task title is required." });
    }

    const task = {
        id: randomUUID(),
        title: title.trim(),
        completed: false
    };

    tasks.push(task);
    response.status(201).json(task);
});

app.delete("/api/tasks/:id", (request, response) => {
    const id = request.params.id;
    const taskIndex = tasks.findIndex((task)=> task.id === id);
    if (taskIndex === -1) {
        return response.status(404).json({ error: "Task not found" });
    }
    tasks.splice(taskIndex, 1);
    response.status(204);
    response.end();
})

app.listen(port, host, () => {
    console.log(`Task API running at http://${host}:${port}`);
})