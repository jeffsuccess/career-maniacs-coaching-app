import React, { useState, useEffect } from 'react';

const Goals = () => {
  // State for goals
  const [goals, setGoals] = useState([
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
        { id: 1, title: 'Update resume and LinkedIn profile', completed: true },
        { id: 2, title: 'Connect with 20 industry professionals', completed: true },
        { id: 3, title: 'Prepare 10 interview stories using ABT framework', completed: false },
        { id: 4, title: 'Apply to 15 target companies', completed: false },
        { id: 5, title: 'Complete 3 interview rounds', completed: false }
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
        { id: 1, title: 'Join Toastmasters or similar group', completed: true },
        { id: 2, title: 'Complete 5 practice presentations', completed: false },
        { id: 3, title: 'Speak at team meeting', completed: false },
        { id: 4, title: 'Present at department level', completed: false },
        { id: 5, title: 'Speak at industry meetup or conference', completed: false }
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
        { id: 1, title: 'Establish firm work hours', completed: true },
        { id: 2, title: 'Create morning and evening routines', completed: true },
        { id: 3, title: 'Take lunch breaks away from desk', completed: true },
        { id: 4, title: 'Use all vacation days', completed: false },
        { id: 5, title: 'Reduce weekend work to zero', completed: false }
      ],
      dependencies: []
    }
  ]);
  
  // State for categories
  const [categories, setCategories] = useState([
    'Career',
    'Professional Development',
    'Personal',
    'Financial',
    'Health',
    'Learning'
  ]);
  
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
  
  // State for filters
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState('deadline');
  
  // State for milestone explanation modal
  const [showMilestoneExplanation, setShowMilestoneExplanation] = useState(false);
  
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
      title: goal.title,
      category: goal.category,
      description: goal.description,
      why: goal.why,
      implications: goal.implications,
      deadline: goal.deadline,
      progress: goal.progress,
      milestones: goal.milestones,
      dependencies: goal.dependencies || []
    });
    setIsEditing(true);
  };
  
  // Start adding new goal
  const startAddingGoal = () => {
    setCurrentGoal(null);
    setFormData({
      title: '',
      category: categories[0],
      description: '',
      why: '',
      implications: '',
      deadline: '',
      progress: 0,
      milestones: [{ id: 1, title: '', completed: false }],
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
  
  // Handle milestone changes
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      milestones: updatedMilestones
    });
  };
  
  // Add milestone
  const addMilestone = () => {
    const newId = formData.milestones.length > 0 ? 
      Math.max(...formData.milestones.map(m => m.id)) + 1 : 1;
    
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { id: newId, title: '', completed: false }]
    });
  };
  
  // Remove milestone
  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    
    setFormData({
      ...formData,
      milestones: updatedMilestones
    });
  };
  
  // Toggle dependency
  const toggleDependency = (depId) => {
    const updatedDependencies = [...formData.dependencies];
    const index = updatedDependencies.indexOf(depId);
    
    if (index === -1) {
      updatedDependencies.push(depId);
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
  
  // Add new category
  const addCategory = () => {
    if (newCategory.trim() === '') {
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      alert('This category already exists.');
      return;
    }
    
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };
  
  // Save goal
  const saveGoal = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a goal title.');
      return;
    }
    
    // Calculate progress based on milestones if using milestones
    let calculatedProgress = formData.progress;
    if (formData.milestones && formData.milestones.length > 0) {
      const totalMilestones = formData.milestones.length;
      const completedMilestones = formData.milestones.filter(m => m.completed).length;
      calculatedProgress = Math.round((completedMilestones / totalMilestones) * 100);
    }
    
    if (currentGoal) {
      // Update existing goal
      const updatedGoals = goals.map(goal => 
        goal.id === currentGoal.id ? 
          { 
            ...goal, 
            title: formData.title,
            category: formData.category,
            description: formData.description,
            why: formData.why,
            implications: formData.implications,
            deadline: formData.deadline,
            progress: calculatedProgress,
            milestones: formData.milestones,
            dependencies: formData.dependencies
          } : 
          goal
      );
      
      setGoals(updatedGoals);
    } else {
      // Create new goal
      const newGoal = {
        id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        why: formData.why,
        implications: formData.implications,
        deadline: formData.deadline,
        progress: calculatedProgress,
        milestones: formData.milestones,
        dependencies: formData.dependencies
      };
      
      setGoals([...goals, newGoal]);
    }
    
    setIsEditing(false);
  };
  
  // Delete goal
  const deleteGoal = () => {
    if (currentGoal && window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== currentGoal.id));
      setIsEditing(false);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // Toggle milestone completion
  const toggleMilestoneCompletion = (goalId, milestoneId) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return { ...milestone, completed: !milestone.completed };
          }
          return milestone;
        });
        
        // Calculate new progress
        const totalMilestones = updatedMilestones.length;
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const newProgress = Math.round((completedMilestones / totalMilestones) * 100);
        
        return { ...goal, milestones: updatedMilestones, progress: newProgress };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
  };
  
  // Update progress manually
  const updateProgressManually = (goalId, newProgress) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, progress: newProgress };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
  };
  
  // Get dependency names
  const getDependencyNames = (dependencies) => {
    return dependencies.map(depId => {
      // Check if it's a goal ID (number)
      if (typeof depId === 'number') {
        const goal = goals.find(g => g.id === depId);
        return goal ? goal.title : `Goal #${depId}`;
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
  
  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 75) {
      return '#28a745';
    } else if (progress >= 50) {
      return '#17a2b8';
    } else if (progress >= 25) {
      return '#fd7e14';
    } else {
      return '#dc3545';
    }
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
        Goals
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Set, track, and achieve your career and personal development goals.</p>
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
          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
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
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
              <option value="progress">Progress</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowMilestoneExplanation(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            About Milestones
          </button>
          
          <button 
            onClick={startAddingGoal}
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
            Add Goal
          </button>
        </div>
      </div>
      
      {/* Goals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sortedGoals.length > 0 ? (
          sortedGoals.map(goal => (
            <div 
              key={goal.id}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: isEditing && currentGoal?.id === goal.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onClick={() => !isEditing && startEditingGoal(goal)}
            >
              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ margin: 0 }}>{goal.title}</h2>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.9rem'
                    }}>
                      {goal.category}
                    </span>
                  </div>
                </div>
                
                <p style={{ marginBottom: '1rem' }}>{goal.description}</p>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '10px',
                    height: '8px'
                  }}>
                    <div style={{ 
                      width: `${goal.progress}%`, 
                      backgroundColor: getProgressColor(goal.progress),
                      borderRadius: '10px',
                      height: '100%'
                    }} />
                  </div>
                </div>
                
                {/* Why and Implications */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Why</h3>
                    <p style={{ opacity: 0.8 }}>{goal.why}</p>
                  </div>
                  
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Implications</h3>
                    <p style={{ opacity: 0.8 }}>{goal.implications}</p>
                  </div>
                </div>
                
                {/* Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {goal.milestones.map(milestone => (
                        <div 
                          key={milestone.id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMilestoneCompletion(goal.id, milestone.id);
                          }}
                        >
                          <div style={{ 
                            width: '18px', 
                            height: '18px', 
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderRadius: '3px',
                            backgroundColor: milestone.completed ? '#28a745' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            {milestone.completed && (
                              <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>
                            )}
                          </div>
                          <span style={{ 
                            textDecoration: milestone.completed ? 'line-through' : 'none',
                            opacity: milestone.completed ? 0.7 : 1
                          }}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Dependencies */}
                {goal.dependencies && goal.dependencies.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Dependencies</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {getDependencyNames(goal.dependencies).map((name, index) => (
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
                {goal.deadline && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    <span>Deadline: {formatDate(goal.deadline)}</span>
                    {getDaysUntilDeadline(goal.deadline) > 0 ? (
                      <span>({getDaysUntilDeadline(goal.deadline)} days remaining)</span>
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
            <p>No goals match your current filters. Try adjusting your filters or add a new goal.</p>
          </div>
        )}
      </div>
      
      {/* Goal Form Modal */}
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
            <h2 style={{ marginTop: 0 }}>{currentGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
            
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
            
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => document.getElementById('new-category-input').style.display = 'flex'}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '0 0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    +
                  </button>
                </div>
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
            
            {/* New Category Input */}
            <div 
              id="new-category-input"
              style={{ 
                display: 'none', 
                marginBottom: '1.5rem',
                gap: '0.5rem'
              }}
            >
              <input 
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
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
                onClick={addCategory}
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
              <button 
                onClick={() => {
                  document.getElementById('new-category-input').style.display = 'none';
                  setNewCategory('');
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Why:</label>
              <textarea 
                value={formData.why}
                onChange={(e) => handleInputChange('why', e.target.value)}
                rows={2}
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Implications:</label>
              <textarea 
                value={formData.implications}
                onChange={(e) => handleInputChange('implications', e.target.value)}
                rows={2}
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
            
            {/* Dependencies */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dependencies:</label>
              
              {/* Goal Dependencies */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Goal Dependencies:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {goals
                    .filter(goal => !currentGoal || goal.id !== currentGoal.id)
                    .map(goal => (
                      <div 
                        key={goal.id}
                        onClick={() => toggleDependency(goal.id)}
                        style={{ 
                          backgroundColor: formData.dependencies.includes(goal.id) ? 
                            'rgba(10,177,150,0.3)' : 'rgba(255,255,255,0.1)',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          border: formData.dependencies.includes(goal.id) ?
                            '1px solid rgba(10,177,150,0.5)' : '1px solid transparent'
                        }}
                      >
                        {goal.title}
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
            
            {/* Milestones */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label>Milestones:</label>
                <button 
                  onClick={addMilestone}
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
                  Add Milestone
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.milestones.map((milestone, index) => (
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
                      backgroundColor: milestone.completed ? '#28a745' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleMilestoneChange(index, 'completed', !milestone.completed)}
                    >
                      {milestone.completed && (
                        <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>
                      )}
                    </div>
                    <input 
                      type="text"
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
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
                      onClick={() => removeMilestone(index)}
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
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Manual Progress Adjustment:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                  style={{ flexGrow: 1 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
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
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Note: Progress will be calculated automatically based on milestone completion unless manually adjusted.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {currentGoal && (
                  <button 
                    onClick={deleteGoal}
                    style={{
                      background: 'rgba(255,82,82,0.2)',
                      border: '1px solid rgba(255,82,82,0.5)',
                      color: 'rgba(255,82,82,0.8)',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Goal
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
                  Save
                </button>
              </div>
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
            backgroundColor: '#1e2a38',
            borderRadius: '10px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0 }}>About Milestones</h2>
              <button 
                onClick={() => setShowMilestoneExplanation(false)}
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
            
            <div>
              <p>Milestones are key checkpoints on the way to achieving your goal. They help break down large goals into manageable steps and provide a clear path to success.</p>
              
              <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>How Milestones Work</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Each milestone represents a specific achievement or task that contributes to your overall goal.</li>
                <li style={{ marginBottom: '0.5rem' }}>As you complete milestones, your goal progress automatically updates.</li>
                <li style={{ marginBottom: '0.5rem' }}>For example, if you have 5 milestones and complete 2, your goal progress will be 40%.</li>
                <li style={{ marginBottom: '0.5rem' }}>You can also manually adjust your goal progress if needed.</li>
              </ul>
              
              <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Tips for Effective Milestones</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Make milestones specific and measurable.</li>
                <li style={{ marginBottom: '0.5rem' }}>Set realistic timeframes for each milestone.</li>
                <li style={{ marginBottom: '0.5rem' }}>Include a mix of short-term and long-term milestones.</li>
                <li style={{ marginBottom: '0.5rem' }}>Celebrate when you complete each milestone!</li>
              </ul>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button 
                  onClick={() => setShowMilestoneExplanation(false)}
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
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
