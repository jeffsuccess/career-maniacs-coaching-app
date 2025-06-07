import React, { useState, useEffect } from 'react';

const ActionPlan = () => {
  // State for tasks
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  // State for new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'not_started',
    linkedGoalId: '',
    subtasks: []
  });
  
  // State for new subtask
  const [newSubtask, setNewSubtask] = useState('');
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    sortBy: 'dueDate'
  });
  
  // State for goals (for linking)
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Load goals from localStorage
  useEffect(() => {
    const loadGoals = () => {
      const savedGoals = localStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    };
    
    loadGoals();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', loadGoals);
    
    return () => {
      window.removeEventListener('storage', loadGoals);
    };
  }, []);
  
  // Handle input changes for new task
  const handleInputChange = (field, value) => {
    setNewTask({
      ...newTask,
      [field]: value
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Add subtask
  const addSubtask = () => {
    if (newSubtask.trim() === '') return;
    
    setNewTask({
      ...newTask,
      subtasks: [
        ...newTask.subtasks,
        { id: Date.now().toString(), title: newSubtask, completed: false }
      ]
    });
    
    setNewSubtask('');
  };
  
  // Remove subtask
  const removeSubtask = (id) => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter(subtask => subtask.id !== id)
    });
  };
  
  // Toggle subtask completion
  const toggleSubtaskCompletion = (id) => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      )
    });
  };
  
  // Save task
  const saveTask = () => {
    if (newTask.title.trim() === '') {
      alert('Please enter a task title.');
      return;
    }
    
    if (isEditing && currentTaskIndex !== null) {
      // Update existing task
      const updatedTasks = [...tasks];
      updatedTasks[currentTaskIndex] = {
        ...newTask,
        updatedAt: new Date().toISOString()
      };
      setTasks(updatedTasks);
    } else {
      // Add new task
      setTasks([
        ...tasks,
        {
          ...newTask,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'not_started',
      linkedGoalId: '',
      subtasks: []
    });
    setIsEditing(false);
    setCurrentTaskIndex(null);
  };
  
  // Edit task
  const editTask = (index) => {
    setNewTask(tasks[index]);
    setIsEditing(true);
    setCurrentTaskIndex(index);
  };
  
  // Delete task
  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
      
      if (isEditing && tasks[currentTaskIndex].id === id) {
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          status: 'not_started',
          linkedGoalId: '',
          subtasks: []
        });
        setIsEditing(false);
        setCurrentTaskIndex(null);
      }
    }
  };
  
  // Update task status
  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
    ));
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'not_started',
      linkedGoalId: '',
      subtasks: []
    });
    setIsEditing(false);
    setCurrentTaskIndex(null);
  };
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    // Search term filter
    if (filters.searchTerm && 
        !(task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
          task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { not_started: 0, in_progress: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate + 'T00:00:00');
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      default:
        return priority;
    }
  };
  
  // Get linked goal title
  const getLinkedGoalTitle = (goalId) => {
    if (!goalId) return null;
    
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : null;
  };
  
  // Calculate task completion percentage
  const getTaskCompletionPercentage = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === 'completed' ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Action Plan
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Task Form */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          height: 'fit-content'
        }}>
          <h2>{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
            <input 
              type="text" 
              value={newTask.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Task title"
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
            <textarea 
              value={newTask.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Task description"
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date:</label>
            <input 
              type="date" 
              value={newTask.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority:</label>
            <select
              value={newTask.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status:</label>
            <select
              value={newTask.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {goals.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Link to Goal:</label>
              <select
                value={newTask.linkedGoalId}
                onChange={(e) => handleInputChange('linkedGoalId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              >
                <option value="">None</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Subtasks:</label>
            <div style={{ 
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <input 
                type="text" 
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <button 
                onClick={addSubtask}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            
            {newTask.subtasks.length > 0 ? (
              <ul style={{ 
                listStyleType: 'none',
                padding: 0,
                margin: 0
              }}>
                {newTask.subtasks.map(subtask => (
                  <li 
                    key={subtask.id}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.5rem',
                      borderRadius: '5px'
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtaskCompletion(subtask.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      flex: 1,
                      textDecoration: subtask.completed ? 'line-through' : 'none',
                      opacity: subtask.completed ? 0.7 : 1
                    }}>
                      {subtask.title}
                    </span>
                    <button 
                      onClick={() => removeSubtask(subtask.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px'
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ 
                color: 'rgba(255,255,255,0.5)',
                margin: '0',
                fontSize: '0.9rem'
              }}>
                No subtasks added yet.
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={saveTask}
              style={{
                flex: 1,
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isEditing ? 'Update Task' : 'Add Task'}
            </button>
            
            {isEditing && (
              <button 
                onClick={cancelEditing}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* Tasks List */}
        <div>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>Filters</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Search:</label>
                <input 
                  type="text" 
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search tasks..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority:</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sort By:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>
          
          <h2>Tasks ({filteredTasks.length})</h2>
          
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div 
                key={task.id}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '10px',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        backgroundColor: 
                          task.status === 'completed' ? 'rgba(40,167,69,0.2)' :
                          task.status === 'in_progress' ? 'rgba(255,193,7,0.2)' :
                          'rgba(255,255,255,0.1)',
                        color: 
                          task.status === 'completed' ? '#28a745' :
                          task.status === 'in_progress' ? '#ffc107' :
                          'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        fontSize: '0.8rem'
                      }}>
                        {getStatusLabel(task.status)}
                      </span>
                      
                      <span style={{ 
                        backgroundColor: 
                          task.priority === 'high' ? 'rgba(220,53,69,0.2)' :
                          task.priority === 'medium' ? 'rgba(255,193,7,0.2)' :
                          'rgba(40,167,69,0.2)',
                        color: 
                          task.priority === 'high' ? '#dc3545' :
                          task.priority === 'medium' ? '#ffc107' :
                          '#28a745',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        fontSize: '0.8rem'
                      }}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      
                      {task.dueDate && (
                        <span style={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          Due: {formatDate(task.dueDate)}
                          {getDaysRemaining(task.dueDate) !== null && (
                            <span style={{ 
                              backgroundColor: 
                                getDaysRemaining(task.dueDate) < 0 ? 'rgba(220,53,69,0.2)' :
                                getDaysRemaining(task.dueDate) === 0 ? 'rgba(255,193,7,0.2)' :
                                getDaysRemaining(task.dueDate) <= 3 ? 'rgba(255,193,7,0.2)' :
                                'rgba(40,167,69,0.2)',
                              color: 
                                getDaysRemaining(task.dueDate) < 0 ? '#dc3545' :
                                getDaysRemaining(task.dueDate) === 0 ? '#ffc107' :
                                getDaysRemaining(task.dueDate) <= 3 ? '#ffc107' :
                                '#28a745',
                              padding: '0.1rem 0.25rem',
                              borderRadius: '3px',
                              fontSize: '0.7rem',
                              marginLeft: '0.25rem'
                            }}>
                              {getDaysRemaining(task.dueDate) < 0 ? 
                                `${Math.abs(getDaysRemaining(task.dueDate))} days overdue` :
                                getDaysRemaining(task.dueDate) === 0 ?
                                'Today' :
                                `${getDaysRemaining(task.dueDate)} days left`}
                            </span>
                          )}
                        </span>
                      )}
                      
                      {getLinkedGoalTitle(task.linkedGoalId) && (
                        <span style={{ 
                          backgroundColor: 'rgba(10,177,150,0.2)',
                          color: '#0AB196',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          fontSize: '0.8rem'
                        }}>
                          Goal: {getLinkedGoalTitle(task.linkedGoalId)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => editTask(tasks.indexOf(task))}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      style={{
                        backgroundColor: 'rgba(220,53,69,0.2)',
                        border: 'none',
                        color: '#dc3545',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <div style={{ 
                    marginBottom: '1rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {task.description}
                  </div>
                )}
                
                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>Progress:</span>
                    <span style={{ fontSize: '0.9rem' }}>{getTaskCompletionPercentage(task)}%</span>
                  </div>
                  <div style={{ 
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%',
                      width: `${getTaskCompletionPercentage(task)}%`,
                      backgroundColor: '#0AB196',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
                
                {/* Status change buttons */}
                {task.status !== 'completed' && (
                  <div style={{ 
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: task.subtasks && task.subtasks.length > 0 ? '1rem' : 0
                  }}>
                    {task.status === 'not_started' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        style={{
                          backgroundColor: 'rgba(255,193,7,0.2)',
                          border: 'none',
                          color: '#ffc107',
                          padding: '0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Start Task
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        style={{
                          backgroundColor: 'rgba(40,167,69,0.2)',
                          border: 'none',
                          color: '#28a745',
                          padding: '0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Complete Task
                      </button>
                    )}
                  </div>
                )}
                
                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div>
                    <p style={{ 
                      margin: '0 0 0.5rem 0',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      Subtasks:
                    </p>
                    <ul style={{ 
                      listStyleType: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {task.subtasks.map(subtask => (
                        <li 
                          key={subtask.id}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '0.5rem',
                            borderRadius: '5px'
                          }}
                        >
                          <span style={{ 
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: subtask.completed ? '#28a745' : 'rgba(255,255,255,0.2)',
                            flexShrink: 0
                          }} />
                          <span style={{ 
                            flex: 1,
                            textDecoration: subtask.completed ? 'line-through' : 'none',
                            opacity: subtask.completed ? 0.7 : 1
                          }}>
                            {subtask.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p>No tasks found. Add your first task to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
