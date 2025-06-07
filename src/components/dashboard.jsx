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
  
  // Get status color for target companies
  const getStatusColor = (status) => {
    switch (status) {
      case 'Researching':
        return { bg: 'rgba(255,193,7,0.2)', border: 'rgba(255,193,7,0.5)', text: '#ffc107' };
      case 'Applied':
        return { bg: 'rgba(0,123,255,0.2)', border: 'rgba(0,123,255,0.5)', text: '#007bff' };
      case 'Interview Scheduled':
        return { bg: 'rgba(23,162,184,0.2)', border: 'rgba(23,162,184,0.5)', text: '#17a2b8' };
      case 'Interview Completed':
        return { bg: 'rgba(102,16,242,0.2)', border: 'rgba(102,16,242,0.5)', text: '#6610f2' };
      case 'Offer Received':
        return { bg: 'rgba(40,167,69,0.2)', border: 'rgba(40,167,69,0.5)', text: '#28a745' };
      case 'Accepted':
        return { bg: 'rgba(40,167,69,0.3)', border: 'rgba(40,167,69,0.7)', text: '#28a745' };
      case 'Rejected':
        return { bg: 'rgba(220,53,69,0.2)', border: 'rgba(220,53,69,0.5)', text: '#dc3545' };
      default:
        return { bg: 'rgba(108,117,125,0.2)', border: 'rgba(108,117,125,0.5)', text: '#6c757d' };
    }
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
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={() => navigateTo('/goals')}
          style={{
            backgroundColor: 'rgba(10,177,150,0.2)',
            border: '1px solid rgba(10,177,150,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Goals
        </button>
        
        <button 
          onClick={() => navigateTo('/action-plan')}
          style={{
            backgroundColor: 'rgba(0,194,199,0.2)',
            border: '1px solid rgba(0,194,199,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Action Plan
        </button>
        
        <button 
          onClick={() => navigateTo('/target-companies')}
          style={{
            backgroundColor: 'rgba(22,179,247,0.2)',
            border: '1px solid rgba(22,179,247,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Target Companies
        </button>
        
        <button 
          onClick={() => navigateTo('/story-vault')}
          style={{
            backgroundColor: 'rgba(255,184,0,0.2)',
            border: '1px solid rgba(255,184,0,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Story Vault
        </button>
        
        <button 
          onClick={() => navigateTo('/storytelling-practice')}
          style={{
            backgroundColor: 'rgba(255,122,0,0.2)',
            border: '1px solid rgba(255,122,0,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Practice
        </button>
        
        <button 
          onClick={() => navigateTo('/report-generator')}
          style={{
            backgroundColor: 'rgba(153,102,255,0.2)',
            border: '1px solid rgba(153,102,255,0.5)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          Reports
        </button>
      </div>
      
      {/* Target Companies Section */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {targetCompanies.map(company => {
                  const statusColors = getStatusColor(company.status);
                  return (
                    <tr key={company.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', borderRadius: '5px 0 0 5px' }}>{company.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          border: `1px solid ${statusColors.border}`,
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {company.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', borderRadius: '0 5px 5px 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {company.lastUpdated ? formatDate(company.lastUpdated) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
            <p>No target companies added yet.</p>
            <button 
              onClick={() => navigateTo('/target-companies')}
              style={{
                backgroundColor: 'rgba(22,179,247,0.2)',
                border: '1px solid rgba(22,179,247,0.5)',
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
                
                {/* Mini Action Plan */}
                <div style={{ marginTop: 'auto' }}>
                  <button 
                    onClick={() => toggleMiniActionPlan(goal.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Mini Action Plan</span>
                    <span style={{ transform: expandedGoalId === goal.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  
                  {expandedGoalId === goal.id && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {goal.miniActionPlan && goal.miniActionPlan.length > 0 ? (
                        <div>
                          {goal.miniActionPlan.map(step => (
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
                              <div style={{ flex: 1, textDecoration: step.completed ? 'line-through' : 'none' }}>
                                {step.text}
                              </div>
                              <button
                                onClick={() => deleteMiniActionPlanStep(goal.id, step.id)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: 'rgba(255,255,255,0.5)',
                                  cursor: 'pointer',
                                  padding: '0 0.25rem'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                          No steps added yet.
                        </div>
                      )}
                      
                      {addingStepForGoalId === goal.id ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <input 
                            type="text"
                            value={newStepText}
                            onChange={(e) => setNewStepText(e.target.value)}
                            placeholder="Enter step description"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '5px',
                              color: 'white',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => addMiniActionPlanStep(goal.id)}
                              style={{
                                backgroundColor: 'rgba(10,177,150,0.2)',
                                border: '1px solid rgba(10,177,150,0.5)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Add
                            </button>
                            <button
                              onClick={cancelAddingStep}
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startAddingStep(goal.id)}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
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
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
            <p>No goals added yet.</p>
            <button 
              onClick={() => navigateTo('/goals')}
              style={{
                backgroundColor: 'rgba(10,177,150,0.2)',
                border: '1px solid rgba(10,177,150,0.5)',
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
        
        {actionPlan.length > 0 ? (
          <div>
            {actionPlan.filter(task => !task.completed).slice(0, 5).map(task => (
              <div 
                key={task.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  marginRight: '1rem'
                }} />
                <div style={{ flex: 1 }}>
                  <div>{task.title}</div>
                  {task.dueDate && (
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                      Due: {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
                <div style={{ 
                  backgroundColor: task.priority === 'high' ? 'rgba(220,53,69,0.2)' : 
                                  task.priority === 'medium' ? 'rgba(255,193,7,0.2)' : 
                                  'rgba(40,167,69,0.2)',
                  color: task.priority === 'high' ? '#dc3545' : 
                         task.priority === 'medium' ? '#ffc107' : 
                         '#28a745',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem'
                }}>
                  {task.priority || 'low'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
            <p>No action items added yet.</p>
            <button 
              onClick={() => navigateTo('/action-plan')}
              style={{
                backgroundColor: 'rgba(0,194,199,0.2)',
                border: '1px solid rgba(0,194,199,0.5)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Add Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
