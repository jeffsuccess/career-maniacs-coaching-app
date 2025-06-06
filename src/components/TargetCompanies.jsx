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
  };

  // Extract data from LinkedIn
  const extractFromLinkedIn = () => {
    if (!linkedInData.trim()) {
      alert('Please paste LinkedIn data first.');
      return;
    }

    try {
      // Extract company name
      let companyName = '';
      // Try multiple patterns for company name extraction
      const companyPatterns = [
        /at\s+([A-Za-z0-9\s&\-.,]+?)(?:\sin|\s-|\.|$)/i,
        /company:\s*([A-Za-z0-9\s&\-.,]+)/i,
        /([A-Za-z0-9\s&\-.,]+?)\s+is\s+looking/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = linkedInData.match(pattern);
        if (match && match[1]) {
          companyName = match[1].trim();
          break;
        }
      }

      // Extract job title
      let jobTitle = '';
      // Try multiple patterns for job title extraction
      const titlePatterns = [
        /(?:position|job|role|title):\s*([A-Za-z0-9\s&\-.,]+)/i,
        /([A-Za-z0-9\s&\-.,]+?)\s+(?:position|job|role|opportunity)/i,
        /hiring\s+(?:a|an)\s+([A-Za-z0-9\s&\-.,]+)/i,
        /([A-Za-z0-9\s&\-.,]+?)\s+at\s+/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = linkedInData.match(pattern);
        if (match && match[1]) {
          jobTitle = match[1].trim();
          // Clean up job title (remove common prefixes/suffixes)
          jobTitle = jobTitle.replace(/^(?:a|an|the)\s+/i, '');
          break;
        }
      }

      // Extract hiring manager
      let hiringManager = { firstName: '', lastName: '', title: 'Hiring Manager' };
      // Try multiple patterns for hiring manager extraction
      const managerPatterns = [
        /hiring\s+manager:?\s*([A-Za-z\-']+)\s+([A-Za-z\-']+)/i,
        /(?:contact|reach\s+out\s+to|report\s+to):\s*([A-Za-z\-']+)\s+([A-Za-z\-']+)/i,
        /(?:manager|director|lead):\s*([A-Za-z\-']+)\s+([A-Za-z\-']+)/i
      ];
      
      for (const pattern of managerPatterns) {
        const match = linkedInData.match(pattern);
        if (match && match[1] && match[2]) {
          hiringManager = {
            firstName: match[1].trim(),
            lastName: match[2].trim(),
            title: 'Hiring Manager'
          };
          break;
        }
      }
      
      // Try to extract manager title if available
      if (hiringManager.firstName) {
        const titleMatch = linkedInData.match(new RegExp(`${hiringManager.firstName}\\s+${hiringManager.lastName}\\s*,\\s*([A-Za-z0-9\\s&\\-.,]+)`, 'i'));
        if (titleMatch && titleMatch[1]) {
          hiringManager.title = titleMatch[1].trim();
        }
      }

      // Extract requirements
      let keyRequirements = [];
      
      // First try to find a requirements section
      const requirementsSectionPatterns = [
        /requirements?:?(.*?)(?:qualifications|responsibilities|about|benefits|$)/is,
        /qualifications?:?(.*?)(?:requirements|responsibilities|about|benefits|$)/is,
        /what\s+you['']ll\s+need:?(.*?)(?:what\s+you['']ll\s+do|responsibilities|about|benefits|$)/is
      ];
      
      let requirementsText = '';
      for (const pattern of requirementsSectionPatterns) {
        const match = linkedInData.match(pattern);
        if (match && match[1]) {
          requirementsText = match[1];
          break;
        }
      }
      
      // If we found a requirements section, extract individual requirements
      if (requirementsText) {
        // Look for bullet points or numbered lists
        const bulletMatches = requirementsText.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
        const numberedMatches = requirementsText.match(/\d+\.\s*([^\n]+)/g);
        
        if (bulletMatches) {
          keyRequirements = bulletMatches.map(item => item.replace(/[•\-\*]\s*/, '').trim());
        } else if (numberedMatches) {
          keyRequirements = numberedMatches.map(item => item.replace(/\d+\.\s*/, '').trim());
        } else {
          // Split by sentences or line breaks if no bullet points found
          keyRequirements = requirementsText
            .split(/\.|\n/)
            .map(item => item.trim())
            .filter(item => item.length > 10);
        }
      }
      
      // If we still don't have requirements, look for keywords throughout the text
      if (keyRequirements.length === 0) {
        const experienceMatches = linkedInData.match(/\d+\+?\s+years?\s+(?:of\s+)?experience\s+(?:in|with)?\s+[^.,;]+/g);
        if (experienceMatches) {
          keyRequirements = [...keyRequirements, ...experienceMatches.map(item => item.trim())];
        }
        
        const skillMatches = linkedInData.match(/(?:proficient|skilled|expertise|knowledge)\s+(?:in|with)\s+[^.,;]+/g);
        if (skillMatches) {
          keyRequirements = [...keyRequirements, ...skillMatches.map(item => item.trim())];
        }
      }
      
      // Limit to reasonable number of requirements and remove duplicates
      keyRequirements = [...new Set(keyRequirements)].slice(0, 7);

      // Extract date posted - use current date
      const today = getTodayDateString();

      const extractedData = {
        name: companyName,
        jobTitle: jobTitle,
        hiringManager: hiringManager,
        keyRequirements: keyRequirements,
        datePosted: today
      };

      setExtractedData(extractedData);

      // Update form with extracted data
      setFormData({
        ...formData,
        name: companyName || formData.name,
        hiringManager: hiringManager.firstName ? hiringManager : formData.hiringManager,
        jobDescription: jobTitle || formData.jobDescription,
        keyRequirements: keyRequirements.length > 0 ? keyRequirements : formData.keyRequirements,
        datePosted: today
      });
    } catch (error) {
      console.error("LinkedIn extraction error:", error);
      alert("There was an error extracting data. Please check the console for details.");
    }
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
              <h3 style={{ margin: '0 0 1rem 0' }}>LinkedIn Data Extraction</h3>
              <p style={{ marginBottom: '1rem' }}>
                Paste job description or company information from LinkedIn to automatically extract details.
              </p>
              
              <textarea 
                value={linkedInData}
                onChange={(e) => setLinkedInData(e.target.value)}
                placeholder="Paste LinkedIn job description or company information here..."
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  resize: 'vertical',
                  marginBottom: '1rem'
                }}
              />
              
              <button 
                onClick={extractFromLinkedIn}
                style={{
                  backgroundColor: 'rgba(10,177,150,0.2)',
                  border: 'none',
                  color: '#0AB196',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Extract Data
              </button>
              
              {extractedData && (
                <div style={{ 
                  backgroundColor: 'rgba(10,177,150,0.1)', 
                  padding: '1rem',
                  borderRadius: '5px',
                  marginTop: '1rem'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0AB196' }}>Extracted Information:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {extractedData.name && <li>Company: {extractedData.name}</li>}
                    {extractedData.jobTitle && <li>Job Title: {extractedData.jobTitle}</li>}
                    {extractedData.hiringManager.firstName && (
                      <li>Hiring Manager: {extractedData.hiringManager.firstName} {extractedData.hiringManager.lastName} ({extractedData.hiringManager.title})</li>
                    )}
                    {extractedData.keyRequirements.length > 0 && (
                      <li>
                        Requirements: {extractedData.keyRequirements.length} found
                      </li>
                    )}
                    <li>Date Posted: {formatDate(extractedData.datePosted)}</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Company Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
              
              <div style={{ marginBottom: '1rem' }}>
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
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes:</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter notes about the company"
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
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Job Information</h3>
              
              <div style={{ marginBottom: '1rem' }}>
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
              
              <div style={{ marginBottom: '1rem' }}>
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
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Key Requirements:</label>
                
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem',
                  borderRadius: '5px',
                  marginBottom: '1rem'
                }}>
                  {formData.keyRequirements.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {formData.keyRequirements.map((requirement, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{requirement}</span>
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
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, opacity: 0.7 }}>No requirements added yet.</p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Enter a requirement"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                  />
                  <button 
                    onClick={addRequirement}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Hiring Manager</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '1rem',
                borderRadius: '5px',
                marginBottom: '1rem'
              }}>
                {formData.keyPlayers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.keyPlayers.map((player, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: '5px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                          <div style={{ fontSize: '0.9rem' }}>{player.title}</div>
                          {player.contact && <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{player.contact}</div>}
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
                  </div>
                ) : (
                  <p style={{ margin: 0, opacity: 0.7 }}>No key players added yet.</p>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '1rem',
                borderRadius: '5px',
                marginBottom: '1rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
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
                
                <div style={{ marginBottom: '1rem' }}>
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
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Add Key Player
                </button>
              </div>
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
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0 }}>Your Target Companies</h2>
              
              <button 
                onClick={() => setIsEditing(true)}
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
                            {company.website && (
                              <a 
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  backgroundColor: 'rgba(255,255,255,0.1)', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  color: 'white',
                                  textDecoration: 'none'
                                }}
                              >
                                Website
                              </a>
                            )}
                            <span style={{ 
                              backgroundColor: 'rgba(255,255,255,0.1)', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}>
                              Status: {company.status}
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
                      
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Job Description</h4>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            <p style={{ margin: 0 }}>{company.jobDescription || 'No job description added.'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Key Requirements</h4>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            {company.keyRequirements && company.keyRequirements.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                {company.keyRequirements.map((requirement, index) => (
                                  <li key={index}>{requirement}</li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ margin: 0 }}>No requirements added.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Hiring Manager</h4>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            {company.hiringManager && (company.hiringManager.firstName || company.hiringManager.lastName) ? (
                              <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                  {company.hiringManager.firstName} {company.hiringManager.lastName}
                                </p>
                                {company.hiringManager.title && (
                                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{company.hiringManager.title}</p>
                                )}
                              </div>
                            ) : (
                              <p style={{ margin: 0 }}>No hiring manager added.</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Key Players</h4>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            {company.keyPlayers && company.keyPlayers.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {company.keyPlayers.map((player, index) => (
                                  <div key={index}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{player.name}</p>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{player.title}</p>
                                    {player.contact && (
                                      <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{player.contact}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ margin: 0 }}>No key players added.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {company.notes && (
                        <div style={{ marginTop: '1.5rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Notes</h4>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            <p style={{ margin: 0 }}>{company.notes}</p>
                          </div>
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
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Your First Company
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TargetCompanies;
