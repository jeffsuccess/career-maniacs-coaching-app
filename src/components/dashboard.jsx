import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State for goals with localStorage persistence
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  // State for action plan items with localStorage persistence
  const [actionPlan, setActionPlan] = useState(() => {
    const savedActionPlan = localStorage.getItem('actionplan');
    return savedActionPlan ? JSON.parse(savedActionPlan) : [];
  });
  
  // State for target companies with localStorage persistence
  const [targetCompanies, setTargetCompanies] = useState(() => {
    const savedCompanies = localStorage.getItem('targetcompanies');
    return savedCompanies ? JSON.parse(savedCompanies) : [];
  });
  
  // State for stories with localStorage persistence
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for expanded goal mini action plans
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedGoals = localStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      
      const savedActionPlan = localStorage.getItem('actionplan');
      if (savedActionPlan) {
        setActionPlan(JSON.parse(savedActionPlan));
      }
      
      const savedCompanies = localStorage.getItem('targetcompanies');
      if (savedCompanies) {
        setTargetCompanies(JSON.parse(savedCompanies));
      }
      
      const savedStories = localStorage.getItem('stories');
      if (savedStories) {
        setStories(JSON.parse(savedStories));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, []);
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalProgress = 0;
    let totalItems = 0;
    
    // Goals progress
    if (goals.length > 0) {
      const goalsProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      totalProgress += goalsProgress;
      totalItems += goals.length;
    }
    
    // Action plan progress
    if (actionPlan.length > 0) {
      const completedTasks = actionPlan.filter(task => task.completed).length;
      const actionPlanProgress = (completedTasks / actionPlan.length) * 100;
      totalProgress += actionPlanProgress;
      totalItems += 1;
    }
    
    // Target companies progress
    if (targetCompanies.length > 0) {
      const appliedCompanies = targetCompanies.filter(company => 
        company.status === 'Applied' || 
        company.status === 'Interview Scheduled' || 
        company.status === 'Interview Completed' ||
        company.status === 'Offer Received' ||
        company.status === 'Accepted'
      ).length;
      
      const targetCompaniesProgress = (appliedCompanies / targetCompanies.length) * 100;
      totalProgress += targetCompaniesProgress;
      totalItems += 1;
    }
    
    // Stories progress
    if (stories.length > 0) {
      const practicedStories = stories.filter(story => story.practiceCount > 0).length;
      const storiesProgress = (practicedStories / stories.length) * 100;
      totalProgress += storiesProgress;
      totalItems += 1;
    }
    
    return totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  // Toggle mini action plan visibility
  const toggleMiniActionPlan = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };
  
  // Update mini action plan step completion
  const updateMiniActionPlanStep = (goalId, stepId, completed) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId && goal.miniActionPlan) {
        const updatedMiniActionPlan = goal.miniActionPlan.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              completed
            };
          }
          return step;
        });
        
        return {
          ...goal,
          miniActionPlan: updatedMiniActionPlan
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storageUpdated'));
  };
  
  // Add new mini action plan step
  const [newStepText, setNewStepText] = useState('');
  const [addingStepForGoalId, setAddingStepForGoalId] = useState(null);
  
  const startAddingStep = (goalId) => {
    setAddingStepForGoalId(goalId);
    setNewStepText('');
  };
  
  const cancelAddingStep = () => {
    setAddingStepForGoalId(null);
    setNewStepText('');
  };
  
  const addMiniActionPlanStep = (goalId) => {
    if (!newStepText.trim()) {
      return;
    }
    
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newStep = {
          id: Date.now().toString(),
          text: newStepText.trim(),
          completed: false
        };
        
        return {
          ...goal,
          miniActionPlan: [...(goal.miniActionPlan || []), newStep]
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storageUpdated'));
    
    // Reset form
    setAddingStepForGoalId(null);
    setNewStepText('');
  };
  
  // Delete mini action plan step
  const deleteMiniActionPlanStep = (goalId, stepId) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId && goal.miniActionPlan) {
        return {
          ...goal,
          miniActionPlan: goal.miniActionPlan.filter(step => step.id !== stepId)
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storageUpdated'));
  };
  
  // Navigate to specific sections
  const navigateTo = (path) => {
    navigate(path);
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
        Dashboard
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Welcome to your Career Maniacs dashboard. Track your progress and access key features.</p>
      </div>
      
      {/* Overall Progress */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h2>Overall Progress</h2>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {calculateOverallProgress()}%
        </div>
        <div style={{ 
          width: '100%', 
          height: '10px', 
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${calculateOverallProgress()}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
            borderRadius: '5px'
          }} />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h2>Quick Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <button 
            onClick={() => navigateTo('/goals')}
            style={{
              backgroundColor: 'rgba(10,177,150,0.2)',
              border: '1px solid rgba(10,177,150,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Goals</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              {goals.length} goals set
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('/action-plan')}
            style={{
              backgroundColor: 'rgba(0,194,199,0.2)',
              border: '1px solid rgba(0,194,199,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Action Plan</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              {actionPlan.filter(task => !task.completed).length} pending tasks
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('/target-companies')}
            style={{
              backgroundColor: 'rgba(22,179,247,0.2)',
              border: '1px solid rgba(22,179,247,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Target Companies</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              {targetCompanies.length} companies
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('/story-vault')}
            style={{
              backgroundColor: 'rgba(255,184,0,0.2)',
              border: '1px solid rgba(255,184,0,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Story Vault</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              {stories.length} stories
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('/storytelling-practice')}
            style={{
              backgroundColor: 'rgba(255,122,0,0.2)',
              border: '1px solid rgba(255,122,0,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Practice</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Storytelling
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('/report-generator')}
            style={{
              backgroundColor: 'rgba(153,102,255,0.2)',
              border: '1px solid rgba(153,102,255,0.5)',
              color: 'white',
              padding: '1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Reports</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Generate Reports
            </span>
          </button>
        </div>
      </div>
      
      {/* Goals Overview */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Goals Overview</h2>
          <button 
            onClick={() => navigateTo('/goals')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            View All
          </button>
        </div>
        
        {goals.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {goals.slice(0, 3).map(goal => (
              <div 
                key={goal.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{goal.title}</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Progress:</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${goal.progress || 0}%`, 
                      height: '100%', 
                      backgroundColor: '#0AB196',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
                
                {goal.deadline && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    Deadline: {formatDate(goal.deadline)}
                  </div>
                )}
                
                {goal.description && (
                  <div style={{ 
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    position: 'relative'
                  }}>
                    {goal.description}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      height: '20px', 
                      background: 'linear-gradient(transparent, rgba(30, 30, 30, 1))' 
                    }} />
                  </div>
                )}
                
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => toggleMiniActionPlan(goal.id)}
                    style={{
                      backgroundColor: 'rgba(10,177,150,0.2)',
                      border: '1px solid rgba(10,177,150,0.5)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Mini Action Plan</span>
                    <span>{expandedGoalId === goal.id ? '▲' : '▼'}</span>
                  </button>
                  
                  {expandedGoalId === goal.id && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.75rem',
                      borderRadius: '5px'
                    }}>
                      {goal.miniActionPlan && goal.miniActionPlan.length > 0 ? (
                        <div>
                          {goal.miniActionPlan.map((step) => (
                            <div 
                              key={step.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                padding: '0.5rem',
                                borderRadius: '5px'
                              }}
                            >
                              <input 
                                type="checkbox"
                                checked={step.completed}
                                onChange={(e) => updateMiniActionPlanStep(goal.id, step.id, e.target.checked)}
                                style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
                              />
                              <span style={{ 
                                textDecoration: step.completed ? 'line-through' : 'none',
                                color: step.completed ? 'rgba(255,255,255,0.5)' : 'white',
                                flex: 1
                              }}>
                                {step.text}
                              </span>
                              <button
                                onClick={() => deleteMiniActionPlanStep(goal.id, step.id)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: 'rgba(255,100,100,0.7)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  padding: '0.25rem',
                                  marginLeft: '0.5rem'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                          No action steps yet.
                        </div>
                      )}
                      
                      {addingStepForGoalId === goal.id ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            display: 'flex',
                            marginBottom: '0.5rem'
                          }}>
                            <input 
                              type="text"
                              value={newStepText}
                              onChange={(e) => setNewStepText(e.target.value)}
                              placeholder="Enter new step..."
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '5px 0 0 5px'
                              }}
                            />
                            <button
                              onClick={() => addMiniActionPlanStep(goal.id)}
                              disabled={!newStepText.trim()}
                              style={{
                                backgroundColor: newStepText.trim() ? 'rgba(10,177,150,0.5)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0 5px 5px 0',
                                cursor: newStepText.trim() ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Add
                            </button>
                          </div>
                          <button
                            onClick={cancelAddingStep}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              border: 'none',
                              color: 'white',
                              padding: '0.5rem',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startAddingStep(goal.id)}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            width: '100%',
                            marginTop: '0.5rem'
                          }}
                        >
                          + Add Step
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '2rem', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>No goals set yet. Start by adding your career goals.</p>
            <button 
              onClick={() => navigateTo('/goals')}
              style={{
                backgroundColor: 'rgba(10,177,150,0.3)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Add Goals
            </button>
          </div>
        )}
      </div>
      
      {/* Action Plan Overview */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Action Plan</h2>
          <button 
            onClick={() => navigateTo('/action-plan')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            View All
          </button>
        </div>
        
        {actionPlan.filter(task => !task.completed).length > 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1rem', 
            borderRadius: '10px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Pending Tasks</h3>
            {actionPlan
              .filter(task => !task.completed)
              .slice(0, 5)
              .map(task => (
                <div 
                  key={task.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: task.priority === 'high' ? '#dc3545' : 
                                     task.priority === 'medium' ? '#ffc107' : '#0AB196',
                    borderRadius: '50%',
                    marginRight: '0.75rem',
                    marginTop: '0.25rem'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{task.text}</div>
                    {task.dueDate && (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
            
            {actionPlan.filter(task => !task.completed).length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  +{actionPlan.filter(task => !task.completed).length - 5} more tasks
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '2rem', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>No pending tasks. Great job!</p>
          </div>
        )}
      </div>
      
      {/* Target Companies Overview */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Target Companies</h2>
          <button 
            onClick={() => navigateTo('/target-companies')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            View All
          </button>
        </div>
        
        {targetCompanies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {targetCompanies.slice(0, 4).map(company => (
              <div 
                key={company.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{company.name}</h3>
                {company.position && (
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{company.position}</div>
                )}
                {company.status && (
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: 
                      company.status === 'Researching' ? 'rgba(255,255,255,0.1)' :
                      company.status === 'Applied' ? 'rgba(0,123,255,0.2)' :
                      company.status === 'Interview Scheduled' ? 'rgba(255,193,7,0.2)' :
                      company.status === 'Interview Completed' ? 'rgba(23,162,184,0.2)' :
                      company.status === 'Offer Received' ? 'rgba(40,167,69,0.2)' :
                      company.status === 'Accepted' ? 'rgba(40,167,69,0.3)' :
                      'rgba(220,53,69,0.2)',
                    color: 
                      company.status === 'Researching' ? 'rgba(255,255,255,0.8)' :
                      company.status === 'Applied' ? '#0d6efd' :
                      company.status === 'Interview Scheduled' ? '#ffc107' :
                      company.status === 'Interview Completed' ? '#17a2b8' :
                      company.status === 'Offer Received' ? '#28a745' :
                      company.status === 'Accepted' ? '#28a745' :
                      '#dc3545',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                    marginTop: 'auto'
                  }}>
                    {company.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '2rem', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>No target companies added yet.</p>
            <button 
              onClick={() => navigateTo('/target-companies')}
              style={{
                backgroundColor: 'rgba(22,179,247,0.3)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Add Companies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
