import {
    fetchTasks,
    createTask,
    deleteTask,
    updateTask,
    getCurrentUser,
    signIn,
    signOut
} from "./api.js";
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task");
const submitButton = taskForm.querySelector('button[type="submit"]');
const taskStatus = document.getElementById("task-status");

const loadButton = document.getElementById("load-sample-tasks");
const apiStatus = document.getElementById("api-status");

const taskFilter = document.getElementById("task-filter");
const taskList = document.getElementById("task-list");

const signOutButton = document.getElementById("sign-out-button");




let tasks = [];
let requestPending = false;

function setRequestPending(pending) {
    requestPending = pending;
    submitButton.disabled = pending;
    taskInput.readOnly = pending;
    loadButton.disabled = pending;
    taskFilter.disabled = pending;
    signOutButton.disabled = pending;

    taskList.querySelectorAll("input, button").forEach((control) => {
        control.disabled = pending;
    });
}

async function runRequest(status, pendingMessage, errorMessage, action) {
    if (requestPending) {
        return;
    }

    setRequestPending(true);
    status.textContent = pendingMessage;

    try {
        status.textContent = await action();
    } catch (error) {
        status.textContent = errorMessage;
        console.error(error);
    } finally {
        setRequestPending(false);
    }
}

function changeTask(id, changes) {
    return runRequest(
        taskStatus,
        "Updating task...",
        "Could not update the task. Try Reload tasks.",
        async () => {
            const updatedTask = await updateTask(id, changes);

            if (!updatedTask) {
                throw new Error("Task not found.");
            }

            tasks = tasks.map((task) => task.id === id ? updatedTask : task);
            renderTasks();

            return "Task updated.";
        }
    );
}

function renderTask(task) {
    const taskItem = document.createElement("li");
    taskItem.classList.toggle("completed", task.completed);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete task: ${task.title}`);

    checkbox.addEventListener("change", () => {
        const completed = checkbox.checked;
        checkbox.checked = task.completed;

        changeTask(task.id, { completed });
    });

    const taskText = document.createElement("span");
    taskText.textContent = task.title;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");
    editButton.setAttribute("aria-label", `Edit ${task.title}`);

    editButton.addEventListener("click", () => {
        if (requestPending) {
            return;
        }

        const answer = window.prompt("Edit task title:", task.title);

        if (answer === null) {
            return;
        }

        const title = answer.trim();

        if (title === "") {
            taskStatus.textContent = "Enter a task title.";
            return;
        }

        changeTask(task.id, { title });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
        runRequest(
            taskStatus,
            "Deleting task...",
            "Could not delete the task.",
            async () => {
                await deleteTask(task.id);

                tasks = tasks.filter((item) => item.id !== task.id);
                renderTasks();

                return "Task deleted.";
            }
        );
    });

    taskItem.append(checkbox, taskText, editButton, deleteButton);
    return taskItem;
}

function renderTasks() {
    const filter = taskFilter.value;

    const visibleTasks = tasks.filter((task) => {
        if (filter === "active") {
            return !task.completed;
        }

        if (filter === "completed") {
            return task.completed;
        }

        return true;
    });

    taskList.replaceChildren();
    visibleTasks.forEach((task) => {
        taskList.appendChild(renderTask(task));
    });
}

async function addTask(event) {
    event.preventDefault();

    if (requestPending) {
        return;
    }

    const title = taskInput.value.trim();

    if (title === "") {
        taskStatus.textContent = "Enter a task title.";
        taskInput.focus();
        return;
    }

    await runRequest(
        taskStatus,
        "Adding task...",
        "Could not add the task.",
        async () => {
            const task = await createTask(title);

            tasks.push(task);
            taskInput.value = "";
            renderTasks();

            return taskFilter.value === "completed"
                ? "Task added. Switch to All or Active to see it."
                : "Task added.";
        }
    );

    taskInput.focus();
}

function loadTasksFromApi() {
    return runRequest(
        apiStatus,
        "Loading tasks...",
        "Could not load tasks. Try Reload tasks.",
        async () => {
            tasks = await fetchTasks();
            renderTasks();

            return "";
        }
    );
}

const loginView = document.getElementById("login-view");
const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const tasksView = document.getElementById("tasks-view");

function showTasksView() {
    loginView.hidden = true;
    tasksView.hidden = false;
    loadTasksFromApi();
}

async function handleLogin(event) {
    event.preventDefault();

    const loginButton = loginForm.querySelector('button[type="submit"]');
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    loginButton.disabled = true;
    loginStatus.textContent = "Signing in...";

    try {
        await signIn(email, password);
        loginForm.reset();
        loginStatus.textContent = "";
        showTasksView();
    } catch (error) {
        loginStatus.textContent = error.message;
    } finally {
        loginButton.disabled = false;
    }
}

function handleSignOut() {
    return runRequest(
        taskStatus,
        "Signing out...",
        "Could not sign out.",
        async () => {
            await signOut();

            tasks = [];
            taskForm.reset();
            taskFilter.value = "all";
            renderTasks();

            apiStatus.textContent = "";
            tasksView.hidden = true;
            loginView.hidden = false;
            loginStatus.textContent = "Signed out.";

            return "";
        }
    );
}




async function setup() {
    loginForm.addEventListener("submit", handleLogin);
    taskForm.addEventListener("submit", addTask);
    taskFilter.addEventListener("change", renderTasks);
    loadButton.addEventListener("click", loadTasksFromApi);
    signOutButton.addEventListener("click", handleSignOut);

    try {
        const user = await getCurrentUser();

        if (user) {
            showTasksView();
        } else {
            loginView.hidden = false;
        }
    } catch (error) {
        loginView.hidden = false;
        loginStatus.textContent = error.message;
    }
}

window.addEventListener("load", setup);