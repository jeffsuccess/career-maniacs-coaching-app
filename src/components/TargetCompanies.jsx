import React, { useState, useEffect } from 'react';

const TargetCompanies = () => {
  const [companies, setCompanies] = useState(() => {
    const savedCompanies = localStorage.getItem('targetCompanies');
    return savedCompanies ? JSON.parse(savedCompanies) : [
      {
        id: 1,
        name: 'Acme Corporation',
        website: 'https://www.acmecorp.com',
        keyPlayers: [
          { name: 'Jane Smith', title: 'VP of Engineering', contact: 'jane.smith@acmecorp.com' },
          { name: 'John Doe', title: 'Director of Product', contact: 'john.doe@acmecorp.com' }
        ],
        hiringManager: { firstName: 'Michael', lastName: 'Johnson', title: 'Senior Engineering Manager' },
        jobDescription: 'Senior Software Engineer position focusing on cloud infrastructure and distributed systems.',
        keyRequirements: [
          '5+ years experience with cloud platforms (AWS/Azure/GCP)',
          'Strong knowledge of distributed systems',
          'Experience with containerization and orchestration'
        ],
        datePosted: '2025-06-01',
        notes: 'Company is growing rapidly in the cloud services sector. Recent funding round of $50M.',
        status: 'Researching'
      }
    ];
  });

  const [currentCompany, setCurrentCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    keyPlayers: [],
    hiringManager: { firstName: '', lastName: '', title: '' },
    jobDescription: '',
    keyRequirements: [],
    datePosted: '',
    notes: '',
    status: 'Researching'
  });

  const [newKeyPlayer, setNewKeyPlayer] = useState({ name: '', title: '', contact: '' });
  const [newRequirement, setNewRequirement] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [linkedInData, setLinkedInData] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [extractionError, setExtractionError] = useState('');

  // Save companies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('targetCompanies', JSON.stringify(companies));
  }, [companies]);

  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle hiring manager input changes
  const handleHiringManagerChange = (field, value) => {
    setFormData({
      ...formData,
      hiringManager: {
        ...formData.hiringManager,
        [field]: value
      }
    });
  };

  // Handle key player input changes
  const handleKeyPlayerChange = (field, value) => {
    setNewKeyPlayer({
      ...newKeyPlayer,
      [field]: value
    });
  };

  // Add key player
  const addKeyPlayer = () => {
    if (newKeyPlayer.name.trim() === '') return;

    setFormData({
      ...formData,
      keyPlayers: [...formData.keyPlayers, { ...newKeyPlayer }]
    });

    setNewKeyPlayer({ name: '', title: '', contact: '' });
  };

  // Remove key player
  const removeKeyPlayer = (index) => {
    const updatedKeyPlayers = [...formData.keyPlayers];
    updatedKeyPlayers.splice(index, 1);

    setFormData({
      ...formData,
      keyPlayers: updatedKeyPlayers
    });
  };

  // Add requirement
  const addRequirement = () => {
    if (newRequirement.trim() === '') return;

    setFormData({
      ...formData,
      keyRequirements: [...formData.keyRequirements, newRequirement]
    });

    setNewRequirement('');
  };

  // Remove requirement
  const removeRequirement = (index) => {
    const updatedRequirements = [...formData.keyRequirements];
    updatedRequirements.splice(index, 1);

    setFormData({
      ...formData,
      keyRequirements: updatedRequirements
    });
  };

  // Save company
  const saveCompany = () => {
    if (formData.name.trim() === '') {
      alert('Please enter a company name.');
      return;
    }

    if (currentCompany) {
      // Update existing company
      const updatedCompanies = companies.map(company => 
        company.id === currentCompany.id ? { ...formData, id: company.id } : company
      );
      
      setCompanies(updatedCompanies);
    } else {
      // Create new company
      const newCompany = {
        ...formData,
        id: companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1
      };
      
      setCompanies([...companies, newCompany]);
    }
    
    resetForm();
  };

  // Edit company
  const editCompany = (company) => {
    setCurrentCompany(company);
    setFormData({
      ...company
    });
    setIsEditing(true);
  };

  // Delete company
  const deleteCompany = (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(company => company.id !== id));
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentCompany(null);
    setFormData({
      name: '',
      website: '',
      keyPlayers: [],
      hiringManager: { firstName: '', lastName: '', title: '' },
      jobDescription: '',
      keyRequirements: [],
      datePosted: '',
      notes: '',
      status: 'Researching'
    });
    setNewKeyPlayer({ name: '', title: '', contact: '' });
    setNewRequirement('');
    setIsEditing(false);
    setLinkedInData('');
    setExtractedData(null);
    setExtractionError('');
  };

  // Manual data entry instead of LinkedIn extraction
  const manualDataEntry = () => {
    // Set today's date
    const today = getTodayDateString();
    
    setFormData({
      ...formData,
      datePosted: today
    });
    
    setExtractionError('');
    setExtractedData(null);
  };

  // Status options
  const statusOptions = [
    'Researching',
    'Applied',
    'Interview Scheduled',
    'Interview Completed',
    'Offer Received',
    'Rejected',
    'Not Interested'
  ];

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
        Target Companies
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Track companies you're interested in, key contacts, and job opportunities.</p>
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {isEditing ? (
          // Company Form
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            padding: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>
              {currentCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Company Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name:</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter company name"
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
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website:</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter company website"
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
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Description:</label>
                <textarea 
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                  placeholder="Enter job description"
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Posted:</label>
                  <input 
                    type="date" 
                    value={formData.datePosted}
                    onChange={(e) => handleInputChange('datePosted', e.target.value)}
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
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Hiring Manager</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>First Name:</label>
                  <input 
                    type="text" 
                    value={formData.hiringManager.firstName}
                    onChange={(e) => handleHiringManagerChange('firstName', e.target.value)}
                    placeholder="Enter first name"
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
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Last Name:</label>
                  <input 
                    type="text" 
                    value={formData.hiringManager.lastName}
                    onChange={(e) => handleHiringManagerChange('lastName', e.target.value)}
                    placeholder="Enter last name"
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                <input 
                  type="text" 
                  value={formData.hiringManager.title}
                  onChange={(e) => handleHiringManagerChange('title', e.target.value)}
                  placeholder="Enter title"
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Key Players</h3>
              
              {formData.keyPlayers.map((player, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{player.name}</strong>
                    {player.title && <span style={{ opacity: 0.7 }}> - {player.title}</span>}
                    {player.contact && <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{player.contact}</div>}
                  </div>
                  <button 
                    onClick={() => removeKeyPlayer(index)}
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
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '5px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
                    <input 
                      type="text" 
                      value={newKeyPlayer.name}
                      onChange={(e) => handleKeyPlayerChange('name', e.target.value)}
                      placeholder="Enter name"
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                    <input 
                      type="text" 
                      value={newKeyPlayer.title}
                      onChange={(e) => handleKeyPlayerChange('title', e.target.value)}
                      placeholder="Enter title"
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
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact:</label>
                  <input 
                    type="text" 
                    value={newKeyPlayer.contact}
                    onChange={(e) => handleKeyPlayerChange('contact', e.target.value)}
                    placeholder="Enter contact information"
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
                  onClick={addKeyPlayer}
                  style={{
                    backgroundColor: 'rgba(10,177,150,0.2)',
                    border: 'none',
                    color: '#0AB196',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Add Key Player
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Key Requirements</h3>
              
              {formData.keyRequirements.map((requirement, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {requirement}
                  </div>
                  <button 
                    onClick={() => removeRequirement(index)}
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
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '5px',
                display: 'flex',
                gap: '1rem'
              }}>
                <input 
                  type="text" 
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newRequirement.trim() !== '') {
                      addRequirement();
                    }
                  }}
                  placeholder="Enter requirement"
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
                  onClick={addRequirement}
                  style={{
                    backgroundColor: 'rgba(10,177,150,0.2)',
                    border: 'none',
                    color: '#0AB196',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Notes</h3>
              <textarea 
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter notes about the company, culture, etc."
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
                onClick={resetForm}
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
                onClick={saveCompany}
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
                Save Company
              </button>
            </div>
          </div>
        ) : (
          // Companies List
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginBottom: '1.5rem'
            }}>
              <button 
                onClick={() => setIsEditing(true)}
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
                Add New Company
              </button>
            </div>
            
            {companies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {companies.map(company => (
                  <div 
                    key={company.id}
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
                          <h3 style={{ margin: '0 0 0.5rem 0' }}>{company.name}</h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ 
                              backgroundColor: 'rgba(255,255,255,0.1)', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}>
                              {company.status}
                            </span>
                            {company.datePosted && (
                              <span style={{ 
                                backgroundColor: 'rgba(255,255,255,0.1)', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '20px',
                                fontSize: '0.8rem'
                              }}>
                                Posted: {formatDate(company.datePosted)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => editCompany(company)}
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
                            onClick={() => deleteCompany(company.id)}
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
                      
                      {company.website && (
                        <div style={{ marginBottom: '1rem' }}>
                          <a 
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#16B3F7',
                              textDecoration: 'none'
                            }}
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                      
                      {company.jobDescription && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Job Description</h4>
                          <p style={{ margin: 0, opacity: 0.8 }}>{company.jobDescription}</p>
                        </div>
                      )}
                      
                      {company.hiringManager && (company.hiringManager.firstName || company.hiringManager.lastName) && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Hiring Manager</h4>
                          <p style={{ margin: 0, opacity: 0.8 }}>
                            {company.hiringManager.firstName} {company.hiringManager.lastName}
                            {company.hiringManager.title && ` - ${company.hiringManager.title}`}
                          </p>
                        </div>
                      )}
                      
                      {company.keyPlayers && company.keyPlayers.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Key Players</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {company.keyPlayers.map((player, index) => (
                              <div 
                                key={index}
                                style={{ 
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '5px'
                                }}
                              >
                                <strong>{player.name}</strong>
                                {player.title && <span style={{ opacity: 0.7 }}> - {player.title}</span>}
                                {player.contact && <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{player.contact}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {company.keyRequirements && company.keyRequirements.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Key Requirements</h4>
                          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            {company.keyRequirements.map((req, index) => (
                              <li key={index} style={{ marginBottom: '0.25rem' }}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {company.notes && (
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Notes</h4>
                          <p style={{ margin: 0, opacity: 0.8 }}>{company.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ marginBottom: '1rem' }}>You haven't added any companies yet.</p>
                <button 
                  onClick={() => setIsEditing(true)}
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
                  Add Your First Company
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetCompanies;
