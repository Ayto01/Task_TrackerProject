export const fetchTasks = async () => {
    const response = await fetch("http://127.0.0.1:3000/api/tasks");

    if(!response.ok) {
        throw new Error(`Failed to fetch tasks ${response.status}`);

    }
    return response.json();
}