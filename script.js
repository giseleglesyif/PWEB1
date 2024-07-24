document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const filterButton = document.getElementById('filter-button');
    const userFilter = document.getElementById('user-filter');

    // Variável para armazenar as tarefas locais
    let localTasks = [];

    // Função para buscar tarefas da API
    const fetchTasks = async (userId) => {
        try {
            const url = userId ? `https://jsonplaceholder.typicode.com/todos?userId=${userId}` : 'https://jsonplaceholder.typicode.com/todos';
            const response = await fetch(url);
            const tasks = await response.json();
            console.log('Tasks fetched:', tasks); // Debug

            // Filtrar tarefas locais pelo userId
            const filteredLocalTasks = userId ? localTasks.filter(task => task.userId == userId) : localTasks;
            
            // Combinar tarefas da API com as tarefas locais
            const combinedTasks = [...tasks, ...filteredLocalTasks];
            displayTasks(combinedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Função para exibir as tarefas na lista
    const displayTasks = (tasks) => {
        taskList.innerHTML = ''; // Limpa a lista
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.dataset.id = task.id;
            taskItem.innerHTML = `
                <span>${task.title} ${task.completed ? '(Concluída)' : ''}</span>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Excluir</button>
            `;
            taskList.appendChild(taskItem);
        });

        // Adiciona event listeners para botões de editar e excluir
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.parentElement.dataset.id;
                console.log('Edit button clicked for task:', taskId); // Debug
                editTask(taskId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.parentElement.dataset.id;
                console.log('Delete button clicked for task:', taskId); // Debug
                deleteTask(taskId, e.target.parentElement);
            });
        });
    };

    // Função para lidar com o envio do formulário
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const userId = document.getElementById('user-id').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const completed = document.getElementById('completed').value === 'true';

        const newTask = {
            id: Date.now(), // Gerar um ID único para a tarefa local
            userId: Number(userId),
            title,
            completed
        };

        console.log('Adding new task:', newTask); // Debug

        // Adiciona a nova tarefa à lista local
        localTasks.push(newTask);

        // Adicionar a nova tarefa diretamente à lista
        addTaskToDOM(newTask);
    });

    // Função para adicionar uma tarefa ao DOM
    const addTaskToDOM = (task) => {
        const taskItem = document.createElement('li');
        taskItem.dataset.id = task.id;
        taskItem.innerHTML = `
            <span>${task.title} ${task.completed ? '(Concluída)' : ''}</span>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Excluir</button>
        `;
        taskList.appendChild(taskItem);

        // Adiciona event listeners para botões de editar e excluir
        taskItem.querySelector('.edit-btn').addEventListener('click', () => {
            editTask(task.id);
        });

        taskItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id, taskItem);
        });
    };

    // Função para editar uma tarefa
    const editTask = async (id) => {
        const newTitle = prompt('Digite o novo título:');
        const newCompleted = confirm('A tarefa está concluída?');
        if (newTitle !== null) {
            console.log('Editing task:', id, 'New title:', newTitle, 'New completed status:', newCompleted); // Debug
            
            // Verificar se a tarefa é local ou da API
            const taskIndex = localTasks.findIndex(task => task.id == id);
            if (taskIndex !== -1) {
                // Editar tarefa local
                localTasks[taskIndex].title = newTitle;
                localTasks[taskIndex].completed = newCompleted;
                updateTaskInDOM(id, newTitle, newCompleted);
            } else {
                // Editar tarefa da API
                try {
                    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title: newTitle, completed: newCompleted })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to edit task');
                    }

                    const updatedTask = await response.json();
                    console.log('Task updated:', updatedTask); // Debug
                    updateTaskInDOM(id, updatedTask.title, updatedTask.completed);
                } catch (error) {
                    console.error('Error editing task:', error);
                }
            }
        }
    };

    // Função para atualizar a tarefa no DOM
    const updateTaskInDOM = (id, newTitle, completed) => {
        const taskItem = document.querySelector(`li[data-id='${id}']`);
        taskItem.querySelector('span').textContent = `${newTitle} ${completed ? '(Concluída)' : ''}`;
    };

    // Função para excluir uma tarefa
    const deleteTask = async (id, taskElement) => {
        console.log('Deleting task:', id); // Debug
        
        // Verificar se a tarefa é local ou da API
        const taskIndex = localTasks.findIndex(task => task.id == id);
        if (taskIndex !== -1) {
            // Excluir tarefa local
            localTasks.splice(taskIndex, 1);
            taskElement.remove(); // Remove o elemento da tarefa do DOM
        } else {
            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }

                console.log('Task deleted:', id); // Debug
                taskElement.remove(); // Remove o elemento da tarefa do DOM
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    // Event listener para o botão de filtrar
    filterButton.addEventListener('click', () => {
        const userId = userFilter.value;
        fetchTasks(userId);
    });

    // Buscar tarefas inicialmente
    fetchTasks();
});
