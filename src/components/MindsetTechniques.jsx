import React, { useState, useEffect } from 'react';

const MindsetTechniques = () => {
  // State for expanded sections
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Sample techniques data
  const [techniques, setTechniques] = useState([
    {
      id: 'neuroplasticity',
      title: 'Neuroplasticity: Rewire or Retire',
      description: 'The brain can physically rewire itself based on repeated focus and actions, thanks to BDNF (brain-derived neurotrophic factor).',
      detailedExplanation: `Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections throughout life. This capability allows neurons (brain cells) to adjust their activities in response to new situations or changes in their environment.

When you repeatedly practice a new skill or thought pattern, your brain physically changes - neurons that fire together, wire together. This process is supported by BDNF (brain-derived neurotrophic factor), a protein that acts like fertilizer for brain cells, encouraging growth and strengthening neural connections.

This means you can literally rewire your brain to support new habits, skills, and thought patterns through consistent practice and focused attention. The alternative is to let old, potentially unhelpful neural pathways continue to dominate your thinking and behavior ("retire").

How to Apply This Technique:
1. Identify a limiting belief or habit you want to change
2. Create a new, empowering alternative thought or behavior
3. Practice the new pattern consistently (ideally daily) for at least 30 days
4. Visualize success to strengthen neural pathways even when not actively practicing
5. Celebrate small wins to reinforce the new wiring with dopamine`,
      quote: 'Where focus goes, energy flows.',
      practices: []
    },
    {
      id: 'anchoring',
      title: 'State-Dependent Learning "Anchoring"',
      description: 'Your brain associates physical states with mental states. Create anchors that trigger peak performance states on demand.',
      detailedExplanation: `State-dependent learning, or "anchoring," is based on the principle that your brain creates associations between your physical state and your mental/emotional state. When you're in a peak mental state (confident, focused, creative), you can create a physical "anchor" that your brain will associate with that state.

Once established, you can later activate the anchor to help trigger that same peak mental state when needed, such as before an interview or important presentation.

This technique leverages the mind-body connection and works because your brain doesn't distinguish between a real experience and a vividly imagined one when creating these associations.

How to Create an Anchor:
1. Recall a time when you felt extremely confident, focused, or in whatever peak state you want to anchor
2. Fully re-experience that moment - see what you saw, hear what you heard, feel what you felt
3. As you reach the peak of this state, perform a unique physical action (e.g., press your thumb and middle finger together, make a fist, touch a specific spot on your wrist)
4. Release the anchor as the feeling subsides
5. Repeat 3-5 times to strengthen the association
6. Test your anchor by clearing your mind, then activating the anchor to see if the state returns
7. Use regularly before challenging situations to maintain its effectiveness

Common anchors include specific gestures, touching a particular spot on your body, adopting a power pose, or even using a specific scent or sound.`,
      quote: 'Your body leads, your mind follows.',
      practices: []
    },
    {
      id: 'microWins',
      title: 'Dopamine-Driven Micro Wins',
      description: 'Small wins trigger the release of dopamine, creating momentum and motivation. Break big goals into micro-achievements.',
      detailedExplanation: `The Dopamine-Driven Micro Wins technique leverages your brain's reward system to build momentum and motivation toward larger goals. Dopamine is a neurotransmitter that plays a major role in motivation, pleasure, and learning.

When you achieve something, even something small, your brain releases dopamine, creating a feeling of satisfaction and reinforcing the behavior that led to the achievement. By intentionally breaking down larger goals into very small, easily achievable "micro wins," you can create a steady stream of dopamine hits that maintain motivation and build momentum.

This technique is particularly effective for overcoming procrastination, building new habits, or tackling projects that feel overwhelming.

How to Apply This Technique:
1. Break down larger goals into the smallest possible units of progress
2. Make each micro win clearly defined and achievable within a short time frame (5-30 minutes)
3. Track and celebrate each micro win to maximize the dopamine response
4. Create visible progress indicators (checklists, progress bars, etc.)
5. Stack micro wins by completing several in sequence to build momentum
6. Gradually increase the challenge level as your motivation and confidence grow

Examples of micro wins:
- Writing just one paragraph of your cover letter
- Researching one potential networking contact
- Preparing one interview story
- Reading one page of a professional development book
- Making one LinkedIn connection request`,
      quote: 'Today\'s Micro Wins:',
      practices: []
    },
    {
      id: 'primeProgramming',
      title: 'Prime Time Mind Programming',
      description: 'The first 20 minutes after waking and the last 20 minutes before sleep are when your brain is most receptive to programming. Use these windows strategically.',
      detailedExplanation: `Prime Time Mind Programming takes advantage of specific windows of time when your brain is most receptive to new information and suggestion. Research shows that your brain operates in different brainwave states throughout the day, with Alpha and Theta states being particularly conducive to learning and reprogramming.

The two most powerful windows are:
1. The first 20 minutes after waking - Your brain is transitioning from Theta to Alpha waves, creating an ideal state for setting intentions and programming your subconscious mind for the day ahead.
2. The last 20 minutes before sleep - Your brain is transitioning from Alpha to Theta waves, making it highly receptive to suggestion and visualization.

Additionally, Non-Sleep Deep Rest (NSDR) protocols can induce similar receptive brain states during the day. NSDR combines elements of meditation, self-hypnosis, and yoga nidra to create a deeply relaxed but conscious state where the brain is highly receptive to new programming.

How to Apply This Technique:

Morning Programming (First 20 Minutes After Waking):
- Review your goals and intentions for the day
- Visualize successful outcomes
- Read or listen to affirmations
- Practice gratitude
- Avoid checking email, news, or social media during this time

Evening Programming (Last 20 Minutes Before Sleep):
- Review accomplishments from the day
- Visualize progress toward your goals
- Set specific questions for your subconscious to work on while you sleep
- Practice gratitude
- Avoid screens, news, or stressful content

NSDR Protocol (10-20 Minutes During the Day):
- Find a quiet space where you won't be disturbed
- Lie down or sit comfortably
- Follow a guided NSDR session (many are available online)
- Use this state to visualize achieving your goals or mastering specific skills
- Gradually return to full alertness after the session`,
      quote: 'Program your mind or someone else will.',
      practices: []
    }
  ]);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingTechniqueId, setEditingTechniqueId] = useState(null);
  const [editingPracticeId, setEditingPracticeId] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    results: ''
  });
  
  // Load techniques from localStorage on component mount
  useEffect(() => {
    const savedTechniques = localStorage.getItem('mindsetTechniques');
    if (savedTechniques) {
      try {
        setTechniques(JSON.parse(savedTechniques));
      } catch (error) {
        console.error('Error parsing saved techniques:', error);
      }
    }
  }, []);
  
  // Save techniques to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mindsetTechniques', JSON.stringify(techniques));
  }, [techniques]);
  
  // Toggle section expansion
  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
    setIsEditing(false);
  };
  
  // Start adding new practice
  const startAddingPractice = (techniqueId) => {
    setEditingTechniqueId(techniqueId);
    setEditingPracticeId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      results: ''
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
  
  // Save practice
  const savePractice = () => {
    const updatedTechniques = [...techniques];
    const techniqueIndex = updatedTechniques.findIndex(t => t.id === editingTechniqueId);
    
    if (techniqueIndex !== -1) {
      const technique = { ...updatedTechniques[techniqueIndex] };
      
      // Initialize practices array if it doesn't exist
      if (!technique.practices) {
        technique.practices = [];
      }
      
      if (editingPracticeId) {
        // Update existing practice
        const practiceIndex = technique.practices.findIndex(p => p.id === editingPracticeId);
        if (practiceIndex !== -1) {
          technique.practices[practiceIndex] = {
            ...technique.practices[practiceIndex],
            ...formData
          };
        }
      } else {
        // Add new practice
        const newPractice = {
          id: technique.practices.length > 0 ? 
            Math.max(...technique.practices.map(p => p.id)) + 1 : 1,
          ...formData
        };
        technique.practices = [...technique.practices, newPractice];
      }
      
      updatedTechniques[techniqueIndex] = technique;
      setTechniques(updatedTechniques);
    }
    
    setIsEditing(false);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Reminder message for mindset practice
  const reminderMessage = "Don't forget to check your daily Mindset Technique task as done!";
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Mindset Techniques
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Explore and practice these powerful mindset techniques to enhance your career journey.</p>
        <p style={{ 
          backgroundColor: 'rgba(10,177,150,0.1)', 
          padding: '1rem', 
          borderRadius: '5px',
          borderLeft: '4px solid #0AB196',
          marginTop: '1rem'
        }}>
          {reminderMessage}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {techniques.map(technique => (
          <div 
            key={technique.id}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div 
              onClick={() => toggleSection(technique.id)}
              style={{ 
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: expandedSection === technique.id ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>{technique.title}</h2>
                <p style={{ margin: 0 }}>{technique.description}</p>
              </div>
              <span style={{ fontSize: '1.5rem' }}>
                {expandedSection === technique.id ? '−' : '+'}
              </span>
            </div>
            
            {expandedSection === technique.id && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginTop: 0 }}>Detailed Explanation</h3>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {technique.detailedExplanation}
                  </div>
                  
                  {technique.quote && (
                    <blockquote style={{ 
                      borderLeft: '4px solid #0AB196',
                      paddingLeft: '1rem',
                      margin: '1.5rem 0',
                      fontStyle: 'italic'
                    }}>
                      {technique.quote}
                    </blockquote>
                  )}
                </div>
                
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ margin: 0 }}>Practice History</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startAddingPractice(technique.id);
                      }}
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
                      Add Practice
                    </button>
                  </div>
                  
                  {technique.practices && technique.practices.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {technique.practices.map(practice => (
                        <div 
                          key={practice.id}
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <strong>{formatDate(practice.date)}</strong>
                          </div>
                          <div>
                            <p><strong>Notes:</strong> {practice.notes}</p>
                            <p><strong>Results:</strong> {practice.results}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No practice sessions recorded yet. Click "Add Practice" to start.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Practice Form Modal */}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>
              {editingPracticeId ? 'Edit Practice' : 'Add New Practice'}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date:</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes:</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="What did you practice? How did you apply this technique?"
                style={{
                  width: '100%',
                  minHeight: '100px',
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Results:</label>
              <textarea 
                value={formData.results}
                onChange={(e) => handleInputChange('results', e.target.value)}
                placeholder="What results did you observe? How did this practice affect you?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
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
                onClick={savePractice}
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
                Save Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindsetTechniques;
