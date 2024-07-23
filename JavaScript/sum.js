let todoArrayList = JSON.parse(localStorage.getItem('todoArrayList')) || [];

// Query Selectors
const inputField = document.querySelector('#inputfield');
const taskListContainer = document.querySelector('.TaskList');
const taskList = document.querySelector('#taskList');
const errormsg = document.querySelector('.events');
const allTasksCount = document.querySelector('#allTasksCount');
const assignedTasksCount = document.querySelector('#assignedTasksCount');
const completedTasksCount = document.querySelector('#completedTasksCount');
const notaskimage = document.querySelector(".Notaskimage");
const editButton = document.querySelector('.editbutton button');
const deleteButton = document.querySelector('.Deletebutton button');
const statusButton = document.querySelector('.done i');
const addButton = document.querySelector('.addbutton');
const clearButton = document.querySelector('.clearbutton');
const confirmationModal = document.getElementById('confirmationModal');
const modalText = document.querySelector('#modalText');
const confirmButton = document.querySelector('#confirmButton');
const cancelButton = document.querySelector('#cancelButton');
const allButtons = document.querySelector('buttons');


// Create a array for all the buttons


document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    callFunction();
    setInitialActiveButton();
});
allTasksCount.addEventListener('click', () => renderTasks('All'));
assignedTasksCount.addEventListener('click', () => renderTasks('Assigned'));
completedTasksCount.addEventListener('click', () => renderTasks('Completed'));  

// Function to add list elements

function add(event) {
    event.preventDefault();

    const taskName = inputField.value.trim();
    if (taskName !== "") {
        const taskObject = {
            taskId: todoArrayList.length + 1,
            taskName: taskName,
            status: "incomplete"
        };

        todoArrayList.push(taskObject);
        saveTasksToLocalStorage();  // Save tasks to local storage
        renderTasks(getActiveCategory());

        inputField.value = "";
        displayMessage("Task added successfully!", "green");
    } else {
        displayMessage("Invalid input. Please enter a task.", "red");
    }
}

// Event listener to add task onclicking enter
inputField.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        add(event);
    }
});

window.add = add;
// Function to delete task list
function deleteElement(event) {
    const listItem = event.target.closest('li');
    const taskId = parseInt(listItem.dataset.id);
    const taskName = listItem.querySelector('.taskname').textContent;

    modalText.textContent
     = `Are you sure you want to delete the task '${taskName}'?`;

    confirmationModal.style.display = 'flex';

    confirmButton.onclick = function () {
        const newTodoArrayList = todoArrayList.filter(task => task.taskId !== taskId);
        todoArrayList = newTodoArrayList;

        callFunction();
        displayMessage(`Task '${taskName}' deleted successfully!`, "green");

        confirmationModal.style.display = 'none';
    };

    cancelButton.onclick = function () {
        confirmationModal.style.display = 'none';
    };
}


// Function to edit task list
function editTask(event) {
    const listItem = event.target.closest('li');
    const taskId = parseInt(listItem.dataset.id);
    const task = todoArrayList.find(task => task.taskId === taskId);
    const taskNameDiv = listItem.querySelector('.taskname');
    const editButtonDiv = listItem.querySelector('.editbutton');
     inputField.disabled = addButton.disabled = clearButton.disabled = true;


    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = task.taskName;
    editInput.classList.add('edit-input');
    taskNameDiv.textContent = '';
    taskNameDiv.appendChild(editInput);

    // create save button
    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk fa-lg" style="color: #005eff;"></i>';
    saveButton.onclick = function () {
        const newTaskName = editInput.value.trim();
        if (newTaskName !== "") {
            task.taskName = newTaskName;
            callFunction();
            displayMessage("Task edited successfully!", "green");
        } else {
            displayMessage("Invalid input. Please enter a valid task name.", "red");
        }
         inputField.disabled = addButton.disabled = clearButton.disabled = false;
        
    };
    
    editButtonDiv.innerHTML = '';
    editButtonDiv.appendChild(saveButton);

    editInput.focus();
} 

