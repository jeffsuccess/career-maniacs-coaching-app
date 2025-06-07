import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ActionPlan = () => {
  const navigate = useNavigate();
  
  // State for tasks
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: 1,
        title: 'Update resume with latest experience',
        description: 'Add recent project achievements and update skills section.',
        priority: 'high',
        deadline: '2025-06-10',
        status: 'in-progress',
        progress: 60,
        dependencies: [],
        subtasks: [
          { id: 1, title: 'Update work experience section', completed: true },
          { id: 2, title: 'Add new skills', completed: true },
          { id: 3, title: 'Update project portfolio', completed: false },
          { id: 4, title: 'Proofread and finalize', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Research target companies',
        description: 'Identify 5 companies that align with career goals and values.',
        priority: 'medium',
        deadline: '2025-06-15',
        status: 'not-started',
        progress: 0,
        dependencies: [],
        subtasks: [
          { id: 1, title: 'Create criteria for ideal companies', completed: false },
          { id: 2, title: 'Research company cultures', completed: false },
          { id: 3, title: 'Identify key decision makers', completed: false }
        ]
      }
    ];
  });
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for form
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    status: 'not-started',
    progress: 0,
    dependencies: [],
    subtasks: []
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    search: ''
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState('deadline');
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { 'not-started': 0, 'in-progress': 1, 'completed': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setFilters({ ...filters, [filter]: value });
  };
  
  // Handle sort changes
  const handleSortChange = (value) => {
    setSortBy(value);
  };
  
  // Start editing a task
  const startEditingTask = (task) => {
    setCurrentTask(task);
    setFormData({
      ...task,
      subtasks: task.subtasks || []
    });
    setIsEditing(true);
  };
  
  // Start adding a new task
  const startAddingTask = () => {
    setCurrentTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      deadline: getTodayDateString(),
      status: 'not-started',
      progress: 0,
      dependencies: [],
      subtasks: [{ id: 1, title: '', completed: false }]
    });
    setIsEditing(true);
  };
  
  // Handle form input changes
  const handleFormInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Update progress based on status
    if (field === 'status') {
      if (value === 'completed') {
        setFormData(prev => ({ ...prev, progress: 100 }));
      } else if (value === 'not-started' && formData.progress === 100) {
        setFormData(prev => ({ ...prev, progress: 0 }));
      }
    }
    
    // Update status based on progress
    if (field === 'progress') {
      const numericValue = parseInt(value, 10);
      if (numericValue === 100 && formData.status !== 'completed') {
        setFormData(prev => ({ ...prev, status: 'completed' }));
      } else if (numericValue === 0 && formData.status !== 'not-started') {
        setFormData(prev => ({ ...prev, status: 'not-started' }));
      } else if (numericValue > 0 && numericValue < 100 && formData.status !== 'in-progress') {
        setFormData(prev => ({ ...prev, status: 'in-progress' }));
      }
    }
  };
  
  // Handle subtask changes
  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
    
    // Calculate progress based on completed subtasks
    const totalSubtasks = updatedSubtasks.length;
    const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
    const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : formData.progress;
    
    // Update status based on new progress
    let newStatus = formData.status;
    if (newProgress === 100) {
      newStatus = 'completed';
    } else if (newProgress === 0) {
      newStatus = 'not-started';
    } else {
      newStatus = 'in-progress';
    }
    
    setFormData({ 
      ...formData, 
      subtasks: updatedSubtasks,
      progress: newProgress,
      status: newStatus
    });
  };
  
  // Add a new subtask
  const addSubtask = () => {
    const newId = formData.subtasks.length > 0 ? Math.max(...formData.subtasks.map(st => st.id)) + 1 : 1;
    setFormData({ 
      ...formData, 
      subtasks: [...formData.subtasks, { id: newId, title: '', completed: false }]
    });
  };
  
  // Remove a subtask
  const removeSubtask = (index) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);
    
    // Recalculate progress
    const totalSubtasks = updatedSubtasks.length;
    const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
    const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : formData.progress;
    
    // Update status based on new progress
    let newStatus = formData.status;
    if (newProgress === 100) {
      newStatus = 'completed';
    } else if (newProgress === 0) {
      newStatus = 'not-started';
    } else {
      newStatus = 'in-progress';
    }
    
    setFormData({ 
      ...formData, 
      subtasks: updatedSubtasks,
      progress: newProgress,
      status: newStatus
    });
  };
  
  // Save task
  const saveTask = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a task title.');
      return;
    }
    
    // Remove empty subtasks
    const cleanedSubtasks = formData.subtasks.filter(st => st.title.trim() !== '');
    
    const taskToSave = { 
      ...formData, 
      subtasks: cleanedSubtasks,
      progress: Number(formData.progress) || 0
    };
    
    if (currentTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === currentTask.id ? { ...taskToSave, id: task.id } : task
      );
      setTasks(updatedTasks);
    } else {
      // Add new task
      const newTask = { 
        ...taskToSave, 
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
      };
      setTasks([...tasks, newTask]);
    }
    
    setIsEditing(false);
    setCurrentTask(null);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setCurrentTask(null);
  };
  
  // Delete task
  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
      if (currentTask && currentTask.id === id) {
        setIsEditing(false);
        setCurrentTask(null);
      }
    }
  };
  
  // Update task progress directly
  const updateTaskProgressDirectly = (id, newProgress) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const numericProgress = Number(newProgress) || 0;
        let newStatus = task.status;
        if (numericProgress === 100) {
          newStatus = 'completed';
        } else if (numericProgress === 0) {
          newStatus = 'not-started';
        } else {
          newStatus = 'in-progress';
        }
        return { ...task, progress: numericProgress, status: newStatus };
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  
  // Toggle subtask completion in list view
  const toggleSubtaskCompletionInList = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        
        // Recalculate progress
        const totalSubtasks = updatedSubtasks.length;
        const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
        const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : task.progress;
        
        // Update status based on new progress
        let newStatus = task.status;
        if (newProgress === 100) {
          newStatus = 'completed';
        } else if (newProgress === 0) {
          newStatus = 'not-started';
        } else {
          newStatus = 'in-progress';
        }
        
        return { 
          ...task, 
          subtasks: updatedSubtasks,
          progress: newProgress,
          status: newStatus
        };
      }
      return task;
    }));
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
  // Get days remaining until deadline
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline + 'T00:00:00');
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get color based on priority, status, and deadline
  const getTaskColor = (task) => {
    if (task.status === 'completed') return '#28a745';
    if (task.priority === 'high') return '#dc3545';
    
    const daysRemaining = getDaysRemaining(task.deadline);
    if (daysRemaining !== null) {
      if (daysRemaining < 0) return '#dc3545';
      if (daysRemaining < 3) return '#ffc107';
    }
    
    if (task.priority === 'medium') return '#17a2b8';
    return '#6c757d';
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0AB196', marginBottom: '2rem' }}>Action Plan</h1>
      
      {!isEditing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={filters.priority} 
                onChange={(e) => handleFilterChange('priority', e.target.value)} 
                style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)} 
                style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}
              >
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)} 
                style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={filters.search} 
                onChange={(e) => handleFilterChange('search', e.target.value)} 
                style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px', minWidth: '200px' }}
              />
            </div>
            
            <button 
              onClick={startAddingTask} 
              style={{ 
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)', 
                border: 'none', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                cursor: 'pointer', 
                fontWeight: 'bold' 
              }}
            >
              Add New Task
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {sortedTasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  borderLeft: `4px solid ${getTaskColor(task)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: getTaskColor(task) }}>{task.title}</h3>
                  <span 
                    style={{ 
                      backgroundColor: task.priority === 'high' ? 'rgba(220,53,69,0.2)' : 
                                      task.priority === 'medium' ? 'rgba(23,162,184,0.2)' : 
                                      'rgba(108,117,125,0.2)', 
                      color: task.priority === 'high' ? '#dc3545' : 
                             task.priority === 'medium' ? '#17a2b8' : 
                             '#6c757d',
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '15px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                
                <p style={{ opacity: 0.8, minHeight: '40px' }}>{task.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>Progress: {task.progress}%</span>
                  {task.deadline && (
                    <span style={{ opacity: 0.8 }}>
                      Due: {formatDateForDisplay(task.deadline)} 
                      {getDaysRemaining(task.deadline) !== null && (
                        <span style={{ 
                          color: getDaysRemaining(task.deadline) < 0 ? '#dc3545' : 
                                getDaysRemaining(task.deadline) < 3 ? '#ffc107' : 
                                'inherit'
                        }}>
                          {' '}({getDaysRemaining(task.deadline)} days {getDaysRemaining(task.deadline) < 0 ? 'ago' : 'left'})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div 
                    style={{ 
                      width: `${task.progress}%`, 
                      backgroundColor: getTaskColor(task), 
                      height: '10px', 
                      borderRadius: '5px 0 0 5px', 
                      transition: 'width 0.5s ease' 
                    }} 
                  />
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={task.progress} 
                  onChange={(e) => updateTaskProgressDirectly(task.id, e.target.value)} 
                  style={{ width: '100%', marginBottom: '1rem' }} 
                />
                
                <div style={{ marginBottom: '1rem' }}>
                  <span 
                    style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      backgroundColor: task.status === 'completed' ? 'rgba(40,167,69,0.2)' : 
                                      task.status === 'in-progress' ? 'rgba(23,162,184,0.2)' : 
                                      'rgba(108,117,125,0.2)',
                      color: task.status === 'completed' ? '#28a745' : 
                             task.status === 'in-progress' ? '#17a2b8' : 
                             '#6c757d'
                    }}
                  >
                    {task.status === 'not-started' ? 'Not Started' : 
                     task.status === 'in-progress' ? 'In Progress' : 
                     'Completed'}
                  </span>
                </div>
                
                {task.subtasks && task.subtasks.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4>Subtasks</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {task.subtasks.map(subtask => (
                        <li 
                          key={subtask.id} 
                          onClick={() => toggleSubtaskCompletionInList(task.id, subtask.id)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '0.5rem', 
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '3px',
                            background: subtask.completed ? 'rgba(40,167,69,0.1)' : 'transparent'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={subtask.completed} 
                            readOnly 
                            style={{ marginRight: '0.5rem', accentColor: '#0AB196' }} 
                          />
                          <span style={{ 
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
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => startEditingTask(task)} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      border: 'none', 
                      color: 'white', 
                      padding: '8px 12px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)} 
                    style={{ 
                      background: 'rgba(220,53,69,0.2)', 
                      border: 'none', 
                      color: '#dc3545', 
                      padding: '8px 12px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {sortedTasks.length === 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '2rem', 
              borderRadius: '10px', 
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <p>No tasks found matching your filters.</p>
              <button 
                onClick={() => {
                  setFilters({ priority: 'all', status: 'all', search: '' });
                  setSortBy('deadline');
                }} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '10px' }}>
          <h2>{currentTask ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveTask(); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Title:</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => handleFormInputChange('title', e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }} 
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => handleFormInputChange('description', e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px', 
                  minHeight: '80px' 
                }} 
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Priority:</label>
              <select 
                value={formData.priority} 
                onChange={(e) => handleFormInputChange('priority', e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Deadline:</label>
              <input 
                type="date" 
                value={formData.deadline} 
                onChange={(e) => handleFormInputChange('deadline', e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }} 
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Status:</label>
              <select 
                value={formData.status} 
                onChange={(e) => handleFormInputChange('status', e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Progress: {formData.progress}%</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={formData.progress} 
                onChange={(e) => handleFormInputChange('progress', e.target.value)} 
                style={{ width: '100%' }} 
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4>Subtasks</h4>
              {formData.subtasks.map((subtask, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem' 
                  }}
                >
                  <input 
                    type="text" 
                    placeholder="Subtask title" 
                    value={subtask.title} 
                    onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)} 
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      color: 'white', 
                      border: '1px solid #555', 
                      borderRadius: '5px' 
                    }} 
                  />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={subtask.completed} 
                      onChange={(e) => handleSubtaskChange(index, 'completed', e.target.checked)} 
                      style={{ marginRight: '0.3rem', accentColor: '#0AB196' }} 
                    /> 
                    Done
                  </label>
                  <button 
                    type="button" 
                    onClick={() => removeSubtask(index)} 
                    style={{ 
                      background: 'rgba(220,53,69,0.2)', 
                      border: 'none', 
                      color: '#dc3545', 
                      padding: '0.5rem', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addSubtask} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  marginTop: '0.5rem' 
                }}
              >
                Add Subtask
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={cancelEditing} 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid #555', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ 
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
