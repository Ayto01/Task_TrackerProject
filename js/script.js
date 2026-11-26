import { saveTasks, loadTasks } from "./storage.js";
import { fetchTasks , createTask,deleteTask} from "./api.js";

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
   deleteButton.addEventListener("click", async () => {
       const status = document.getElementById("task-status");
       const loadButton = document.getElementById("load-sample-tasks");

       if(loadButton.disabled){
           status.textContent = "Wait for the current request to finish."
       return;
       }
       deleteButton.disabled = true;
       loadButton.disabled = true;
       status.textContent = "Deleting task.."

       try {
           await deleteTask(task.id);

           const updatedTasks = tasks.filter((item) => item.id !== task.id);
           saveTasks(updatedTasks);
           tasks = updatedTasks;
           renderTasks();

           status.textContent = "Task deleted.";
       } catch (error) {
           status.textContent = "Could not finish deleting the task.";
           console.error(error);
       } finally {
           deleteButton.disabled = false;
           loadButton.disabled = false;
       }

   })


    taskItem.appendChild(checkBox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteButton);
    taskItem.appendChild(editButton);
    taskList.appendChild(taskItem);
}

const taskFilter = document.getElementById("task-filter");

const renderTasks = () => {
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

    const taskList = document.getElementById("task-list");
    taskList.replaceChildren();
    visibleTasks.forEach(renderTask);
};





    const addTask = async (event) => {
        event.preventDefault();

        const taskInput = document.getElementById("task");
        const submitButton = event.currentTarget.querySelector('button[type="submit"]');
        const status = document.getElementById("task-status");
        const taskTitle = taskInput.value.trim();


        if (taskTitle === "") {
            taskInput.focus();
            return;

        }

        submitButton.disabled = true;
        taskInput.readOnly = true;
        status.textContent = "adding task..."

        let createdTask;

        try {
            createdTask = await createTask(taskTitle);
            taskInput.value = "";

            const alreadyInList = tasks.some((task) => task.id === createdTask.id);

            if (!alreadyInList) {
                const updatedTasks = tasks.concat(createdTask);
                saveTasks(updatedTasks);
                tasks = updatedTasks;
                renderTasks();
            }

            status.textContent = "Task added.";
        } catch (error) {
            status.textContent = createdTask
                ? "Task created on the server. Could not update the list."
                : "Could not add the task.";
            console.error(error);
        } finally {
            submitButton.disabled = false;
            taskInput.readOnly = false;
            taskInput.focus();
        }




    }

const importSampleTasks = async (event) => {
    const button = event.currentTarget;
    const status = document.getElementById("api-status");

    button.disabled = true;
    status.textContent = "Loading sample tasks...";

    try {
        const apiTasks = await fetchTasks();
        const newTasks = apiTasks.filter(
            (apiTask) => !tasks.some((task) => task.id === apiTask.id)
        );

        const updatedTasks = tasks.concat(newTasks);
        saveTasks(updatedTasks);
        tasks = updatedTasks;
        renderTasks();

        status.textContent = "Sample tasks loaded.";
    } catch (e) {
        status.textContent = "Could not load sample tasks.";
        console.error(e);
    } finally {
        button.disabled = false;
    }
};

    const setup = () =>{
        tasks = loadTasks();
        tasks.forEach(renderTask);



        const taskForm = document.getElementById("task-form");
        taskForm.addEventListener("submit",addTask)

        taskFilter.addEventListener("change", renderTasks);

        const loadButton = document.getElementById("load-sample-tasks");
        loadButton.addEventListener("click", importSampleTasks);
    }

    window.addEventListener("load", setup);


