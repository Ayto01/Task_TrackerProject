import { saveTasks, loadTasks } from "./storage.js";

let tasks = [];

const renderTask = (task) => {
    const taskList = document.getElementById("task-list");
    const taskItem = document.createElement("li");

    taskItem.classList.toggle("completed", task.completed);

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.classList.add("task-checkbox");
    checkBox.checked = task.completed;

    checkBox.setAttribute("aria-label", "Complete task:" + task.title);

    checkBox.addEventListener("change", () => {
        task.completed = checkBox.checked;
        taskItem.classList.toggle("completed", task.completed);

        saveTasks(tasks);
    });


    const taskText = document.createElement("span");
    taskText.textContent = task.title;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", () => {
        const answer = prompt("Geef niewue titel", task.title);

        if(answer === null){
            return;
        }

        const newTitle = answer.trim();

        if(newTitle === ""){
            return;
        }

        task.title = newTitle;
        taskText.textContent = newTitle;
        checkBox.setAttribute("aria-label", "Complete task:" + newTitle);
        saveTasks(tasks);
    })


    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((item) => item.id !== task.id);
        taskItem.remove();
        saveTasks(tasks);

    });


    taskItem.appendChild(checkBox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteButton);
    taskItem.appendChild(editButton);
    taskList.appendChild(taskItem);
}




    const addTask = (event) => {
        event.preventDefault();

        const taskInput = document.getElementById("task");
        const taskTitle = taskInput.value.trim();


        if (taskTitle === "") {
            taskInput.focus();
            return;

        }

        const task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            completed: false
        };

        tasks.push(task);
        renderTask(task);
        saveTasks(tasks);
    }

    const setup = () =>{
        tasks = loadTasks();
        tasks.forEach(renderTask);

        const taskForm = document.getElementById("task-form");
        taskForm.addEventListener("submit",addTask)
    }

    window.addEventListener("load", setup);


