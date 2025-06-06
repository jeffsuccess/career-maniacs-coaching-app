import React, { useState, useEffect } from 'react';

const ActionPlan = () => {
  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for goals
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [
      {
        id: 1,
        title: 'Land a senior product manager role',
        category: 'Career',
        description: 'Secure a senior product manager position at a tech company that aligns with my values.',
        deadline: '2025-12-31',
        progress: 35
      },
      {
        id: 2,
        title: 'Develop public speaking skills',
        category: 'Professional Development',
        description: 'Become a confident and effective public speaker for industry conferences and team presentations.',
        deadline: '2025-09-30',
        progress: 20
      },
      {
        id: 3,
        title: 'Improve work-life balance',
        category: 'Personal',
        description: 'Create healthier boundaries between work and personal life.',
        deadline: '2025-08-15',
        progress: 50
      }
    ];
  });

  // Sample tasks data
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
        ],
        goalId: 1
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
        ],
        goalId: 1
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
        ],
        goalId: 1
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
        ],
        goalId: 1
      }
    ];
  });
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for filters and sorting
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    goal: 'all'
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
    status: 'not-started',
    progress: 0,
    dependencies: [],
    subtasks: [],
    goalId: null
  });
  
  // State for progress update feedback
  const [progressUpdateFeedback, setProgressUpdateFeedback] = useState({
    show: false,
    taskId: null,
    message: ''
  });
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    
    if (filters.goal !== 'all' && task.goalId !== parseInt(filters.goal)) {
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
        const statusOrder = { 'not-started': 1, 'in-progress': 2, 'blocked': 3, 'completed': 4 };
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
      status: task.status,
      progress: task.progress,
      dependencies: task.dependencies || [],
      subtasks: task.subtasks || [],
      goalId: task.goalId
    });
    setIsEditing(true);
  };
  
  // Start adding new task
  const startAddingTask = () => {
    setCurrentTask(null);
    // Get current date in ISO format with proper timezone handling
    const today = getTodayDateString();
    
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      deadline: today,
      status: 'not-started',
      progress: 0,
      dependencies: [],
      subtasks: [{ id: 1, title: '', completed: false }],
      goalId: null
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
  
  // Handle progress slider change
  const handleProgressSliderChange = (value) => {
    const newProgress = parseInt(value, 10);
    setFormData(prevFormData => ({
      ...prevFormData,
      progress: newProgress
    }));
  };
  
  // Handle subtask changes
  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      [field]: value
    };
    
    // If we're changing completion status, recalculate progress
    if (field === 'completed') {
      const totalSubtasks = updatedSubtasks.length;
      const completedSubtasks = updatedSubtasks.filter(s => s.completed).length;
      const newProgress = Math.round((completedSubtasks / totalSubtasks) * 100);
      
      setFormData({
        ...formData,
        subtasks: updatedSubtasks,
        progress: newProgress
      });
    } else {
      setFormData({
        ...formData,
        subtasks: updatedSubtasks
      });
    }
  };
  
  // Add subtask
  const addSubtask = () => {
    const newId = formData.subtasks.length > 0 ? 
      Math.max(...formData.subtasks.map(s => s.id)) + 1 : 1;
    
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { id: newId, title: '', completed: false }]
    });
  };
  
  // Remove subtask
  const removeSubtask = (index) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);
    
    // Recalculate progress after removing subtask
    const totalSubtasks = updatedSubtasks.length;
    const completedSubtasks = updatedSubtasks.filter(s => s.completed).length;
    const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : formData.progress;
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks,
      progress: newProgress
    });
  };
  
  // Add dependency
  const addDependency = (taskId) => {
    if (!formData.dependencies.includes(taskId)) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, taskId]
      });
    }
  };
  
  // Remove dependency
  const removeDependency = (taskId) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter(id => id !== taskId)
    });
  };
  
  // Save task
  const saveTask = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a task title.');
      return;
    }
    
    // Validate subtasks
    const emptySubtasks = formData.subtasks.filter(s => s.title.trim() === '');
    if (emptySubtasks.length > 0) {
      alert('Please enter titles for all subtasks or remove empty ones.');
      return;
    }
    
    // Ensure progress is a number
    const taskToSave = {
      ...formData,
      progress: Number(formData.progress) || 0
    };
    
    if (currentTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === currentTask.id ? { ...taskToSave, id: task.id } : task
      );
      setTasks(updatedTasks);
    } else {
      // Create new task
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
  
  // Update task status
  const updateTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        // If marking as completed, set progress to 100% and all subtasks to completed
        if (newStatus === 'completed' && task.status !== 'completed') {
          const updatedSubtasks = task.subtasks.map(subtask => ({
            ...subtask,
            completed: true
          }));
          
          return {
            ...task,
            status: newStatus,
            progress: 100,
            subtasks: updatedSubtasks
          };
        }
        
        // If changing from completed to another status, adjust progress based on subtasks
        if (task.status === 'completed' && newStatus !== 'completed') {
          const totalSubtasks = task.subtasks.length;
          const completedSubtasks = task.subtasks.filter(s => s.completed).length;
          const newProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : task.progress;
          
          return {
            ...task,
            status: newStatus,
            progress: newProgress
          };
        }
        
        return {
          ...task,
          status: newStatus
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };
  
  // Update task progress directly (e.g., from a manual slider in the list view)
  const updateTaskProgressDirectly = (id, newProgress) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const numericProgress = Number(newProgress) || 0;
        
        // Update subtask completion based on progress
        const updatedSubtasks = [...task.subtasks];
        const totalSubtasks = updatedSubtasks.length;
        
        if (totalSubtasks > 0) {
          const completedCount = Math.round((numericProgress / 100) * totalSubtasks);
          
          updatedSubtasks.forEach((subtask, index) => {
            subtask.completed = index < completedCount;
          });
        }
        
        // Update status based on progress
        let newStatus = task.status;
        if (numericProgress === 0) {
          newStatus = 'not-started';
        } else if (numericProgress === 100) {
          newStatus = 'completed';
        } else if (task.status !== 'blocked') {
          newStatus = 'in-progress';
        }
        
        return {
          ...task,
          progress: numericProgress,
          status: newStatus,
          subtasks: updatedSubtasks
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Show feedback
    setProgressUpdateFeedback({
      show: true,
      taskId: id,
      message: `Progress updated to ${newProgress}%`
    });
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setProgressUpdateFeedback({
        show: false,
        taskId: null,
        message: ''
      });
    }, 3000);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline + 'T00:00:00');
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745'; // Green
      case 'in-progress':
        return '#17a2b8'; // Blue
      case 'blocked':
        return '#dc3545'; // Red
      case 'not-started':
        return '#6c757d'; // Gray
      default:
        return '#6c757d';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545'; // Red
      case 'medium':
        return '#ffc107'; // Yellow
      case 'low':
        return '#28a745'; // Green
      default:
        return '#6c757d';
    }
  };
  
  // Check if task is blocked by dependencies
  const isTaskBlocked = (task) => {
    if (task.dependencies.length === 0) return false;
    
    return task.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'completed';
    });
  };
  
  // Get goal title by ID
  const getGoalTitle = (goalId) => {
    if (!goalId) return 'No associated goal';
    
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : 'Unknown goal';
  };
  
  // Add task from goal
  const addTaskFromGoal = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
      setCurrentTask(null);
      const today = getTodayDateString();
      
      setFormData({
        title: '',
        description: `Task for goal: ${goal.title}`,
        priority: 'medium',
        deadline: today,
        status: 'not-started',
        progress: 0,
        dependencies: [],
        subtasks: [{ id: 1, title: '', completed: false }],
        goalId: goalId
      });
      setIsEditing(true);
    }
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Action Plan
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Create and manage tasks to achieve your career goals.</p>
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
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
          
          <select
            value={filters.goal}
            onChange={(e) => handleFilterChange('goal', e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            <option value="all">All Goals</option>
            {goals.map(goal => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
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
      
      {/* Tasks List */}
      {sortedTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sortedTasks.map(task => {
            const daysRemaining = getDaysRemaining(task.deadline);
            const statusColor = getStatusColor(task.status);
            const priorityColor = getPriorityColor(task.priority);
            
            return (
              <div 
                key={task.id}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ 
                          backgroundColor: priorityColor,
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          color: 'white'
                        }}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        <span style={{ 
                          backgroundColor: statusColor,
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          color: 'white'
                        }}>
                          {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span style={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}>
                          {daysRemaining !== null ? 
                            (daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`) : 
                            'No deadline'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => startEditingTask(task)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: 'white',
                          padding: '8px 16px',
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
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8 }}>{task.description}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
                      <strong>Deadline:</strong> {formatDate(task.deadline)}
                    </p>
                    {task.goalId && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
                        <strong>Goal:</strong> {getGoalTitle(task.goalId)}
                      </p>
                    )}
                  </div>
                  
                  {/* Progress Bar and Manual Update */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>Progress: {task.progress}%</span>
                      {progressUpdateFeedback.show && progressUpdateFeedback.taskId === task.id && (
                        <span style={{ fontSize: '0.8rem', color: '#28a745' }}>{progressUpdateFeedback.message}</span>
                      )}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={task.progress}
                      onChange={(e) => updateTaskProgressDirectly(task.id, parseInt(e.target.value))}
                      style={{ 
                        width: '100%',
                        accentColor: '#0AB196'
                      }}
                    />
                  </div>
                  
                  {/* Status Update Buttons */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'not-started')}
                        style={{
                          backgroundColor: task.status === 'not-started' ? '#6c757d' : 'rgba(108,117,125,0.2)',
                          border: 'none',
                          color: task.status === 'not-started' ? 'white' : '#6c757d',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Not Started
                      </button>
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        style={{
                          backgroundColor: task.status === 'in-progress' ? '#17a2b8' : 'rgba(23,162,184,0.2)',
                          border: 'none',
                          color: task.status === 'in-progress' ? 'white' : '#17a2b8',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'blocked')}
                        style={{
                          backgroundColor: task.status === 'blocked' ? '#dc3545' : 'rgba(220,53,69,0.2)',
                          border: 'none',
                          color: task.status === 'blocked' ? 'white' : '#dc3545',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Blocked
                      </button>
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        style={{
                          backgroundColor: task.status === 'completed' ? '#28a745' : 'rgba(40,167,69,0.2)',
                          border: 'none',
                          color: task.status === 'completed' ? 'white' : '#28a745',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Subtasks</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {task.subtasks.map((subtask, index) => (
                          <div 
                            key={subtask.id}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '0.5rem 1rem',
                              borderRadius: '5px'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={subtask.completed}
                              onChange={() => {
                                const updatedTask = { ...task };
                                updatedTask.subtasks[index].completed = !subtask.completed;
                                
                                // Recalculate progress
                                const totalSubtasks = updatedTask.subtasks.length;
                                const completedSubtasks = updatedTask.subtasks.filter(s => s.completed).length;
                                updatedTask.progress = Math.round((completedSubtasks / totalSubtasks) * 100);
                                
                                // Update status based on progress
                                if (updatedTask.progress === 0) {
                                  updatedTask.status = 'not-started';
                                } else if (updatedTask.progress === 100) {
                                  updatedTask.status = 'completed';
                                } else if (updatedTask.status !== 'blocked') {
                                  updatedTask.status = 'in-progress';
                                }
                                
                                const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
                                setTasks(updatedTasks);
                              }}
                              style={{ marginRight: '0.5rem', accentColor: '#0AB196' }}
                            />
                            <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Dependencies */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Dependencies</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          return (
                            <span 
                              key={depId}
                              style={{ 
                                backgroundColor: depTask && depTask.status === 'completed' ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)', 
                                color: depTask && depTask.status === 'completed' ? '#28a745' : '#dc3545',
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {depTask ? depTask.title : `Task #${depId}`}
                              {depTask && depTask.status === 'completed' && (
                                <span style={{ marginLeft: '0.25rem' }}>✓</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '1rem' }}>You haven't added any tasks yet, or no tasks match your current filters.</p>
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
            Add Your First Task
          </button>
        </div>
      )}
      
      {/* Editing Modal */}
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
            backgroundColor: '#1E1E1E',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>
              {currentTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            
            {/* Task Form */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
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
                placeholder="Describe the task"
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status:</label>
                <select 
                  value={formData.status}
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
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Associated Goal:</label>
                <select 
                  value={formData.goalId || ''}
                  onChange={(e) => handleInputChange('goalId', e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="">No associated goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Progress: {formData.progress}%</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={formData.progress}
                onChange={(e) => handleProgressSliderChange(e.target.value)}
                style={{ 
                  width: '100%',
                  accentColor: '#0AB196'
                }}
              />
            </div>
            
            {/* Subtasks */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Subtasks</h3>
              {formData.subtasks.map((subtask, index) => (
                <div 
                  key={subtask.id}
                  style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.5rem',
                    borderRadius: '5px'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={subtask.completed}
                    onChange={(e) => handleSubtaskChange(index, 'completed', e.target.checked)}
                    style={{ accentColor: '#0AB196' }}
                  />
                  <input 
                    type="text" 
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <button 
                    onClick={() => removeSubtask(index)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={addSubtask}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Add Subtask
              </button>
            </div>
            
            {/* Dependencies */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Dependencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {formData.dependencies.map(depId => {
                  const depTask = tasks.find(t => t.id === depId);
                  return (
                    <span 
                      key={depId}
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {depTask ? depTask.title : `Task #${depId}`}
                      <button 
                        onClick={() => removeDependency(depId)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          marginLeft: '0.25rem',
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Add Dependency:</label>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    addDependency(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                value=""
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              >
                <option value="" disabled>Select a task...</option>
                {tasks
                  .filter(t => t.id !== (currentTask ? currentTask.id : -1))
                  .map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))
                }
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={cancelEditing}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
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
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
