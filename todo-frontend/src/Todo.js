import { useEffect, useState } from "react";
import './Todo.css';

export default function Todo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const apiUrl = "https://mern-todo-list-m236.onrender.com";
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (title.trim() !== '' && description.trim() !== '') {
            setIsLoading(true);
            fetch(apiUrl + "/todos", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to create');
                return res.json();
            })
            .then((newTodo) => {
                setTodos([...todos, newTodo]);
                setTitle("");
                setDescription("");
                showMessage("Task added successfully!");
            })
            .catch(() => {
                setError("Unable to create task");
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    }

    useEffect(() => {
        getItems();
    }, []);

    const getItems = () => {
        setIsLoading(true);
        fetch(apiUrl + "/todos")
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then((res) => {
                setTodos(res);
            })
            .catch(() => {
                setError("Failed to load tasks");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const handleEdit = (item) => {
        setEditId(item._id); 
        setEditTitle(item.title); 
        setEditDescription(item.description);
    }

    const handleUpdate = () => {
        setError("");
        if (editTitle.trim() !== '' && editDescription.trim() !== '') {
            setIsLoading(true);
            fetch(apiUrl + "/todos/" + editId, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    title: editTitle, 
                    description: editDescription 
                })
            })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update');
                return res.json();
            })
            .then((updatedTodo) => {
                setTodos(todos.map((item) => 
                    item._id === editId ? updatedTodo : item
                ));
                showMessage("Task updated successfully!");
                setEditId(null);
            })
            .catch(() => {
                setError("Unable to update task");
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }

    const handleEditCancel = () => {
        setEditId(null);
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setIsLoading(true);
            fetch(apiUrl + '/todos/' + id, {
                method: "DELETE"
            })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete');
                setTodos(todos.filter((item) => item._id !== id));
                showMessage("Task deleted successfully!");
            })
            .catch(() => {
                setError("Unable to delete task");
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }

    return (
        <div className="todo-app">
            <header className="app-header">
                <h1>Task Master</h1>
                <p>Organize your work and life</p>
            </header>
            
            <main className="app-main">
                {isLoading && <div className="loading-spinner"></div>}
                
                <section className="add-task-section">
                    <h2>Add New Task</h2>
                    {message && <div className="message success">{message}</div>}
                    <form onSubmit={handleSubmit} className="task-form">
                        <div className="form-group">
                            <input
                                placeholder="Task title"
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                type="text"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                placeholder="Description"
                                onChange={(e) => setDescription(e.target.value)}
                                value={description}
                                type="text"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Task'}
                        </button>
                    </form>
                    {error && <div className="message error">{error}</div>}
                </section>

                <section className="tasks-section">
                    <h2>Your Tasks <span className="task-count">({todos.length})</span></h2>
                    
                    {todos.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks yet. Add your first task above!</p>
                        </div>
                    ) : (
                        <ul className="task-list">
                            {todos.map((item) => (
                                <li key={item._id} className={`task-item ${editId === item._id ? 'editing' : ''}`}>
                                    {editId !== item._id ? (
                                        <>
                                            <div className="task-content">
                                                <h3>{item.title}</h3>
                                                <p>{item.description}</p>
                                            </div>
                                            <div className="task-actions">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="action-btn edit-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item._id)}
                                                    className="action-btn delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="edit-form">
                                                <input
                                                    placeholder="Title"
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    value={editTitle}
                                                    type="text"
                                                    required
                                                />
                                                <input
                                                    placeholder="Description"
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    value={editDescription}
                                                    type="text"
                                                    required
                                                />
                                            </div>
                                            <div className="edit-actions">
                                                <button 
                                                    onClick={handleUpdate}
                                                    className="action-btn update-btn"
                                                >
                                                    Update
                                                </button>
                                                <button 
                                                    onClick={handleEditCancel}
                                                    className="action-btn cancel-btn"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}
