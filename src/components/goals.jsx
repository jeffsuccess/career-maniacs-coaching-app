import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
  const navigate = useNavigate();
  
  // State for goals with localStorage persistence
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  // State for new goal form
  const [newGoal, setNewGoal] = useState({
    id: '',
    title: '',
    description: '',
    deadline: '',
    progress: 0,
    why: '',
    implications: '',
    milestones: [],
    miniActionPlan: []
  });
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  
  // State for adding milestone
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    id: '',
    title: '',
    dueDate: '',
    completed: false
  });
  
  // State for adding mini action plan step
  const [showMiniActionPlanForm, setShowMiniActionPlanForm] = useState(false);
  const [newActionStep, setNewActionStep] = useState({
    id: '',
    text: '',
    completed: false
  });
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);
  
  // Handle input changes for new/editing goal
  const handleInputChange = (field, value) => {
    if (isEditing) {
      setGoals(goals.map(goal => {
        if (goal.id === editingGoalId) {
          return { ...goal, [field]: value };
        }
        return goal;
      }));
    } else {
      setNewGoal({ ...newGoal, [field]: value });
    }
  };
  
  // Handle progress slider change
  const handleProgressChange = (e, goalId) => {
    const value = parseInt(e.target.value);
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, progress: value };
      }
      return goal;
    }));
  };
  
  // Add new goal
  const handleAddGoal = () => {
    const goalToAdd = {
      ...newGoal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0
    };
    
    setGoals([...goals, goalToAdd]);
    setNewGoal({
      id: '',
      title: '',
      description: '',
      deadline: '',
      progress: 0,
      why: '',
      implications: '',
      milestones: [],
      miniActionPlan: []
    });
  };
  
  // Start editing a goal
  const handleEditGoal = (goalId) => {
    setEditingGoalId(goalId);
    setIsEditing(true);
  };
  
  // Save edited goal
  const handleSaveEdit = () => {
    setIsEditing(false);
    setEditingGoalId(null);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingGoalId(null);
  };
  
  // Delete goal
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId));
      if (editingGoalId === goalId) {
        setIsEditing(false);
        setEditingGoalId(null);
      }
    }
  };
  
  // Handle milestone input changes
  const handleMilestoneInputChange = (field, value) => {
    setNewMilestone({ ...newMilestone, [field]: value });
  };
  
  // Add milestone to current goal
  const handleAddMilestone = () => {
    const milestoneToAdd = {
      ...newMilestone,
      id: Date.now().toString(),
      completed: false
    };
    
    if (isEditing) {
      setGoals(goals.map(goal => {
        if (goal.id === editingGoalId) {
          return {
            ...goal,
            milestones: [...(goal.milestones || []), milestoneToAdd]
          };
        }
        return goal;
      }));
    } else {
      setNewGoal({
        ...newGoal,
        milestones: [...(newGoal.milestones || []), milestoneToAdd]
      });
    }
    
    setNewMilestone({
      id: '',
      title: '',
      dueDate: '',
      completed: false
    });
    setShowMilestoneForm(false);
  };
  
  // Toggle milestone completion
  const handleToggleMilestone = (goalId, milestoneId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(milestone => {
            if (milestone.id === milestoneId) {
              return { ...milestone, completed: !milestone.completed };
            }
            return milestone;
          })
        };
      }
      return goal;
    }));
  };
  
  // Delete milestone
  const handleDeleteMilestone = (goalId, milestoneId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.filter(milestone => milestone.id !== milestoneId)
        };
      }
      return goal;
    }));
  };
  
  // Handle mini action plan step input changes
  const handleActionStepInputChange = (field, value) => {
    setNewActionStep({ ...newActionStep, [field]: value });
  };
  
  // Add action step to current goal
  const handleAddActionStep = () => {
    const stepToAdd = {
      ...newActionStep,
      id: Date.now().toString(),
      completed: false
    };
    
    if (isEditing) {
      setGoals(goals.map(goal => {
        if (goal.id === editingGoalId) {
          return {
            ...goal,
            miniActionPlan: [...(goal.miniActionPlan || []), stepToAdd]
          };
        }
        return goal;
      }));
    } else {
      setNewGoal({
        ...newGoal,
        miniActionPlan: [...(newGoal.miniActionPlan || []), stepToAdd]
      });
    }
    
    setNewActionStep({
      id: '',
      text: '',
      completed: false
    });
    setShowMiniActionPlanForm(false);
  };
  
  // Toggle action step completion
  const handleToggleActionStep = (goalId, stepId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          miniActionPlan: goal.miniActionPlan.map(step => {
            if (step.id === stepId) {
              return { ...step, completed: !step.completed };
            }
            return step;
          })
        };
      }
      return goal;
    }));
  };
  
  // Delete action step
  const handleDeleteActionStep = (goalId, stepId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          miniActionPlan: goal.miniActionPlan.filter(step => step.id !== stepId)
        };
      }
      return goal;
    }));
  };
  
  // Calculate goal completion percentage based on milestones
  const calculateGoalCompletion = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal.progress || 0;
    }
    
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Navigate to Action Plan
  const goToActionPlan = () => {
    navigate('/action-plan');
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
        <p>Set and track your career goals with clear milestones and action plans.</p>
      </div>
      
      {/* Goal Form */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h2>{isEditing ? 'Edit Goal' : 'Add New Goal'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
            <input 
              type="text" 
              value={isEditing ? goals.find(g => g.id === editingGoalId)?.title || '' : newGoal.title}
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline:</label>
            <input 
              type="date" 
              value={isEditing ? goals.find(g => g.id === editingGoalId)?.deadline || '' : newGoal.deadline}
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
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
          <textarea 
            value={isEditing ? goals.find(g => g.id === editingGoalId)?.description || '' : newGoal.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Why is this goal important?</label>
          <textarea 
            value={isEditing ? goals.find(g => g.id === editingGoalId)?.why || '' : newGoal.why}
            onChange={(e) => handleInputChange('why', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>What are the implications of achieving this goal?</label>
          <textarea 
            value={isEditing ? goals.find(g => g.id === editingGoalId)?.implications || '' : newGoal.implications}
            onChange={(e) => handleInputChange('implications', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
        
        {/* Milestones Section */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>Milestones</h3>
            <button 
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {showMilestoneForm ? 'Cancel' : 'Add Milestone'}
            </button>
          </div>
          
          {showMilestoneForm && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '1rem', 
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                  <input 
                    type="text" 
                    value={newMilestone.title}
                    onChange={(e) => handleMilestoneInputChange('title', e.target.value)}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date:</label>
                  <input 
                    type="date" 
                    value={newMilestone.dueDate}
                    onChange={(e) => handleMilestoneInputChange('dueDate', e.target.value)}
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
              <button 
                onClick={handleAddMilestone}
                style={{
                  backgroundColor: 'rgba(10,177,150,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Add Milestone
              </button>
            </div>
          )}
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1rem', 
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {isEditing ? (
              goals.find(g => g.id === editingGoalId)?.milestones?.length > 0 ? (
                goals.find(g => g.id === editingGoalId)?.milestones.map((milestone, index) => (
                  <div 
                    key={milestone.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '5px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={milestone.completed}
                        onChange={() => handleToggleMilestone(editingGoalId, milestone.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <div>
                        <div style={{ textDecoration: milestone.completed ? 'line-through' : 'none' }}>
                          {milestone.title}
                        </div>
                        {milestone.dueDate && (
                          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            Due: {formatDate(milestone.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteMilestone(editingGoalId, milestone.id)}
                      style={{
                        backgroundColor: 'rgba(255,100,100,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.7 }}>No milestones added yet.</p>
              )
            ) : (
              newGoal.milestones?.length > 0 ? (
                newGoal.milestones.map((milestone, index) => (
                  <div 
                    key={milestone.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '5px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div>
                      <div>{milestone.title}</div>
                      {milestone.dueDate && (
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                          Due: {formatDate(milestone.dueDate)}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setNewGoal({
                          ...newGoal,
                          milestones: newGoal.milestones.filter((_, i) => i !== index)
                        });
                      }}
                      style={{
                        backgroundColor: 'rgba(255,100,100,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.7 }}>No milestones added yet.</p>
              )
            )}
          </div>
        </div>
        
        {/* Mini Action Plan Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>Mini Action Plan</h3>
            <button 
              onClick={() => setShowMiniActionPlanForm(!showMiniActionPlanForm)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {showMiniActionPlanForm ? 'Cancel' : 'Add Step'}
            </button>
          </div>
          
          {showMiniActionPlanForm && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '1rem', 
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Step Description:</label>
                <input 
                  type="text" 
                  value={newActionStep.text}
                  onChange={(e) => handleActionStepInputChange('text', e.target.value)}
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
              <button 
                onClick={handleAddActionStep}
                style={{
                  backgroundColor: 'rgba(10,177,150,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Add Step
              </button>
            </div>
          )}
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1rem', 
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {isEditing ? (
              goals.find(g => g.id === editingGoalId)?.miniActionPlan?.length > 0 ? (
                goals.find(g => g.id === editingGoalId)?.miniActionPlan.map((step, index) => (
                  <div 
                    key={step.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '5px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={step.completed}
                        onChange={() => handleToggleActionStep(editingGoalId, step.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <div style={{ textDecoration: step.completed ? 'line-through' : 'none' }}>
                        {step.text}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteActionStep(editingGoalId, step.id)}
                      style={{
                        backgroundColor: 'rgba(255,100,100,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.7 }}>No action steps added yet.</p>
              )
            ) : (
              newGoal.miniActionPlan?.length > 0 ? (
                newGoal.miniActionPlan.map((step, index) => (
                  <div 
                    key={step.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '5px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div>{step.text}</div>
                    <button 
                      onClick={() => {
                        setNewGoal({
                          ...newGoal,
                          miniActionPlan: newGoal.miniActionPlan.filter((_, i) => i !== index)
                        });
                      }}
                      style={{
                        backgroundColor: 'rgba(255,100,100,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.7 }}>No action steps added yet.</p>
              )
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveEdit}
                style={{
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save Changes
              </button>
              <button 
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleAddGoal}
              disabled={!newGoal.title}
              style={{
                background: newGoal.title ? 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: newGoal.title ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              Add Goal
            </button>
          )}
        </div>
      </div>
      
      {/* Goals List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Your Goals</h2>
          <button 
            onClick={goToActionPlan}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Action Plan
          </button>
        </div>
        
        {goals.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {goals.map(goal => (
              <div 
                key={goal.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{goal.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEditGoal(goal.id)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{
                        backgroundColor: 'rgba(255,100,100,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {goal.deadline && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Deadline:</strong> {formatDate(goal.deadline)}
                  </div>
                )}
                
                {goal.description && (
                  <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {goal.description}
                  </div>
                )}
                
                {goal.why && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Why:</strong> {goal.why}
                  </div>
                )}
                
                {goal.implications && (
                  <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <strong>Implications:</strong> {goal.implications}
                  </div>
                )}
                
                {/* Mini Action Plan Dropdown */}
                {goal.miniActionPlan && goal.miniActionPlan.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                        <strong>Mini Action Plan</strong>
                      </summary>
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        padding: '0.5rem', 
                        borderRadius: '5px',
                        marginLeft: '1rem'
                      }}>
                        {goal.miniActionPlan.map((step, index) => (
                          <div 
                            key={step.id || index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={step.completed}
                              onChange={() => handleToggleActionStep(goal.id, step.id)}
                              style={{ marginRight: '0.5rem' }}
                            />
                            <span style={{ textDecoration: step.completed ? 'line-through' : 'none' }}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span>Progress: {goal.progress}%</span>
                    <span>{goal.milestones?.length || 0} milestones</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${goal.progress}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                      borderRadius: '5px'
                    }} />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={goal.progress || 0}
                    onChange={(e) => handleProgressChange(e, goal.id)}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '2rem', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>You haven't set any goals yet. Add your first goal to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
