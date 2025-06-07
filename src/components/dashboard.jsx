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
    const savedActionPlan = localStorage.getItem('actionPlan');
    return savedActionPlan ? JSON.parse(savedActionPlan) : [];
  });
  
  // State for target companies with localStorage persistence
  const [targetCompanies, setTargetCompanies] = useState(() => {
    const savedCompanies = localStorage.getItem('targetCompanies');
    return savedCompanies ? JSON.parse(savedCompanies) : [];
  });
  
  // State for stories with localStorage persistence
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for expanded goal mini action plans
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
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
        company.status === 'Interviewing' || 
        company.status === 'Offer'
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Toggle mini action plan visibility
  const toggleMiniActionPlan = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };
  
  // Update mini action plan step completion
  const updateMiniActionPlanStep = (goalId, stepIndex, completed) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId && goal.miniActionPlan) {
        const updatedMiniActionPlan = [...goal.miniActionPlan];
        updatedMiniActionPlan[stepIndex] = {
          ...updatedMiniActionPlan[stepIndex],
          completed
        };
        
        return {
          ...goal,
          miniActionPlan: updatedMiniActionPlan
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
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
                
                {goal.why && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Why:</strong> {goal.why}
                  </div>
                )}
                
                {goal.implications && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Implications:</strong> {goal.implications}
                  </div>
                )}
                
                {goal.miniActionPlan && goal.miniActionPlan.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
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
                        padding: '0.5rem',
                        borderRadius: '5px'
                      }}>
                        {goal.miniActionPlan.map((step, index) => (
                          <div 
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <input 
                              type="checkbox"
                              checked={step.completed}
                              onChange={(e) => updateMiniActionPlanStep(goal.id, index, e.target.checked)}
                              style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
                            />
                            <span style={{ 
                              textDecoration: step.completed ? 'line-through' : 'none',
                              color: step.completed ? 'rgba(255,255,255,0.5)' : 'white'
                            }}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>No goals have been set yet. Click "View All" to add your first goal.</p>
          </div>
        )}
      </div>
      
      {/* Recent Activity */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px'
      }}>
        <h2>Recent Activity</h2>
        
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <p>Your recent activities will appear here as you use the platform.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