function renderTasks(category = 'All') {
    taskList.innerHTML = "";

    const tasksToRender = filterTasks(category);

    if (tasksToRender.length === 0) {
        notaskimage.style.display = "flex";
        taskListContainer.style.display = "none";
    } else {
        notaskimage.style.display = "none";
        taskListContainer.style.display = "flex";
        taskList.style.flexDirection = "column";
        tasksToRender.forEach(task => {
            const listItem = document.createElement('li');
            listItem.dataset.id = task.taskId;
            const isCompletedInAll = (category === 'All' && task.status === 'completed');
            const isCompletedInCompleted = (category === 'Completed' && task.status === 'completed');
            
            // Determine if edit button should be disabled
            const disableEdit = task.status === 'completed';
            
            listItem.innerHTML = `
                <div class="Listelements ${isCompletedInAll || isCompletedInCompleted ? 'completed' : ''}">
                    <div class="taskname ${isCompletedInAll || isCompletedInCompleted ? 'task-completed' : ''}">${task.taskName}</div>
                    <div class="done"><i class="fa-solid fa-circle-check fa-xl ${task.status === 'completed' ? 'completed-icon' : ''}" style="color: ${task.status === 'completed' ? 'gray' : '3ca944'};" onclick="changeTaskStatus(event, ${task.taskId})"></i></div> 
                    <div class="editbutton"><button ${disableEdit ? 'disabled' : ''} onclick="editTask(event)" class="${isCompletedInAll || isCompletedInCompleted ? 'icon-completed' : ''}"><i class="fa-regular fa-pen-to-square fa-lg" style="color: #0e78c8;"></i></button></div>
                    <div class="Deletebutton"><button onclick="deleteElement(event)" class="${isCompletedInAll || isCompletedInCompleted ? 'icon-completed' : ''}"><i class="fa-solid fa-trash fa-lg" style="color: #f23131;"></i></button></div>
                </div>`;
            taskList.appendChild(listItem);
        });
    }

    updateCategoryHeadings();
}

function changeTaskStatus(event, taskId) {
    event.stopPropagation();
    const task = todoArrayList.find(task => task.taskId === taskId);
    if (task) {
        task.status = task.status === 'completed' ? 'incomplete' : 'completed';
        saveTasksToLocalStorage();
        renderTasks(getActiveCategory());
    }
}
// Function to filter task based on category
function filterTasks(category) {
    if (category === 'All') {
        return todoArrayList;
    } else if (category === 'Completed') {
        return todoArrayList.filter(task => task.status === 'completed');
    } else if (category === 'Incomplete') {
        return todoArrayList.filter(task => task.status === 'incomplete');
    }
    return [];
}

// Function to clear all tasks

function clearall() {
    const activeCategory = getActiveCategory();
    const tasksToClear = filterTasks(activeCategory);

    // Check if there are tasks to clear
    if (tasksToClear.length === 0) {
        displayMessage(`No ${activeCategory} tasks to clear.`, "red");
        return;
    }

    modalText.textContent = `Are you sure you want to clear ${activeCategory} tasks?`;

    confirmationModal.style.display = 'flex';

    confirmButton.onclick = function () {
        if (activeCategory === 'Completed') {
            todoArrayList = todoArrayList.filter(task => task.status !== 'completed');
        } else {
            todoArrayList = [];
        }

        saveTasksToLocalStorage();
        renderTasks(activeCategory);
        displayMessage(`${activeCategory} tasks cleared successfully!`, "green");

        confirmationModal.style.display = 'none';
    };

    cancelButton.onclick = function () {
        confirmationModal.style.display = 'none';
    };
}
document.querySelectorAll('.Deletebutton button').forEach(button => {
    button.addEventListener('click', deleteElement);
});

document.getElementById('clearAllButton').addEventListener('click', clearall);


// Function to display message
function displayMessage(message, color) {
    errormsg.textContent = message;
    errormsg.style.color = color;
    errormsg.style.visibility = "visible";

    setTimeout(() => {
        errormsg.style.visibility = "hidden";
    }, 2500);
}

// Function to save to local storage using setItem
function saveTasksToLocalStorage() {
    localStorage.setItem('todoArrayList', JSON.stringify(todoArrayList));
}


// Function to load from local storage using getItem
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('todoArrayList');
    if (storedTasks) {
        todoArrayList = JSON.parse(storedTasks);
    }
}

// Function to update category task counts
function updateCategoryHeadings() {
    allTasksCount.textContent = `All (${todoArrayList.length})`;
    assignedTasksCount.textContent = `Assigned (${todoArrayList.filter(task => task.status !== 'completed').length})`;
    completedTasksCount.textContent = `Completed (${todoArrayList.filter(task => task.status === 'completed').length})`;
}

function callFunction() {
    saveTasksToLocalStorage();
    renderTasks(getActiveCategory());
}

function setInitialActiveButton() {
    allTasksCount.classList.add('active');
}

[allTasksCount, assignedTasksCount, completedTasksCount].forEach(button => {
    button.addEventListener('click', () => {
        [allTasksCount, assignedTasksCount, completedTasksCount].forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

function getActiveCategory() {
    if (allTasksCount.classList.contains('active')) return 'All';
    if (assignedTasksCount.classList.contains('active')) return 'Assigned';
    if (completedTasksCount.classList.contains('active')) return 'Completed';
}
document.getElementById('clearAllButton').addEventListener('click', clearall);
module.exports = {
    todoArrayList,
    add,
    deleteElement,
    editTask,
    renderTasks,
    changeTaskStatus,
    filterTasks,
    clearall,
    displayMessage,
    saveTasksToLocalStorage,
    loadTasksFromLocalStorage,
    updateCategoryHeadings,
    callFunction,
    setInitialActiveButton,
    getActiveCategory
};
