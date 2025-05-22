// Task Tracker Application

// Main data structure to store tasks
let tasks = [];

// DOM Elements
const tasksContainer = document.getElementById('tasks-container');
const newTaskBtn = document.getElementById('new-task-btn');
const newTaskModal = document.getElementById('new-task-modal');
const taskModal = document.getElementById('task-modal');
const newTaskForm = document.getElementById('new-task-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const statusFilter = document.getElementById('status-filter');
const closeBtns = document.querySelectorAll('.close-btn');

// Statuses in correct order
const STATUSES = {
    INVESTIGATION: 'investigation',
    PLANNING: 'planning',
    IN_PROGRESS: 'in-progress',
    IN_TESTING: 'in-testing',
    IN_REVIEW: 'in-review',
    DONE: 'done'
};

// PR checklist items
const PR_CHECKLIST = [
    'Code follows project style guidelines',
    'All tests are passing',
    'Documentation has been updated',
    'Self-review has been completed',
    'No unnecessary debug code or comments',
    'No sensitive information is exposed',
    'Performance considerations have been addressed',
    'Accessibility requirements have been met'
];

// Initialize the app
function init() {
    loadTasksFromStorage();
    renderTasks();
    setupEventListeners();
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('taskTrackerTasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            tasks = [];
        }
    }
}

// Save tasks to localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem('taskTrackerTasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to storage:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // New Task button
    newTaskBtn.addEventListener('click', openNewTaskModal);
    
    // Form submission
    newTaskForm.addEventListener('submit', handleNewTaskSubmit);
    
    // Close modal buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            newTaskModal.style.display = 'none';
            taskModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === newTaskModal) {
            newTaskModal.style.display = 'none';
        }
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });
    
    // Search functionality
    searchButton.addEventListener('click', filterTasks);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterTasks();
        }
    });
    
    // Status filter
    statusFilter.addEventListener('change', filterTasks);
}

// Open new task modal
function openNewTaskModal() {
    newTaskForm.reset();
    newTaskModal.style.display = 'block';
}

// Handle new task form submission
function handleNewTaskSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    
    if (!title || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    const newTask = createTask(title, description);
    tasks.unshift(newTask);
    
    saveTasksToStorage();
    renderTasks();
    
    newTaskModal.style.display = 'none';
}

// Create a new task object
function createTask(title, description) {
    const now = new Date();
    
    return {
        id: generateId(),
        title,
        description,
        created: now,
        status: STATUSES.INVESTIGATION,
        history: [
            {
                status: STATUSES.INVESTIGATION,
                date: now,
                notes: 'Task created'
            }
        ],
        prChecklist: PR_CHECKLIST.map(item => ({
            text: item,
            checked: false
        }))
    };
}

// Generate a unique ID for tasks
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Render all tasks to the container
function renderTasks() {
    // Clear the container
    tasksContainer.innerHTML = '';
    
    // Get filtered tasks
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
}

// Create HTML for a task card
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.id;
    
    const lastHistoryEntry = task.history[task.history.length - 1];
    const formattedDate = new Date(lastHistoryEntry.date).toLocaleDateString();
    
    card.innerHTML = `
        <h3 class="task-title">${task.title}</h3>
        <span class="task-status status-${task.status}">${formatStatus(task.status)}</span>
        <p class="task-description">${task.description}</p>
        <div class="task-date">
            <i class="far fa-calendar-alt"></i> ${formattedDate}
        </div>
    `;
    
    // Add click event to open task details
    card.addEventListener('click', () => openTaskDetails(task.id));
    
    return card;
}

// Render empty state when no tasks exist
function renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    emptyState.innerHTML = `
        <div class="empty-state-icon">
            <i class="fas fa-tasks"></i>
        </div>
        <h3>No tasks found</h3>
        <p class="empty-state-text">Create a new task to get started</p>
        <button class="primary-btn">Create Task</button>
    `;
    
    emptyState.querySelector('button').addEventListener('click', openNewTaskModal);
    
    tasksContainer.appendChild(emptyState);
}

// Open task details modal
function openTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const container = document.getElementById('task-details-container');
    container.innerHTML = generateTaskDetailsHTML(task);
    
    // Set up event listeners for task details
    setupTaskDetailsEvents(task);
    
    taskModal.style.display = 'block';
}

// Generate HTML for task details
function generateTaskDetailsHTML(task) {
    // Format the task history
    const historyHTML = task.history
        .map(entry => {
            const date = new Date(entry.date).toLocaleString();
            return `
                <div class="history-item">
                    <div class="history-status">${formatStatus(entry.status)}</div>
                    <div class="history-date">${date}</div>
                    <div class="history-notes">${entry.notes}</div>
                </div>
            `;
        })
        .join('');
    
    // Determine if we should show the PR checklist
    const showPRChecklist = task.status === STATUSES.IN_REVIEW;
    
    // Generate PR checklist HTML if needed
    const prChecklistHTML = showPRChecklist ? generatePRChecklistHTML(task) : '';
    
    // Generate the status update form
    const statusUpdateForm = generateStatusUpdateForm(task);
    
    // Return the complete HTML
    return `
        <div class="task-details-header">
            <h2 class="task-details-title">${task.title}</h2>
            <span class="task-details-status status-${task.status}">${formatStatus(task.status)}</span>
        </div>
        
        <div class="task-details-description">
            <p>${task.description}</p>
        </div>
        
        ${prChecklistHTML}
        
        ${statusUpdateForm}
        
        <div class="task-history">
            <h3>Task History</h3>
            ${historyHTML}
        </div>
    `;
}

