const STORAGE_KEY = "task-tracker-tasks";

export const saveTasks = (task) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
}

export const loadTasks = () => {
    const savedTasks= localStorage.getItem(STORAGE_KEY);

    if(savedTasks === null) {
        return [];
    }

    return JSON.parse(savedTasks);
}