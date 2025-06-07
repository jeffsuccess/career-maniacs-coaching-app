import React, { useState, useEffect } from 'react';

const Goals = ({ addTaskToActionPlan }) => {
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
        dependencies: [],
        miniActionPlan: [
          { id: 'map1-1', text: 'Research target company values', completed: true },
          { id: 'map1-2', text: 'Tailor resume for each application', completed: false },
        ]
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
        dependencies: [],
        miniActionPlan: [
          { id: 'map2-1', text: 'Practice speech in front of mirror', completed: false },
          { id: 'map2-2', text: 'Record and review practice sessions', completed: false },
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('goalCategories');
    return savedCategories ? JSON.parse(savedCategories) : ['Career', 'Professional Development', 'Personal', 'Financial', 'Health', 'Learning'];
  });

  useEffect(() => {
    localStorage.setItem('goalCategories', JSON.stringify(categories));
  }, [categories]);

  const mindsetTechniques = [
    { id: 'neuroplasticity', title: 'Neuroplasticity: Rewire or Retire' },
    { id: 'anchoring', title: 'State-Dependent Learning "Anchoring"' },
    { id: 'microWins', title: 'Dopamine-Driven Micro Wins' },
    { id: 'primeProgramming', title: 'Prime Time Mind Programming' }
  ];

  const [newCategory, setNewCategory] = useState('');
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
    dependencies: [],
    miniActionPlan: []
  });

  const [customDependency, setCustomDependency] = useState('');
  const [progressUpdateFeedback, setProgressUpdateFeedback] = useState({ show: false, goalId: null, message: '' });
  const [filters, setFilters] = useState({ category: 'all', status: 'all' });
  const [sortBy, setSortBy] = useState('deadline');
  const [showMilestoneExplanation, setShowMilestoneExplanation] = useState(false);

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const updatedGoals = goals.map(goal => {
      if (!goal.milestones || goal.milestones.length === 0) {
        return { ...goal, progress: goal.progress || 0 };
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
  }, [goals]);

  const filteredGoals = goals.filter(goal => {
    if (filters.category !== 'all' && goal.category !== filters.category) return false;
    if (filters.status === 'completed' && goal.progress < 100) return false;
    if (filters.status === 'in-progress' && (goal.progress === 0 || goal.progress === 100)) return false;
    if (filters.status === 'not-started' && goal.progress > 0) return false;
    return true;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case 'deadline': return new Date(a.deadline) - new Date(b.deadline);
      case 'progress': return b.progress - a.progress;
      case 'title': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });

  const handleFilterChange = (filter, value) => setFilters({ ...filters, [filter]: value });
  const handleSortChange = (value) => setSortBy(value);

  const startEditingGoal = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      ...goal,
      milestones: goal.milestones.map(m => ({ ...m, dueDate: m.dueDate || getTodayDateString() })),
      dependencies: goal.dependencies || [],
      miniActionPlan: goal.miniActionPlan || [] 
    });
    setIsEditing(true);
  };

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
      dependencies: [],
      miniActionPlan: [{ id: String(Date.now()), text: '', completed: false }]
    });
    setIsEditing(true);
  };

  const handleFormInputChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleProgressSliderChange = (value) => {
    const newProgress = parseInt(value, 10);
    setFormData(prevFormData => ({ ...prevFormData, progress: newProgress }));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    let newProgress = formData.progress;
    if (field === 'completed') {
      const totalMilestones = updatedMilestones.length;
      const completedMilestones = updatedMilestones.filter(m => m.completed).length;
      newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    }
    setFormData({ ...formData, milestones: updatedMilestones, progress: newProgress });
  };

  const addMilestone = () => {
    const newId = formData.milestones.length > 0 ? Math.max(...formData.milestones.map(m => m.id)) + 1 : 1;
    const today = getTodayDateString();
    setFormData({ ...formData, milestones: [...formData.milestones, { id: newId, title: '', completed: false, dueDate: today }] });
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    const totalMilestones = updatedMilestones.length;
    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    setFormData({ ...formData, milestones: updatedMilestones, progress: newProgress });
  };
  
  // Mini Action Plan handlers
  const handleMiniActionPlanChange = (index, field, value) => {
    const updatedMiniActionPlan = [...formData.miniActionPlan];
    updatedMiniActionPlan[index] = { ...updatedMiniActionPlan[index], [field]: value };
    setFormData({ ...formData, miniActionPlan: updatedMiniActionPlan });
  };

  const addMiniActionPlanItem = () => {
    setFormData({ 
        ...formData, 
        miniActionPlan: [...formData.miniActionPlan, { id: String(Date.now()), text: '', completed: false }] 
    });
  };

  const removeMiniActionPlanItem = (index) => {
    const updatedMiniActionPlan = [...formData.miniActionPlan];
    updatedMiniActionPlan.splice(index, 1);
    setFormData({ ...formData, miniActionPlan: updatedMiniActionPlan });
  };

  const addDependency = (dependency) => {
    if (!formData.dependencies.includes(dependency)) {
      setFormData({ ...formData, dependencies: [...formData.dependencies, dependency] });
    }
    setCustomDependency('');
  };

  const removeDependency = (dependency) => {
    setFormData({ ...formData, dependencies: formData.dependencies.filter(d => d !== dependency) });
  };

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
    const goalToSave = { ...formData, progress: Number(formData.progress) || 0 };

    if (currentGoal) {
      const updatedGoals = goals.map(goal => goal.id === currentGoal.id ? { ...goalToSave, id: goal.id } : goal);
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
      const newGoal = { ...goalToSave, id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1 };
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

  const cancelEditing = () => {
    setIsEditing(false);
    setCurrentGoal(null);
  };

  const deleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== id));
      if (currentGoal && currentGoal.id === id) {
        setIsEditing(false);
        setCurrentGoal(null);
      }
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const updateGoalProgressDirectly = (id, newProgress) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const numericProgress = Number(newProgress) || 0;
        return { ...goal, progress: numericProgress };
      }
      return goal;
    });
    setGoals(updatedGoals);
    setProgressUpdateFeedback({ show: true, goalId: id, message: `Progress updated to ${newProgress}%` });
    setTimeout(() => setProgressUpdateFeedback({ show: false, goalId: null, message: '' }), 3000);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline + 'T00:00:00');
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (deadline, progress) => {
    if (progress === 100) return '#28a745';
    const daysRemaining = getDaysRemaining(deadline);
    if (daysRemaining === null) return '#6c757d';
    if (daysRemaining < 0) return '#dc3545';
    if (daysRemaining < 7) return '#ffc107';
    return '#17a2b8';
  };

  const toggleMilestoneCompletionInList = (goalId, milestoneId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const totalMilestones = updatedMilestones.length;
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
        return { ...goal, milestones: updatedMilestones, progress: newProgress };
      }
      return goal;
    }));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0AB196', marginBottom: '2rem' }}>Goals</h1>
      {!isEditing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}>
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}>
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}>
                <option value="deadline">Sort by Deadline</option>
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
            <button onClick={startAddingGoal} style={{ background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add New Goal</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {sortedGoals.map(goal => (
              <div key={goal.id} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: getStatusColor(goal.deadline, goal.progress) }}>{goal.title}</h3>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.5rem', borderRadius: '15px', fontSize: '0.8rem' }}>{goal.category}</span>
                </div>
                <p style={{ opacity: 0.8, minHeight: '40px' }}>{goal.description}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Why:</strong> <span style={{ opacity: 0.9 }}>{goal.why}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Implications:</strong> <span style={{ opacity: 0.9 }}>{goal.implications}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>Progress: {goal.progress}%</span>
                  {goal.deadline && (
                    <span style={{ opacity: 0.8 }}>
                      Due: {formatDateForDisplay(goal.deadline)} 
                      ( {getDaysRemaining(goal.deadline) !== null ? 
                          `${getDaysRemaining(goal.deadline)} days ${getDaysRemaining(goal.deadline) < 0 ? 'ago' : 'left'}` : 
                          'N/A'}
                      )
                    </span>
                  )}
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ width: `${goal.progress}%`, backgroundColor: getStatusColor(goal.deadline, goal.progress), height: '10px', borderRadius: '5px 0 0 5px', transition: 'width 0.5s ease' }} />
                </div>
                <input type="range" min="0" max="100" value={goal.progress} onChange={(e) => updateGoalProgressDirectly(goal.id, e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
                {progressUpdateFeedback.show && progressUpdateFeedback.goalId === goal.id && (
                    <div style={{ fontSize: '0.8rem', color: '#28a745', textAlign: 'center', marginBottom: '0.5rem' }}>{progressUpdateFeedback.message}</div>
                )}
                <h4>Milestones <button onClick={() => setShowMilestoneExplanation(true)} style={{ background: 'none', border: 'none', color: '#0AB196', cursor: 'pointer', fontSize: '0.8rem' }}>(?)</button></h4>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                  {goal.milestones.map(milestone => (
                    <li key={milestone.id} onClick={() => toggleMilestoneCompletionInList(goal.id, milestone.id)} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', padding: '0.25rem', borderRadius: '3px', background: milestone.completed ? 'rgba(40,167,69,0.1)' : 'transparent' }}>
                      <input type="checkbox" checked={milestone.completed} readOnly style={{ marginRight: '0.5rem', accentColor: '#0AB196' }} />
                      <span style={{ textDecoration: milestone.completed ? 'line-through' : 'none', opacity: milestone.completed ? 0.7 : 1 }}>
                        {milestone.title} {milestone.dueDate && `(Due: ${formatDateForDisplay(milestone.dueDate)})`}
                      </span>
                    </li>
                  ))}
                </ul>
                {goal.miniActionPlan && goal.miniActionPlan.length > 0 && (
                  <details style={{ marginBottom: '1rem' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#0AB196' }}>Mini Action Plan</summary>
                    <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', marginTop: '0.5rem', borderLeft: '2px solid rgba(10,177,150,0.3)' }}>
                      {goal.miniActionPlan.map(item => (
                        <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <input type="checkbox" checked={item.completed} readOnly disabled style={{ marginRight: '0.5rem', accentColor: '#0AB196' }} />
                          <span style={{ textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.7 : 1 }}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => startEditingGoal(goal)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteGoal(goal.id)} style={{ background: 'rgba(220,53,69,0.2)', border: 'none', color: '#dc3545', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h3>Add New Category</h3>
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px', marginRight: '0.5rem' }} />
            <button onClick={addNewCategory} style={{ background: '#007bff', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>Add Category</button>
          </div>
        </>
      ) : (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '10px' }}>
          <h2>{currentGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveGoal(); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Title:</label>
              <input type="text" value={formData.title} onChange={(e) => handleFormInputChange('title', e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Category:</label>
              <select value={formData.category} onChange={(e) => handleFormInputChange('category', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label>
              <textarea value={formData.description} onChange={(e) => handleFormInputChange('description', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px', minHeight: '80px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Why is this goal important?</label>
              <textarea value={formData.why} onChange={(e) => handleFormInputChange('why', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px', minHeight: '60px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>What are the implications of achieving/not achieving this goal?</label>
              <textarea value={formData.implications} onChange={(e) => handleFormInputChange('implications', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px', minHeight: '60px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Deadline:</label>
              <input type="date" value={formData.deadline} onChange={(e) => handleFormInputChange('deadline', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Progress: {formData.progress}%</label>
              <input type="range" min="0" max="100" value={formData.progress} onChange={(e) => handleProgressSliderChange(e.target.value)} style={{ width: '100%' }} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4>Milestones <button type="button" onClick={() => setShowMilestoneExplanation(true)} style={{ background: 'none', border: 'none', color: '#0AB196', cursor: 'pointer', fontSize: '0.8rem' }}>(?)</button></h4>
              {formData.milestones.map((milestone, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" placeholder="Milestone title" value={milestone.title} onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)} style={{ flex: 1, padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
                  <input type="date" value={milestone.dueDate} onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={milestone.completed} onChange={(e) => handleMilestoneChange(index, 'completed', e.target.checked)} style={{ marginRight: '0.3rem', accentColor: '#0AB196' }} /> Done
                  </label>
                  <button type="button" onClick={() => removeMilestone(index)} style={{ background: 'rgba(220,53,69,0.2)', border: 'none', color: '#dc3545', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addMilestone} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer', marginTop: '0.5rem' }}>Add Milestone</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Mini Action Plan</h4>
              {formData.miniActionPlan.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" placeholder="Action item" value={item.text} onChange={(e) => handleMiniActionPlanChange(index, 'text', e.target.value)} style={{ flex: 1, padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={item.completed} onChange={(e) => handleMiniActionPlanChange(index, 'completed', e.target.checked)} style={{ marginRight: '0.3rem', accentColor: '#0AB196' }} /> Done
                  </label>
                  <button type="button" onClick={() => removeMiniActionPlanItem(index)} style={{ background: 'rgba(220,53,69,0.2)', border: 'none', color: '#dc3545', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addMiniActionPlanItem} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer', marginTop: '0.5rem' }}>Add Item</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Dependencies</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select onChange={(e) => addDependency(e.target.value)} value="" style={{ padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}>
                  <option value="" disabled>Select Mindset Technique</option>
                  {mindsetTechniques.map(tech => <option key={tech.id} value={tech.title}>{tech.title}</option>)}
                </select>
                <input type="text" value={customDependency} onChange={(e) => setCustomDependency(e.target.value)} placeholder="Custom dependency" style={{ flex: 1, padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '5px' }} />
                <button type="button" onClick={() => { if(customDependency.trim()) addDependency(customDependency.trim()); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>Add Custom</button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {formData.dependencies.map((dep, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '0.3rem 0.5rem', borderRadius: '3px', marginBottom: '0.3rem' }}>
                    {dep}
                    <button type="button" onClick={() => removeDependency(dep)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" onClick={cancelEditing} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #555', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save Goal</button>
            </div>
          </form>
        </div>
      )}
      {showMilestoneExplanation && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#333', color: 'white', padding: '2rem', borderRadius: '10px', maxWidth: '500px', textAlign: 'center' }}>
            <h3>About Milestones</h3>
            <p>Milestones are specific, measurable steps that help you track progress towards your larger goal. Completing milestones automatically updates your goal's overall progress.</p>
            <p>You can also manually adjust the overall goal progress using the slider, which might be useful if progress isn't solely tied to milestone completion.</p>
            <button onClick={() => setShowMilestoneExplanation(false)} style={{ background: '#0AB196', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '1rem' }}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

