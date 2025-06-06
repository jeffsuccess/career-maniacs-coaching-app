import React, { useState, useEffect } from 'react';

const Goals = ({ addTaskToActionPlan }) => {
  // State for goals
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [
      {
        id: 1,
        title: 'Land a senior product manager role',
        category: 'Career',
        description: 'Secure a senior product manager position at a tech company that aligns with my values.',
        why: 'To leverage my experience in a role with more strategic impact and leadership opportunities.',
        implications: 'Will require networking, interview preparation, and possibly relocation.',
        deadline: '2025-12-31',
        progress: 35,
        milestones: [
          { id: 1, title: 'Update resume and LinkedIn profile', completed: true, dueDate: '2025-06-15' },
          { id: 2, title: 'Connect with 20 industry professionals', completed: true, dueDate: '2025-07-15' },
          { id: 3, title: 'Prepare 10 interview stories using ABT framework', completed: false, dueDate: '2025-08-31' },
          { id: 4, title: 'Apply to 15 target companies', completed: false, dueDate: '2025-09-30' },
          { id: 5, title: 'Complete 3 interview rounds', completed: false, dueDate: '2025-11-30' }
        ],
        dependencies: []
      },
      {
        id: 2,
        title: 'Develop public speaking skills',
        category: 'Professional Development',
        description: 'Become a confident and effective public speaker for industry conferences and team presentations.',
        why: 'To increase visibility in my field and overcome my fear of public speaking.',
        implications: 'Will need to practice regularly and seek feedback to improve.',
        deadline: '2025-09-30',
        progress: 20,
        milestones: [
          { id: 1, title: 'Join Toastmasters or similar group', completed: true, dueDate: '2025-06-30' },
          { id: 2, title: 'Complete 5 practice presentations', completed: false, dueDate: '2025-07-31' },
          { id: 3, title: 'Speak at team meeting', completed: false, dueDate: '2025-08-15' },
          { id: 4, title: 'Present at department level', completed: false, dueDate: '2025-09-15' },
          { id: 5, title: 'Speak at industry meetup or conference', completed: false, dueDate: '2025-09-30' }
        ],
        dependencies: []
      },
      {
        id: 3,
        title: 'Improve work-life balance',
        category: 'Personal',
        description: 'Create healthier boundaries between work and personal life.',
        why: 'To prevent burnout and have more quality time for family, friends, and personal interests.',
        implications: 'May need to set firmer boundaries at work and be more efficient during work hours.',
        deadline: '2025-08-15',
        progress: 50,
        milestones: [
          { id: 1, title: 'Establish firm work hours', completed: true, dueDate: '2025-06-10' },
          { id: 2, title: 'Create morning and evening routines', completed: true, dueDate: '2025-06-20' },
          { id: 3, title: 'Take lunch breaks away from desk', completed: true, dueDate: '2025-07-01' },
          { id: 4, title: 'Use all vacation days', completed: false, dueDate: '2025-07-31' },
          { id: 5, title: 'Reduce weekend work to zero', completed: false, dueDate: '2025-08-15' }
        ],
        dependencies: []
      }
    ];
  });
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // State for categories
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('goalCategories');
    return savedCategories ? JSON.parse(savedCategories) : [
      'Career',
      'Professional Development',
      'Personal',
      'Financial',
      'Health',
      'Learning'
    ];
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goalCategories', JSON.stringify(categories));
  }, [categories]);
  
  // Mindset techniques for dependencies
  const mindsetTechniques = [
    { id: 'neuroplasticity', title: 'Neuroplasticity: Rewire or Retire' },
    { id: 'anchoring', title: 'State-Dependent Learning "Anchoring"' },
    { id: 'microWins', title: 'Dopamine-Driven Micro Wins' },
    { id: 'primeProgramming', title: 'Prime Time Mind Programming' }
  ];
  
  // State for new category
  const [newCategory, setNewCategory] = useState('');
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    why: '',
    implications: '',
    deadline: '',
    progress: 0,
    milestones: [],
    dependencies: []
  });
  
  // State for custom dependency
  const [customDependency, setCustomDependency] = useState('');
  
  // State for progress update feedback
  const [progressUpdateFeedback, setProgressUpdateFeedback] = useState({
    show: false,
    goalId: null,
    message: ''
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState('deadline');
  
  // State for milestone explanation modal
  const [showMilestoneExplanation, setShowMilestoneExplanation] = useState(false);
  
  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Effect to update goal progress based on milestone completion
  useEffect(() => {
    const updatedGoals = goals.map(goal => {
      if (!goal.milestones || goal.milestones.length === 0) {
        return { ...goal, progress: goal.progress || 0 }; // Ensure progress is at least 0
      }
      
      const totalMilestones = goal.milestones.length;
      const completedMilestones = goal.milestones.filter(m => m.completed).length;
      const newProgress = Math.round((completedMilestones / totalMilestones) * 100);
      
      if (newProgress !== goal.progress) {
        return { ...goal, progress: newProgress };
      }
      
      return goal;
    });
    
    if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
      setGoals(updatedGoals);
    }
  }, [goals]); // Rerun when goals change, but be careful of infinite loops if setGoals is called inside
  
  // Filter goals
  const filteredGoals = goals.filter(goal => {
    if (filters.category !== 'all' && goal.category !== filters.category) {
      return false;
    }
    
    if (filters.status === 'completed' && goal.progress < 100) {
      return false;
    }
    
    if (filters.status === 'in-progress' && (goal.progress === 0 || goal.progress === 100)) {
      return false;
    }
    
    if (filters.status === 'not-started' && goal.progress > 0) {
      return false;
    }
    
    return true;
  });
  
  // Sort goals
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'progress':
        return b.progress - a.progress;
      case 'title':
        return a.title.localeCompare(b.title);
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
  
  // Start editing goal
  const startEditingGoal = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      ...goal,
      milestones: goal.milestones.map(m => ({ ...m, dueDate: m.dueDate || getTodayDateString() })),
      dependencies: goal.dependencies || []
    });
    setIsEditing(true);
  };
  
  // Start adding new goal
  const startAddingGoal = () => {
    setCurrentGoal(null);
    const today = getTodayDateString();
    
    setFormData({
      title: '',
      category: categories[0] || '',
      description: '',
      why: '',
      implications: '',
      deadline: today,
      progress: 0,
      milestones: [{ id: 1, title: '', completed: false, dueDate: today }],
      dependencies: []
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

  // Handle manual progress change from slider
  const handleProgressSliderChange = (value) => {
    const newProgress = parseInt(value, 10);
    setFormData(prevFormData => ({
        ...prevFormData,
        progress: newProgress
    }));
  };
  
  // Handle milestone changes
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    
    let newProgress = formData.progress; // Keep manual progress if not changing completion
    if (field === 'completed') {
      const totalMilestones = updatedMilestones.length;
      const completedMilestones = updatedMilestones.filter(m => m.completed).length;
      newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    }
    
    setFormData({
      ...formData,
      milestones: updatedMilestones,
      progress: newProgress
    });
  };
  
  // Add milestone
  const addMilestone = () => {
    const newId = formData.milestones.length > 0 ? 
      Math.max(...formData.milestones.map(m => m.id)) + 1 : 1;
    const today = getTodayDateString();
    
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { id: newId, title: '', completed: false, dueDate: today }]
    });
  };
  
  // Remove milestone
  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    
    const totalMilestones = updatedMilestones.length;
    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    
    setFormData({
      ...formData,
      milestones: updatedMilestones,
      progress: newProgress
    });
  };
  
  // Add dependency
  const addDependency = (dependency) => {
    if (!formData.dependencies.includes(dependency)) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, dependency]
      });
    }
    setCustomDependency('');
  };
  
  // Remove dependency
  const removeDependency = (dependency) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter(d => d !== dependency)
    });
  };
  
  // Save goal
  const saveGoal = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a goal title.');
      return;
    }
    
    const emptyMilestones = formData.milestones.filter(m => m.title.trim() === '');
    if (emptyMilestones.length > 0) {
      alert('Please enter titles for all milestones or remove empty ones.');
      return;
    }
    
    // Ensure progress is a number
    const goalToSave = {
        ...formData,
        progress: Number(formData.progress) || 0
    };

    if (currentGoal) {
      const updatedGoals = goals.map(goal => 
        goal.id === currentGoal.id ? { ...goalToSave, id: goal.id } : goal
      );
      setGoals(updatedGoals);
      
      if (addTaskToActionPlan) {
        goalToSave.milestones.forEach(milestone => {
          if (!milestone.addedToActionPlan) {
            addTaskToActionPlan({
              title: milestone.title,
              description: `Milestone for goal: ${goalToSave.title}`,
              priority: 'medium',
              deadline: milestone.dueDate,
              status: milestone.completed ? 'completed' : 'not-started',
              progress: milestone.completed ? 100 : 0,
              goalId: currentGoal.id
            });
          }
        });
      }
    } else {
      const newGoal = {
        ...goalToSave,
        id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1
      };
      setGoals([...goals, newGoal]);
      
      if (addTaskToActionPlan) {
        newGoal.milestones.forEach(milestone => {
          addTaskToActionPlan({
            title: milestone.title,
            description: `Milestone for goal: ${newGoal.title}`,
            priority: 'medium',
            deadline: milestone.dueDate,
            status: milestone.completed ? 'completed' : 'not-started',
            progress: milestone.completed ? 100 : 0,
            goalId: newGoal.id
          });
        });
      }
    }
    
    setIsEditing(false);
    setCurrentGoal(null);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setCurrentGoal(null);
  };
  
  // Delete goal
  const deleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== id));
      if (currentGoal && currentGoal.id === id) {
        setIsEditing(false);
        setCurrentGoal(null);
      }
    }
  };
  
  // Add new category
  const addNewCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };
  
  // Update goal progress directly (e.g., from a manual slider in the list view)
  const updateGoalProgressDirectly = (id, newProgress) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const numericProgress = Number(newProgress) || 0;
        // Update milestone completion based on progress if desired, or keep them separate
        // For now, manual progress overrides milestone-based progress if set directly.
        // If you want milestones to update, you'd call a similar logic as in handleMilestoneChange
        return {
          ...goal,
          progress: numericProgress,
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    setProgressUpdateFeedback({
      show: true,
      goalId: id,
      message: `Progress updated to ${newProgress}%`
    });
    
    setTimeout(() => {
      setProgressUpdateFeedback({ show: false, goalId: null, message: '' });
    }, 3000);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options); // Ensure date is parsed as local
    } catch (e) {
        return dateString; // Fallback for invalid dates
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
  const getStatusColor = (deadline, progress) => {
    if (progress === 100) return '#28a745'; // Green for completed
    const daysRemaining = getDaysRemaining(deadline);
    if (daysRemaining === null) return '#6c757d'; // Grey for no deadline
    if (daysRemaining < 0) return '#dc3545'; // Red for overdue
    if (daysRemaining < 7) return '#ffc107'; // Yellow for approaching deadline
    return '#17a2b8'; // Blue for on track
  };
  
  // Toggle milestone explanation modal
  const toggleMilestoneExplanation = () => {
    setShowMilestoneExplanation(!showMilestoneExplanation);
  };
  
  // Add milestone to Action Plan
  const addMilestoneToActionPlan = (goalId, milestone) => {
    if (addTaskToActionPlan) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        addTaskToActionPlan({
          title: milestone.title,
          description: `Milestone for goal: ${goal.title}`,
          priority: 'medium',
          deadline: milestone.dueDate,
          status: milestone.completed ? 'completed' : 'not-started',
          progress: milestone.completed ? 100 : 0,
          goalId: goal.id
        });
        // Mark milestone as added to prevent duplicates (optional, depends on desired behavior)
        const updatedGoals = goals.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    milestones: g.milestones.map(m => 
                        m.id === milestone.id ? { ...m, addedToActionPlan: true } : m
                    )
                };
            }
            return g;
        });
        setGoals(updatedGoals);
      }
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
        Goals
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Define, track, and achieve your career and personal goals.</p>
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
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
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
            <option value="completed">Completed</option>
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
            <option value="progress">Sort by Progress</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
        
        <button 
          onClick={startAddingGoal}
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
          Add New Goal
        </button>
      </div>

      {/* Goals List */}
      {sortedGoals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sortedGoals.map(goal => {
            const daysRemaining = getDaysRemaining(goal.deadline);
            const statusColor = getStatusColor(goal.deadline, goal.progress);
            
            return (
              <div 
                key={goal.id}
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
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{goal.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}>
                          {goal.category}
                        </span>
                        <span style={{ 
                          backgroundColor: statusColor,
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          color: 'white'
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
                        onClick={() => startEditingGoal(goal)}
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
                        onClick={() => deleteGoal(goal.id)}
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
                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8 }}>{goal.description}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}><strong>Deadline:</strong> {formatDate(goal.deadline)}</p>
                  </div>
                  
                  {/* Progress Bar and Manual Update */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>Progress: {goal.progress}%</span>
                      {progressUpdateFeedback.show && progressUpdateFeedback.goalId === goal.id && (
                        <span style={{ fontSize: '0.8rem', color: '#28a745' }}>{progressUpdateFeedback.message}</span>
                      )}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={goal.progress}
                      onChange={(e) => updateGoalProgressDirectly(goal.id, parseInt(e.target.value))}
                      style={{ 
                        width: '100%',
                        accentColor: '#0AB196'
                      }}
                    />
                  </div>

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Milestones 
                        <button 
                            onClick={toggleMilestoneExplanation}
                            style={{
                                background: 'none', 
                                border: 'none', 
                                color: '#0AB196', 
                                cursor: 'pointer', 
                                fontSize: '0.9rem',
                                marginLeft: '0.5rem'
                            }}
                        >
                           (What are these?)
                        </button>
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {goal.milestones.map(milestone => (
                          <div 
                            key={milestone.id}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '0.5rem 1rem',
                              borderRadius: '5px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={milestone.completed}
                                    readOnly // Milestones completion drives progress, not direct edit here
                                    style={{ marginRight: '0.5rem', accentColor: '#0AB196' }}
                                />
                                <span style={{ textDecoration: milestone.completed ? 'line-through' : 'none' }}>
                                    {milestone.title}
                                </span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Due: {formatDate(milestone.dueDate)}
                                </span>
                                {addTaskToActionPlan && !milestone.addedToActionPlan && (
                                    <button 
                                        onClick={() => addMilestoneToActionPlan(goal.id, milestone)}
                                        style={{
                                            background: 'rgba(10,177,150,0.2)',
                                            border: 'none',
                                            color: '#0AB196',
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Add to Action Plan
                                    </button>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Dependencies */}
                  {goal.dependencies && goal.dependencies.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Dependencies</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {goal.dependencies.map((dep, index) => (
                          <span 
                            key={index}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          )}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '1rem' }}>You haven't added any goals yet, or no goals match your current filters.</p>
          <button 
            onClick={startAddingGoal}
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
            Add Your First Goal
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
              {currentGoal ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            
            {/* Goal Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter goal title"
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
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category:</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Add New Category (Optional):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
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
                  onClick={addNewCategory}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Add Category
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your goal"
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Why is this goal important?</label>
              <textarea 
                value={formData.why}
                onChange={(e) => handleInputChange('why', e.target.value)}
                placeholder="Explain the significance of this goal"
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Implications of achieving/not achieving:</label>
              <textarea 
                value={formData.implications}
                onChange={(e) => handleInputChange('implications', e.target.value)}
                placeholder="What are the consequences?"
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
            </div>
            
            {/* Milestones */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Milestones</h3>
              {formData.milestones.map((milestone, index) => (
                <div 
                  key={milestone.id}
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
                    checked={milestone.completed}
                    onChange={(e) => handleMilestoneChange(index, 'completed', e.target.checked)}
                    style={{ accentColor: '#0AB196' }}
                  />
                  <input 
                    type="text" 
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    placeholder={`Milestone ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <input 
                    type="date" 
                    value={milestone.dueDate}
                    onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <button 
                    onClick={() => removeMilestone(index)}
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
                onClick={addMilestone}
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
                Add Milestone
              </button>
            </div>
            
            {/* Dependencies */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Dependencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {formData.dependencies.map((dep, index) => (
                  <span 
                    key={index}
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {dep}
                    <button 
                      onClick={() => removeDependency(dep)}
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
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                  onClick={() => addDependency(customDependency)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Add Custom
                </button>
              </div>
              
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Mindset Technique Dependency:</label>
              <select 
                onChange={(e) => addDependency(e.target.value)}
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
                <option value="" disabled>Select a technique...</option>
                {mindsetTechniques.map(tech => (
                  <option key={tech.id} value={tech.title}>{tech.title}</option>
                ))}
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
                onClick={saveGoal}
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
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Explanation Modal */}
      {showMilestoneExplanation && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>About Milestones</h2>
            <p>
              Milestones are smaller, actionable steps that help you break down your larger goals into manageable parts. 
              They provide a clear path towards achieving your goal and allow you to track your progress more effectively.
            </p>
            <p>
              <strong>Key Benefits of Using Milestones:</strong>
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Clarity:</strong> Milestones make your goals less daunting by outlining specific steps.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Motivation:</strong> Completing milestones provides a sense of accomplishment and keeps you motivated.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Tracking:</strong> They allow for precise tracking of progress towards your overall goal. Your goal's progress percentage is automatically calculated based on completed milestones.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Adaptability:</strong> If you encounter roadblocks, you can adjust milestones without derailing the entire goal.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Action Plan Integration:</strong> Milestones can be added as tasks to your Action Plan for more detailed management.</li>
            </ul>
            <p>
              When you edit a goal, you can add, remove, or update milestones. Mark them as completed as you achieve them. 
              You can also manually adjust the overall goal progress using the slider, which will override the milestone-based calculation if you prefer a more subjective measure of progress at times.
            </p>
            <button 
              onClick={toggleMilestoneExplanation}
              style={{
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

