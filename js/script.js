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





// const setup = () =>{
//     const taskForm = document.getElementById("task-form");
//
//     taskForm.addEventListener("submit" , addTask);
//
//
//
//
//
// }
// const addTask = (event) =>{
//     event.preventDefault();
//
//     let getTaskTitle = document.getElementById("task");
//     let taskTitle = getTaskTitle.value.trim()
//     let TaskList = document.getElementById("task-list");
//
//     const taskItem = document.createElement("li");
//
//     if(taskTitle === ""){
//         getTaskTitle.focus();
//         return;
//
//     }
//
//     const taskText = document.createElement("span");
//     taskText.textContent = taskTitle;
//
//     const deleteButton = document.createElement("button");
//     deleteButton.type = "button";
//     deleteButton.textContent = "Delete";
//     deleteButton.classList.add("delete-button");
//
//     deleteButton.addEventListener("click", function(){
//         taskItem.remove();
//     });
//
//     const box = document.createElement("input");
//     box.type = "checkbox";
//     box.classList.add("task-checkbox");
//
//     box.setAttribute(
//         "aria-label",
//         "Complete task: " + taskTitle
//     );
//
//     box.addEventListener("change", () => {
//         taskItem.classList.toggle("completed", box.checked);
//     });
//
//         taskItem.appendChild(box);
//         taskItem.appendChild(taskText);
//         taskItem.appendChild(deleteButton);
//
//
//         // Sonra görev satırını listeye ekle.
//         TaskList.appendChild(taskItem);
//
//
//
// }
// window.addEventListener("load" ,setup);