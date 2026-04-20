const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const modalOverlay = $(".modal-overlay");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todoList");
const formTitle = addTaskModal.querySelector(".modal-title");
const submitBtn = addTaskModal.querySelector(".submit-btn");
const searchInput = $(".search-input");
const labelTab = $(".tab-list");

let editIndex = null;

function closeForm() {
  addTaskModal.className = "modal-overlay";

  addTaskModal.querySelector(".modal").scrollTop = 0;

  editIndex = null;
  todoForm.reset();
}

function openForm() {
  addTaskModal.className = "modal-overlay show";
  setTimeout(() => {
    titleInput.focus();
  }, 100);
}

addTaskModal.addEventListener("click", (event) => {
  const outsideClick = !event.target.closest(".modal");

  if (outsideClick) {
    closeForm();
  }
});

addBtn.onclick = openForm;
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

todoForm.onsubmit = (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(todoForm));

  if (editIndex) {
    editTask(editIndex, formData);

    toast({
      title: "Edit",
      message: "Edit task success!",
      type: "info",
      duration: 5000,
    });
  } else {
    formData.isCompleted = false;
    addNewTask(formData);
    renderTask(todoTasks);

    toast({
      title: "Create",
      message: "Create task success!",
      type: "success",
      duration: 5000,
    });
  }

  saveTask();

  todoForm.reset();
  closeForm();

  // Reset về tab "All task"
  buttonTab.forEach((btn) => btn.classList.remove("active"));
  labelTab.querySelector(".all-tab").classList.add("active");

  renderTask(todoTasks);
};

function addNewTask(task) {
  todoTasks.unshift(task);
}

function deleteTask(index) {
  todoTasks.splice(index, 1);
}

function editTask(index, task) {
  todoTasks[index] = task;
}

function saveTask() {
  localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}

todoList.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");

  if (editBtn) {
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];
    editIndex = taskIndex;
    for (const key in task) {
      const value = task[key];
      const input = $(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    }
    if (formTitle) {
      formTitle.textContent = "Edit Task";
    }

    if (submitBtn) {
      submitBtn.textContent = "Save Task";
    }
    openForm();
  }
  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];
    if (confirm(`Are you delete task "${task.title}"?`)) {
      deleteTask(taskIndex);

      toast({
        title: "Delete",
        message: "Delete task success!",
        type: "error",
        duration: 5000,
      });

      renderTask(todoTasks);
      saveTask();
    }
  }
  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index;
    const task = todoTasks[taskIndex];
    task.isCompleted = !task.isCompleted;
    renderTask(todoTasks);
    saveTask();
  }
};

function addTask() {}

function escapeHTML(html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

function renderTask(task) {
  if (!task.length) {
    todoList.innerHTML = `<p>No Task</p>`;
    return;
  }
  const html = task
    .map(
      (task, index) => `
    <div class="task-card ${escapeHTML(task.color)} ${
        task.isCompleted ? "completed" : ""
      }">
      <div class="task-header">
        <h3 class="task-title">${escapeHTML(task.title)}</h3>
        <button class="task-menu">
          <i class="fa-solid fa-ellipsis fa-icon"></i>
          <div class="dropdown-menu">
            <div class="dropdown-item edit-btn" data-index="${index}">
              <i class="fa-solid fa-pen-to-square fa-icon"></i>
              Edit
            </div>
            <div class="dropdown-item complete-btn" data-index="${index}">
              <i class="fa-solid fa-check fa-icon"></i>
              ${task.isCompleted ? "Mark as Active" : "Mark as complete"}
            </div>
            <div class="dropdown-item delete delete-btn" data-index="${index}">
              <i class="fa-solid fa-trash fa-icon"></i>
              Delete
            </div>
          </div>
        </button>
      </div>
      <p class="task-description">
        ${escapeHTML(task.description)}
      </p>
      <div class="task-time">${escapeHTML(task.starttime)} - ${escapeHTML(
        task.endtime
      )}</div>
    </div>
    `
    )
    .join("");
  todoList.innerHTML = html;
}

renderTask(todoTasks);

function toast({ title = "", message = "", type = "info", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
    const toast = document.createElement("div");

    // Auto remove toast
    const autoRemoveId = setTimeout(function () {
      main.removeChild(toast);
    }, duration + 1000);

    // Remove toast when clicked
    toast.onclick = function (e) {
      if (e.target.closest(".toast__close")) {
        main.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };

    const icons = {
      success: "fas fa-check-circle",
      info: "fas fa-info-circle",
      warning: "fas fa-exclamation-circle",
      error: "fas fa-exclamation-circle",
    };

    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);

    toast.classList.add("toast", `toast--${type}`);
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

    toast.innerHTML = `
      <div class="toast__icon">
          <i class="${icon}"></i>
      </div>
      <div class="toast__body">
          <h3 class="toast__title">${title}</h3>
          <p class="toast__msg">${message}</p>
      </div>
      <div class="toast__close">
          <i class="fas fa-times"></i>
      </div>
    `;
    main.appendChild(toast);
  }
}

const buttonTab = labelTab.querySelectorAll(".tab-button");

function filterTasksByTab(tab) {
  switch (tab) {
    case "active":
      renderTask(todoTasks.filter((task) => !task.isCompleted));
      break;
    case "completed":
      renderTask(todoTasks.filter((task) => task.isCompleted));
      break;
    default:
      renderTask(todoTasks);
  }
}

buttonTab.forEach((element) => {
  element.addEventListener("click", () => {
    buttonTab.forEach((btn) => btn.classList.remove("active"));
    element.classList.add("active");

    const tabType = element.dataset.tab;
    filterTasksByTab(tabType);
  });
});

searchInput.addEventListener("focus", () => {
  if (buttonTab.textContent !== "Tất cả Công việc") {
    buttonTab.forEach((btn) => {
      btn.classList.remove("active");
    });
    renderTask(todoTasks);
    labelTab.querySelector(".all-tab").classList.add("active");
  }
});

searchInput.addEventListener("input", (event) => {
  const keyword = event.target.value.trim().toLowerCase();

  if (!keyword) {
    return renderTask(todoTasks);
  }

  const filteredTasks = todoTasks.filter(
    ({ title, description }) =>
      title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
  );

  renderTask(filteredTasks);
});