// Generate PR checklist HTML
function generatePRChecklistHTML(task) {
    const checklistItems = task.prChecklist
        .map((item, index) => {
            return `
                <div class="checklist-item">
                    <input type="checkbox" id="pr-item-${index}" data-index="${index}" ${item.checked ? 'checked' : ''}>
                    <label for="pr-item-${index}">${item.text}</label>
                </div>
            `;
        })
        .join('');
    
    return `
        <div class="pr-checklist">
            <h3 class="checklist-title">PR Checklist</h3>
            <div class="checklist-items">
                ${checklistItems}
            </div>
        </div>
    `;
}

// Generate the status update form HTML
function generateStatusUpdateForm(task) {
    // Determine the next possible status
    const nextStatus = getNextStatus(task.status);
    
    // If there's no next status (task is done), don't show the form
    if (!nextStatus) return '';
    
    return `
        <div class="status-update-form">
            <h3>Update Status</h3>
            <p>Current status: <strong>${formatStatus(task.status)}</strong></p>
            
            <div class="form-group">
                <label>Next status: <strong>${formatStatus(nextStatus)}</strong></label>
            </div>
            
            <div class="form-group notes-input">
                <label for="status-notes">Notes (required):</label>
                <textarea id="status-notes" rows="4" required></textarea>
            </div>
            
            <button id="update-status-btn" class="primary-btn" data-next-status="${nextStatus}">
                Update to ${formatStatus(nextStatus)}
            </button>
        </div>
    `;
}

// Set up event listeners for the task details view
function setupTaskDetailsEvents(task) {
    // PR checklist event listeners
    if (task.status === STATUSES.IN_REVIEW) {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const index = parseInt(checkbox.dataset.index);
                task.prChecklist[index].checked = checkbox.checked;
                saveTasksToStorage();
            });
        });
    }
    
    // Status update button
    const updateStatusBtn = document.getElementById('update-status-btn');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', () => {
            updateTaskStatus(task);
        });
    }
}

// Update a task's status
function updateTaskStatus(task) {
    const notesInput = document.getElementById('status-notes');
    const notes = notesInput.value.trim();
    
    if (!notes) {
        alert('Please add notes before updating the status');
        return;
    }
    
    // For In Review status, verify all checklist items are checked
    if (task.status === STATUSES.IN_REVIEW) {
        const allChecked = task.prChecklist.every(item => item.checked);
        if (!allChecked) {
            alert('Please complete all items in the PR checklist before marking as Done');
            return;
        }
    }
    
    const nextStatus = getNextStatus(task.status);
    if (!nextStatus) return;
    
    // Update the task
    task.status = nextStatus;
    task.history.push({
        status: nextStatus,
        date: new Date(),
        notes: notes
    });
    
    // Save and refresh
    saveTasksToStorage();
    renderTasks();
    
    // Close the modal
    taskModal.style.display = 'none';
}

// Get the next status in the workflow
function getNextStatus(currentStatus) {
    const statusOrder = Object.values(STATUSES);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex < statusOrder.length - 1) {
        return statusOrder[currentIndex + 1];
    }
    
    return null; // No next status (task is done)
}

// Filter tasks based on search and status filter
function filterTasks() {
    renderTasks();
}

// Get filtered tasks based on search and status filter
function getFilteredTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    
    return tasks.filter(task => {
        // Filter by status
        if (statusValue !== 'all' && task.status !== statusValue) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm && !taskMatchesSearch(task, searchTerm)) {
            return false;
        }
        
        return true;
    });
}

// Check if a task matches the search term
function taskMatchesSearch(task, searchTerm) {
    const titleMatch = task.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
    
    // Search in notes
    const notesMatch = task.history.some(entry => 
        entry.notes.toLowerCase().includes(searchTerm)
    );
    
    return titleMatch || descriptionMatch || notesMatch;
}

// Format a status code into a readable string
function formatStatus(status) {
    switch (status) {
        case STATUSES.INVESTIGATION:
            return 'Investigation';
        case STATUSES.PLANNING:
            return 'Planning';
        case STATUSES.IN_PROGRESS:
            return 'In Progress';
        case STATUSES.IN_TESTING:
            return 'In Testing';
        case STATUSES.IN_REVIEW:
            return 'In Review';
        case STATUSES.DONE:
            return 'Done';
        default:
            return status;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
