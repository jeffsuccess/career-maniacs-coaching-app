import React, { useState, useEffect } from 'react';

const ActionPlan = () => {
  // Sample tasks data
  const [tasks, setTasks] = useState([
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
    },
    {
      id: 3,
      title: 'Prepare for interviews',
      description: 'Practice common interview questions and prepare stories using ABT framework.',
      priority: 'high',
      deadline: '2025-06-20',
      status: 'not-started',
      progress: 0,
      dependencies: [1],
      subtasks: [
        { id: 1, title: 'Research common interview questions', completed: false },
        { id: 2, title: 'Prepare 5 stories using ABT framework', completed: false },
        { id: 3, title: 'Schedule mock interview', completed: false },
        { id: 4, title: 'Practice technical questions', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Apply to target companies',
      description: 'Submit applications to the 5 identified companies.',
      priority: 'medium',
      deadline: '2025-06-25',
      status: 'blocked',
      progress: 0,
      dependencies: [1, 2],
      subtasks: [
        { id: 1, title: 'Customize resume for each company', completed: false },
        { id: 2, title: 'Write tailored cover letters', completed: false },
        { id: 3, title: 'Submit applications', completed: false },
        { id: 4, title: 'Follow up after one week', completed: false }
      ]
    }
  ]);
  
  // Mindset techniques for dependencies
  const mindsetTechniques = [
    { id: 'neuroplasticity', title: 'Neuroplasticity: Rewire or Retire' },
    { id: 'anchoring', title: 'State-Dependent Learning "Anchoring"' },
    { id: 'microWins', title: 'Dopamine-Driven Micro Wins' },
    { id: 'primeProgramming', title: 'Prime Time Mind Programming' }
  ];
  
  // State for filters and sorting
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  
  const [sortBy, setSortBy] = useState('deadline');
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    dependencies: [],
    subtasks: []
  });
  
  // State for custom dependency
  const [customDependency, setCustomDependency] = useState('');
  
  // State for dependency visualization
  const [showDependencyMap, setShowDependencyMap] = useState(false);
  
  // Effect to update task status based on subtasks
  useEffect(() => {
    const updatedTasks = tasks.map(task => {
      // Skip if no subtasks
      if (!task.subtasks || task.subtasks.length === 0) {
        return task;
      }
      
      // Calculate progress based on completed subtasks
      const totalSubtasks = task.subtasks.length;
      const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
      const newProgress = Math.round((completedSubtasks / totalSubtasks) * 100);
      
      // Determine status based on progress
      let newStatus = task.status;
      if (newProgress === 100) {
        newStatus = 'completed';
      } else if (newProgress > 0) {
        // Check if task is blocked by dependencies
        const isBlocked = task.dependencies.some(depId => {
          const depTask = tasks.find(t => t.id === depId);
          return depTask && depTask.status !== 'completed';
        });
        
        newStatus = isBlocked ? 'blocked' : 'in-progress';
      } else {
        // Check if task is blocked by dependencies
        const isBlocked = task.dependencies.some(depId => {
          const depTask = tasks.find(t => t.id === depId);
          return depTask && depTask.status !== 'completed';
        });
        
        newStatus = isBlocked ? 'blocked' : 'not-started';
      }
      
      // Only update if something changed
      if (newProgress !== task.progress || newStatus !== task.status) {
        return { ...task, progress: newProgress, status: newStatus };
      }
      
      return task;
    });
    
    setTasks(updatedTasks);
  }, [tasks]);
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    
    return true;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { 'blocked': 1, 'not-started': 2, 'in-progress': 3, 'completed': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });
  
  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setFilters({
      ...filters,
      [filter]: value
    });
  };
  
  // Handle sort changes
  const handleSortChange = (value) => {
    setSortBy(value);
  };
  
  // Start editing task
  const startEditingTask = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline,
      dependencies: task.dependencies,
      subtasks: task.subtasks
    });
    setIsEditing(true);
  };
  
  // Start adding new task
  const startAddingTask = () => {
    setCurrentTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      dependencies: [],
      subtasks: [{ id: 1, title: '', completed: false }]
    });
    setIsEditing(true);
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle subtask changes
  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks
    });
  };
  
  // Add subtask
  const addSubtask = () => {
    const newId = formData.subtasks.length > 0 ? 
      Math.max(...formData.subtasks.map(st => st.id)) + 1 : 1;
    
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { id: newId, title: '', completed: false }]
    });
  };
  
  // Remove subtask
  const removeSubtask = (index) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks
    });
  };
  
  // Toggle dependency
  const toggleDependency = (taskId) => {
    // Don't allow self-dependency
    if (currentTask && currentTask.id === taskId) {
      return;
    }
    
    const updatedDependencies = [...formData.dependencies];
    const index = updatedDependencies.indexOf(taskId);
    
    if (index === -1) {
      updatedDependencies.push(taskId);
    } else {
      updatedDependencies.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      dependencies: updatedDependencies
    });
  };
  
  // Add custom dependency
  const addCustomDependency = () => {
    if (customDependency.trim() === '') {
      return;
    }
    
    // Check if it's already in the dependencies
    if (formData.dependencies.includes(customDependency)) {
      alert('This dependency is already added.');
      return;
    }
    
    setFormData({
      ...formData,
      dependencies: [...formData.dependencies, customDependency]
    });
    
    setCustomDependency('');
  };
  
  // Remove custom dependency
  const removeCustomDependency = (dependency) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter(dep => dep !== dependency)
    });
  };
  
  // Save task
  const saveTask = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a task title.');
      return;
    }
    
    if (currentTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === currentTask.id ? 
          { 
            ...task, 
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            deadline: formData.deadline,
            dependencies: formData.dependencies,
            subtasks: formData.subtasks
          } : 
          task
      );
      
      setTasks(updatedTasks);
    } else {
      // Create new task
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
        status: 'not-started',
        progress: 0,
        dependencies: formData.dependencies,
        subtasks: formData.subtasks
      };
      
      setTasks([...tasks, newTask]);
    }
    
    setIsEditing(false);
  };
  
  // Delete task
  const deleteTask = () => {
    if (currentTask && window.confirm('Are you sure you want to delete this task?')) {
      // Check if any tasks depend on this one
      const dependentTasks = tasks.filter(task => task.dependencies.includes(currentTask.id));
      
      if (dependentTasks.length > 0) {
        const dependentTaskNames = dependentTasks.map(task => `"${task.title}"`).join(', ');
        alert(`Cannot delete this task because the following tasks depend on it: ${dependentTaskNames}`);
        return;
      }
      
      setTasks(tasks.filter(task => task.id !== currentTask.id));
      setIsEditing(false);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // Toggle subtask completion
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => {
          if (subtask.id === subtaskId) {
            return { ...subtask, completed: !subtask.completed };
          }
          return subtask;
        });
        
        return { ...task, subtasks: updatedSubtasks };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };
  
  // Update progress manually
  const updateProgressManually = (taskId, newProgress) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        // Update status based on new progress
        let newStatus = task.status;
        if (newProgress === 100) {
          newStatus = 'completed';
        } else if (newProgress > 0) {
          newStatus = isTaskBlocked(task) ? 'blocked' : 'in-progress';
        } else {
          newStatus = isTaskBlocked(task) ? 'blocked' : 'not-started';
        }
        
        return { ...task, progress: newProgress, status: newStatus };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get days until deadline
  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'in-progress':
        return '#007bff';
      case 'not-started':
        return '#6c757d';
      case 'blocked':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#fd7e14';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  };
  
  // Get dependency names
  const getDependencyNames = (dependencies) => {
    return dependencies.map(depId => {
      // Check if it's a task ID (number)
      if (typeof depId === 'number') {
        const task = tasks.find(t => t.id === depId);
        return task ? task.title : `Task #${depId}`;
      }
      
      // Check if it's a mindset technique ID (string)
      const technique = mindsetTechniques.find(t => t.id === depId);
      if (technique) {
        return technique.title;
      }
      
      // Otherwise it's a custom dependency
      return depId;
    });
  };
  
  // Check if a task is blocked by dependencies
  const isTaskBlocked = (task) => {
    return task.dependencies.some(depId => {
      // Only check task dependencies (numbers), not custom or mindset dependencies
      if (typeof depId === 'number') {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'completed';
      }
      return false;
    });
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
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
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Track and manage your career action items, set priorities, and monitor dependencies.</p>
      </div>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="all">All</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Priority:</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowDependencyMap(!showDependencyMap)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showDependencyMap ? 'Hide Dependencies' : 'Show Dependencies'}
          </button>
          
          <button 
            onClick={startAddingTask}
            style={{
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Add Task
          </button>
        </div>
      </div>
      
      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <div 
              key={task.id}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: isEditing && currentTask?.id === task.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onClick={() => !isEditing && startEditingTask(task)}
            >
              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ margin: 0 }}>{task.title}</h2>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <div style={{ 
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(task.status)}
                    </div>
                    <div style={{ 
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </div>
                  </div>
                </div>
                
                <p style={{ marginBottom: '1rem' }}>{task.description}</p>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '10px',
                    height: '8px'
                  }}>
                    <div style={{ 
                      width: `${task.progress}%`, 
                      backgroundColor: getStatusColor(task.status),
                      borderRadius: '10px',
                      height: '100%'
                    }} />
                  </div>
                </div>
                
                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Subtasks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {task.subtasks.map(subtask => (
                        <div 
                          key={subtask.id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubtaskCompletion(task.id, subtask.id);
                          }}
                        >
                          <div style={{ 
                            width: '18px', 
                            height: '18px', 
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderRadius: '3px',
                            backgroundColor: subtask.completed ? '#28a745' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            {subtask.completed && (
                              <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>
                            )}
                          </div>
                          <span style={{ 
                            textDecoration: subtask.completed ? 'line-through' : 'none',
                            opacity: subtask.completed ? 0.7 : 1
                          }}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Dependencies */}
                {task.dependencies.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Dependencies</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {getDependencyNames(task.dependencies).map((name, index) => (
                        <div 
                          key={index}
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Deadline */}
                {task.deadline && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    <span>Deadline: {formatDate(task.deadline)}</span>
                    {getDaysUntilDeadline(task.deadline) > 0 ? (
                      <span>({getDaysUntilDeadline(task.deadline)} days remaining)</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>(Overdue)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p>No tasks match your current filters. Try adjusting your filters or add a new task.</p>
          </div>
        )}
      </div>
      
      {/* Task Form Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e2a38',
            borderRadius: '10px',
            padding: '2rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>{currentTask ? 'Edit Task' : 'Add New Task'}</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
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
            
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority:</label>
                <select
                  value={formData.priority}
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
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline:</label>
                <input 
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
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
            </div>
            
            {/* Dependencies */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dependencies:</label>
              
              {/* Task Dependencies */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Task Dependencies:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tasks
                    .filter(task => !currentTask || task.id !== currentTask.id)
                    .map(task => (
                      <div 
                        key={task.id}
                        onClick={() => toggleDependency(task.id)}
                        style={{ 
                          backgroundColor: formData.dependencies.includes(task.id) ? 
                            'rgba(10,177,150,0.3)' : 'rgba(255,255,255,0.1)',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          border: formData.dependencies.includes(task.id) ?
                            '1px solid rgba(10,177,150,0.5)' : '1px solid transparent'
                        }}
                      >
                        {task.title}
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Mindset Technique Dependencies */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Mindset Technique Dependencies:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {mindsetTechniques.map(technique => (
                    <div 
                      key={technique.id}
                      onClick={() => toggleDependency(technique.id)}
                      style={{ 
                        backgroundColor: formData.dependencies.includes(technique.id) ? 
                          'rgba(10,177,150,0.3)' : 'rgba(255,255,255,0.1)',
                        padding: '4px 8px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: formData.dependencies.includes(technique.id) ?
                          '1px solid rgba(10,177,150,0.5)' : '1px solid transparent'
                      }}
                    >
                      {technique.title}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Custom Dependencies */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Add Custom Dependency:</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text"
                    value={customDependency}
                    onChange={(e) => setCustomDependency(e.target.value)}
                    placeholder="Enter custom dependency"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                  <button
                    onClick={addCustomDependency}
                    style={{
                      background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                
                {/* Display Custom Dependencies */}
                {formData.dependencies.filter(dep => typeof dep === 'string' && !mindsetTechniques.some(t => t.id === dep)).length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {formData.dependencies
                        .filter(dep => typeof dep === 'string' && !mindsetTechniques.some(t => t.id === dep))
                        .map((dep, index) => (
                          <div 
                            key={index}
                            style={{ 
                              backgroundColor: 'rgba(10,177,150,0.3)',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              border: '1px solid rgba(10,177,150,0.5)'
                            }}
                          >
                            <span>{dep}</span>
                            <button
                              onClick={() => removeCustomDependency(dep)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '0.8rem',
                                opacity: 0.7
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtasks */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label>Subtasks:</label>
                <button 
                  onClick={addSubtask}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Add Subtask
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.subtasks.map((subtask, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2px solid rgba(255,255,255,0.5)',
                      borderRadius: '3px',
                      backgroundColor: subtask.completed ? '#28a745' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSubtaskChange(index, 'completed', !subtask.completed)}
                    >
                      {subtask.completed && (
                        <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>
                      )}
                    </div>
                    <input 
                      type="text"
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={() => removeSubtask(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,82,82,0.8)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Manual Progress Adjustment */}
            {currentTask && (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Manual Progress Adjustment:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTask.progress}
                    onChange={(e) => updateProgressManually(currentTask.id, parseInt(e.target.value))}
                    style={{ flexGrow: 1 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentTask.progress}
                      onChange={(e) => updateProgressManually(currentTask.id, parseInt(e.target.value))}
                      style={{
                        width: '60px',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {currentTask && (
                  <button 
                    onClick={deleteTask}
                    style={{
                      background: 'rgba(255,82,82,0.2)',
                      border: '1px solid rgba(255,82,82,0.5)',
                      color: 'rgba(255,82,82,0.8)',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Task
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={cancelEditing}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                
                <button 
                  onClick={saveTask}
                  style={{
                    background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dependency Map Modal */}
      {showDependencyMap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e2a38',
            borderRadius: '10px',
            padding: '2rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0 }}>Task Dependencies</h2>
              <button 
                onClick={() => setShowDependencyMap(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <p>This diagram shows the dependencies between your tasks. Tasks with dependencies cannot be completed until their dependent tasks are finished.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {tasks.map(task => (
                <div 
                  key={task.id}
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    borderRadius: '10px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{task.title}</h3>
                    <div style={{ 
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(task.status)}
                    </div>
                  </div>
                  
                  {task.dependencies.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Depends on:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {getDependencyNames(task.dependencies).map((name, index) => (
                          <div 
                            key={index}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              fontSize: '0.9rem'
                            }}
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>No dependencies</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
