const TASK_URL = "/api/tasks";


export const fetchTasks = async () => {
    const response = await fetch(TASK_URL);

    if(!response.ok) {
        throw new Error(`Failed to fetch tasks ${response.status}`);

    }
    return response.json();
};

export const createTask = async (title) =>{
    const response = await fetch(TASK_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title})
    });

    if(!response.ok) {
        throw new Error(`Failed to create task ${response.status}`);
    }
    return response.json();
}

export const deleteTask = async (id) =>{
    const url = `${TASK_URL}/${encodeURIComponent(id)}`;
    const response = await fetch(url, {method: "DELETE"});

    if(response.ok) {
        return;
    }
    if(response.status === 404) {
        const data = await response.json().catch(() => null);

        if(data?.error === "Task not found" || data?.error === "Task already exists"){
            return;
        }
    }
    throw new Error(`Failed to delete task ${response.status}`);
};

export const updateTask = async (id, changes) => {
    const response = await fetch(`${TASK_URL}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes)
    });

    if (response.ok) {
        return response.json();
    }

    if (response.status === 404) {
        const data = await response.json().catch(() => null);

        if (data?.error === "Task not found" || data?.error === "Task not found.") {
            return null;
        }
    }

    throw new Error(`Failed to update task (${response.status})`);
};

export const getCurrentUser = async () => {
    const response = await fetch("/api/auth/me");

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Could not check your session.");
    }

    const { user } = await response.json();
    return user;
};

export const signIn = async (email, password) => {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Could not sign in.");
    }
};

export const signOut = async () => {
    const response = await fetch("/api/auth/logout", {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error("Could not sign out.");
    }
};

export const registerAccount = async (email, password) => {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Could not create the account.");
    }
};