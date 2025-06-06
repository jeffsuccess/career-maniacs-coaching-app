import React, { useState, useEffect } from 'react';

const TargetCompanies = () => {
  // State for companies list
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      status: 'Researching',
      keyPlayers: [
        { name: 'Jane Smith', title: 'VP of Engineering', linkedIn: 'linkedin.com/in/janesmith' },
        { name: 'John Doe', title: 'Director of Product', linkedIn: 'linkedin.com/in/johndoe' }
      ],
      hiringManager: { firstName: 'Michael', lastName: 'Johnson', title: 'Senior Engineering Manager', linkedIn: 'linkedin.com/in/michaeljohnson' },
      jobDescription: {
        title: 'Senior Software Engineer',
        link: 'acmecorp.com/careers/senior-software-engineer',
        datePosted: '2025-05-28',
        keyRequirements: [
          '5+ years experience with React',
          'Experience with cloud infrastructure',
          'Strong communication skills'
        ]
      },
      notes: 'Company is expanding their AI division. Q2 earnings were strong. Recent acquisition of SmallTech Inc.'
    },
    {
      id: 2,
      name: 'Globex Industries',
      industry: 'Finance',
      status: 'Applied',
      keyPlayers: [
        { name: 'Robert Chen', title: 'CTO', linkedIn: 'linkedin.com/in/robertchen' },
        { name: 'Sarah Williams', title: 'Head of Talent', linkedIn: 'linkedin.com/in/sarahwilliams' }
      ],
      hiringManager: { firstName: 'David', lastName: 'Miller', title: 'Director of Engineering', linkedIn: 'linkedin.com/in/davidmiller' },
      jobDescription: {
        title: 'Full Stack Developer',
        link: 'globex.com/jobs/full-stack-developer',
        datePosted: '2025-06-01',
        keyRequirements: [
          'Experience with Node.js and React',
          'Financial industry background preferred',
          'Strong problem-solving skills'
        ]
      },
      notes: 'Had an informational interview with Alex from their team. Company culture seems to value work-life balance. They use an Agile development process.'
    }
  ]);
  
  // State for selected company and form
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'Researching',
    keyPlayers: [],
    hiringManager: { firstName: '', lastName: '', title: '', linkedIn: '' }, // Updated structure
    jobDescription: {
      title: '',
      link: '',
      datePosted: '',
      keyRequirements: ['']
    },
    notes: ''
  });
  
  // LinkedIn URL state
  const [companyLinkedInUrl, setCompanyLinkedInUrl] = useState('');
  const [hiringManagerLinkedInUrl, setHiringManagerLinkedInUrl] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  
  // Status options
  const statusOptions = [
    'Researching',
    'Networking',
    'Applied',
    'Interview Scheduled',
    'Interview Completed',
    'Offer Received',
    'Negotiating',
    'Accepted',
    'Rejected',
    'Not Interested'
  ];
  
  // Handle company selection
  const handleSelectCompany = (id) => {
    setSelectedCompany(id);
    setIsEditing(false);
    setCompanyLinkedInUrl('');
    setHiringManagerLinkedInUrl('');
    setJobDescriptionUrl('');
    setUrlError('');
  };
  
  // Start editing company
  const startEditing = () => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      setFormData({...company});
      setIsEditing(true);
      setCompanyLinkedInUrl('');
      setHiringManagerLinkedInUrl('');
      setJobDescriptionUrl('');
      setUrlError('');
    }
  };
  
  // Start adding new company
  const startAddingCompany = () => {
    setSelectedCompany(null);
    setFormData({
      name: '',
      industry: '',
      status: 'Researching',
      keyPlayers: [],
      hiringManager: { firstName: '', lastName: '', title: '', linkedIn: '' }, // Updated structure
      jobDescription: {
        title: '',
        link: '',
        datePosted: '',
        keyRequirements: ['']
      },
      notes: ''
    });
    setIsEditing(true);
    setCompanyLinkedInUrl('');
    setHiringManagerLinkedInUrl('');
    setJobDescriptionUrl('');
    setUrlError('');
  };
  
  // Handle LinkedIn URL input changes
  const handleCompanyUrlChange = (e) => {
    setCompanyLinkedInUrl(e.target.value);
    setUrlError('');
  };
  const handleHiringManagerUrlChange = (e) => {
    setHiringManagerLinkedInUrl(e.target.value);
    setUrlError('');
  };
  const handleJobDescriptionUrlChange = (e) => {
    setJobDescriptionUrl(e.target.value);
    setUrlError('');
  };
  
  // Helper function to format names
  const formatName = (nameStr) => {
    return nameStr.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper function to parse names
  const parseName = (fullName) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };
  
  // Process Company LinkedIn URL
  const processCompanyUrl = () => {
    if (!companyLinkedInUrl) {
      setUrlError('Please enter a Company LinkedIn URL');
      return;
    }
    
    setIsProcessingUrl(true);
    setUrlError('');
    
    // Simulate API call/processing
    setTimeout(() => {
      try {
        if (!companyLinkedInUrl.includes('linkedin.com/company/')) {
          setUrlError('Invalid Company LinkedIn URL format');
          setIsProcessingUrl(false);
          return;
        }
        
        const urlParts = companyLinkedInUrl.split('/company/');
        let companyName = '';
        if (urlParts.length > 1) {
          companyName = formatName(urlParts[1].split('/')[0]);
        }
        
        // Improved Industry Extraction (still simplified)
        let industry = 'Unknown';
        const companyLower = companyName.toLowerCase();
        if (companyLower.includes('tech') || companyLower.includes('software') || companyLower.includes('solutions') || companyLower.includes('systems')) industry = 'Technology';
        else if (companyLower.includes('finance') || companyLower.includes('bank') || companyLower.includes('capital') || companyLower.includes('investment')) industry = 'Finance';
        else if (companyLower.includes('health') || companyLower.includes('pharma') || companyLower.includes('medical') || companyLower.includes('bio')) industry = 'Healthcare';
        else if (companyLower.includes('consulting')) industry = 'Consulting';
        else if (companyLower.includes('media') || companyLower.includes('entertainment')) industry = 'Media/Entertainment';
        else if (companyLower.includes('retail')) industry = 'Retail';
        
        setFormData(prev => ({
          ...prev,
          name: companyName,
          industry: industry,
        }));
        
        setIsProcessingUrl(false);
      } catch (error) {
        setUrlError('Error processing Company URL');
        setIsProcessingUrl(false);
      }
    }, 500);
  };
  
  // Process Hiring Manager LinkedIn URL
  const processHiringManagerUrl = () => {
    if (!hiringManagerLinkedInUrl) {
      setUrlError('Please enter a Hiring Manager LinkedIn URL');
      return;
    }
    
    setIsProcessingUrl(true);
    setUrlError('');
    
    // Simulate API call/processing
    setTimeout(() => {
      try {
        if (!hiringManagerLinkedInUrl.includes('linkedin.com/in/')) {
          setUrlError('Invalid Hiring Manager LinkedIn URL format');
          setIsProcessingUrl(false);
          return;
        }
        
        const urlParts = hiringManagerLinkedInUrl.split('/in/');
        let fullName = '';
        if (urlParts.length > 1) {
          fullName = formatName(urlParts[1].split('/')[0]);
        }
        
        const { firstName, lastName } = parseName(fullName);
        
        setFormData(prev => ({
          ...prev,
          hiringManager: {
            ...prev.hiringManager,
            firstName: firstName,
            lastName: lastName,
            linkedIn: hiringManagerLinkedInUrl
          }
        }));
        
        setIsProcessingUrl(false);
      } catch (error) {
        setUrlError('Error processing Hiring Manager URL');
        setIsProcessingUrl(false);
      }
    }, 500);
  };
  
  // Process Job Description URL - Enhanced implementation
  const processJobDescriptionUrl = () => {
    if (!jobDescriptionUrl) {
      setUrlError('Please enter a Job Description URL');
      return;
    }
    
    setIsProcessingUrl(true);
    setUrlError('');
    
    // Simulate API call/processing
    setTimeout(() => {
      try {
        // Extract job title from URL
        let title = '';
        let jobLevel = '';
        let jobRole = '';
        
        // Check for common job posting URL patterns
        if (jobDescriptionUrl.includes('linkedin.com/jobs/')) {
          // LinkedIn job URL
          const urlLower = jobDescriptionUrl.toLowerCase();
          
          // Extract job level
          if (urlLower.includes('senior') || urlLower.includes('sr')) jobLevel = 'Senior';
          else if (urlLower.includes('junior') || urlLower.includes('jr')) jobLevel = 'Junior';
          else if (urlLower.includes('lead')) jobLevel = 'Lead';
          else if (urlLower.includes('principal')) jobLevel = 'Principal';
          else if (urlLower.includes('staff')) jobLevel = 'Staff';
          
          // Extract job role
          if (urlLower.includes('engineer') || urlLower.includes('engineering')) jobRole = 'Engineer';
          else if (urlLower.includes('developer')) jobRole = 'Developer';
          else if (urlLower.includes('manager')) jobRole = 'Manager';
          else if (urlLower.includes('designer')) jobRole = 'Designer';
          else if (urlLower.includes('analyst')) jobRole = 'Analyst';
          else if (urlLower.includes('scientist')) jobRole = 'Scientist';
          else if (urlLower.includes('specialist')) jobRole = 'Specialist';
          
          // Combine level and role
          if (jobLevel && jobRole) {
            title = `${jobLevel} ${jobRole}`;
          } else if (jobRole) {
            title = jobRole;
          } else if (jobLevel) {
            title = `${jobLevel} Position`;
          } else {
            // Extract from URL path as fallback
            const pathParts = urlLower.split('/');
            for (let i = 0; i < pathParts.length; i++) {
              if (pathParts[i] === 'view' && i + 1 < pathParts.length) {
                title = formatName(pathParts[i+1].replace(/-/g, ' '));
                break;
              }
            }
            
            if (!title) title = "Position from LinkedIn";
          }
        } else if (jobDescriptionUrl.includes('/careers/') || jobDescriptionUrl.includes('/jobs/') || jobDescriptionUrl.includes('/job/')) {
          // Company career site URL
          const urlParts = jobDescriptionUrl.split(/\/careers\/|\/jobs\/|\/job\//);
          if (urlParts.length > 1) {
            title = formatName(urlParts[1].split('/')[0].replace(/-/g, ' '));
          } else {
            title = "Position from Company Site";
          }
        } else {
          // Generic URL - try to extract meaningful information
          const urlLower = jobDescriptionUrl.toLowerCase();
          
          // Check for common job titles in URL
          if (urlLower.includes('engineer')) title = 'Engineering Position';
          else if (urlLower.includes('develop')) title = 'Developer Position';
          else if (urlLower.includes('manager')) title = 'Management Position';
          else if (urlLower.includes('design')) title = 'Design Position';
          else if (urlLower.includes('analyst')) title = 'Analyst Position';
          else if (urlLower.includes('scientist')) title = 'Scientist Position';
          else title = 'Position';
          
          // Add level if present
          if (urlLower.includes('senior') || urlLower.includes('sr')) title = 'Senior ' + title;
          else if (urlLower.includes('junior') || urlLower.includes('jr')) title = 'Junior ' + title;
        }
        
        // Get today's date for posting date
        const today = new Date().toISOString().split('T')[0];
        
        // Update form with extracted information
        setFormData(prev => ({
          ...prev,
          jobDescription: {
            ...prev.jobDescription,
            title: title,
            link: jobDescriptionUrl,
            datePosted: today
          }
        }));
        
        setIsProcessingUrl(false);
      } catch (error) {
        setUrlError('Error processing Job Description URL');
        setIsProcessingUrl(false);
      }
    }, 500);
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle nested form input changes
  const handleNestedInputChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    });
  };
  
  // Add key player
  const addKeyPlayer = () => {
    setFormData({
      ...formData,
      keyPlayers: [
        ...formData.keyPlayers,
        { name: '', title: '', linkedIn: '' }
      ]
    });
  };
  
  // Update key player
  const updateKeyPlayer = (index, field, value) => {
    const updatedPlayers = [...formData.keyPlayers];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      keyPlayers: updatedPlayers
    });
  };
  
  // Remove key player
  const removeKeyPlayer = (index) => {
    const updatedPlayers = [...formData.keyPlayers];
    updatedPlayers.splice(index, 1);
    
    setFormData({
      ...formData,
      keyPlayers: updatedPlayers
    });
  };
  
  // Add job requirement
  const addJobRequirement = () => {
    setFormData({
      ...formData,
      jobDescription: {
        ...formData.jobDescription,
        keyRequirements: [
          ...formData.jobDescription.keyRequirements,
          ''
        ]
      }
    });
  };
  
  // Update job requirement
  const updateJobRequirement = (index, value) => {
    const updatedRequirements = [...formData.jobDescription.keyRequirements];
    updatedRequirements[index] = value;
    
    setFormData({
      ...formData,
      jobDescription: {
        ...formData.jobDescription,
        keyRequirements: updatedRequirements
      }
    });
  };
  
  // Remove job requirement
  const removeJobRequirement = (index) => {
    const updatedRequirements = [...formData.jobDescription.keyRequirements];
    updatedRequirements.splice(index, 1);
    
    setFormData({
      ...formData,
      jobDescription: {
        ...formData.jobDescription,
        keyRequirements: updatedRequirements
      }
    });
  };
  
  // Save company data
  const saveCompany = () => {
    if (selectedCompany) {
      // Update existing company
      setCompanies(companies.map(company => 
        company.id === selectedCompany ? {...formData} : company
      ));
    } else {
      // Add new company
      const newCompany = {
        ...formData,
        id: companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1
      };
      setCompanies([...companies, newCompany]);
      setSelectedCompany(newCompany.id);
    }
    setIsEditing(false);
    setCompanyLinkedInUrl('');
    setHiringManagerLinkedInUrl('');
    setJobDescriptionUrl('');
    setUrlError('');
  };
  
  // Delete company
  const deleteCompany = () => {
    if (selectedCompany) {
      setCompanies(companies.filter(company => company.id !== selectedCompany));
      setSelectedCompany(null);
      setIsEditing(false);
      setCompanyLinkedInUrl('');
      setHiringManagerLinkedInUrl('');
      setJobDescriptionUrl('');
      setUrlError('');
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Researching': return '#6c757d';
      case 'Networking': return '#17a2b8';
      case 'Applied': return '#007bff';
      case 'Interview Scheduled': return '#fd7e14';
      case 'Interview Completed': return '#6f42c1';
      case 'Offer Received': return '#28a745';
      case 'Negotiating': return '#20c997';
      case 'Accepted': return '#28a745';
      case 'Rejected': return '#dc3545';
      case 'Not Interested': return '#6c757d';
      default: return '#6c757d';
    }
  };
  
  // Get selected company data
  const currentCompany = companies.find(c => c.id === selectedCompany);
  
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
        Target Companies
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Track and organize information about your target companies, key contacts, and job opportunities.</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          onClick={startAddingCompany}
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
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Companies List */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          height: 'fit-content',
          flexShrink: 0
        }}>
          <h2>Companies</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {companies.length > 0 ? (
              companies.map(company => (
                <div 
                  key={company.id}
                  style={{ 
                    backgroundColor: selectedCompany === company.id ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleSelectCompany(company.id)}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{company.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>{company.industry}</span>
                    <span style={{ 
                      backgroundColor: getStatusColor(company.status),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {company.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No companies added yet.</p>
            )}
          </div>
        </div>
        
        {/* Company Details / Form */}
        <div style={{ flexGrow: 1 }}>
          {isEditing ? (
            // Edit/Add Form
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px'
            }}>
              <h2>{selectedCompany ? 'Edit Company' : 'Add New Company'}</h2>
              
              {/* LinkedIn URL Section */}
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>LinkedIn URL Integration</h3>
                {urlError && <p style={{ color: 'red', marginBottom: '1rem' }}>{urlError}</p>}
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company LinkedIn URL:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Paste Company LinkedIn URL here..."
                      value={companyLinkedInUrl}
                      onChange={handleCompanyUrlChange}
                      style={{
                        flexGrow: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={processCompanyUrl}
                      disabled={isProcessingUrl}
                      style={{
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        opacity: isProcessingUrl ? 0.5 : 1
                      }}
                    >
                      {isProcessingUrl ? 'Processing...' : 'Extract Info'}
                    </button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hiring Manager LinkedIn URL:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Paste Hiring Manager LinkedIn URL here..."
                      value={hiringManagerLinkedInUrl}
                      onChange={handleHiringManagerUrlChange}
                      style={{
                        flexGrow: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={processHiringManagerUrl}
                      disabled={isProcessingUrl}
                      style={{
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        opacity: isProcessingUrl ? 0.5 : 1
                      }}
                    >
                      {isProcessingUrl ? 'Processing...' : 'Extract Info'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Description URL:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Paste Job Description URL here..."
                      value={jobDescriptionUrl}
                      onChange={handleJobDescriptionUrlChange}
                      style={{
                        flexGrow: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={processJobDescriptionUrl}
                      disabled={isProcessingUrl}
                      style={{
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        opacity: isProcessingUrl ? 0.5 : 1
                      }}
                    >
                      {isProcessingUrl ? 'Processing...' : 'Extract Info'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Company Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name:</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Industry:</label>
                  <input 
                    type="text" 
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
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
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Key Players */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Key Players</h3>
                {formData.keyPlayers.map((player, index) => (
                  <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={player.name}
                      onChange={(e) => updateKeyPlayer(index, 'name', e.target.value)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Title"
                      value={player.title}
                      onChange={(e) => updateKeyPlayer(index, 'title', e.target.value)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="LinkedIn URL"
                      value={player.linkedIn}
                      onChange={(e) => updateKeyPlayer(index, 'linkedIn', e.target.value)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={() => removeKeyPlayer(index)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,82,82,0.5)',
                        color: 'rgba(255,82,82,0.8)',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addKeyPlayer}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Add Key Player
                </button>
              </div>
              
              {/* Hiring Manager */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Hiring Manager</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="First Name"
                    value={formData.hiringManager.firstName}
                    onChange={(e) => handleNestedInputChange('hiringManager', 'firstName', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name"
                    value={formData.hiringManager.lastName}
                    onChange={(e) => handleNestedInputChange('hiringManager', 'lastName', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="Title"
                    value={formData.hiringManager.title}
                    onChange={(e) => handleNestedInputChange('hiringManager', 'title', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="LinkedIn URL (will auto-fill name)"
                    value={formData.hiringManager.linkedIn}
                    onChange={(e) => handleNestedInputChange('hiringManager', 'linkedIn', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </div>
              
              {/* Job Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Job Description</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Job Title"
                    value={formData.jobDescription.title}
                    onChange={(e) => handleNestedInputChange('jobDescription', 'title', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                  <input 
                    type="date" 
                    placeholder="Date Posted"
                    value={formData.jobDescription.datePosted}
                    onChange={(e) => handleNestedInputChange('jobDescription', 'datePosted', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Job Description Link (will auto-fill title)"
                  value={formData.jobDescription.link}
                  onChange={(e) => handleNestedInputChange('jobDescription', 'link', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    marginBottom: '1rem'
                  }}
                />
                
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Key Requirements:</label>
                {formData.jobDescription.keyRequirements.map((req, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Requirement"
                      value={req}
                      onChange={(e) => updateJobRequirement(index, e.target.value)}
                      style={{
                        flexGrow: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={() => removeJobRequirement(index)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,82,82,0.5)',
                        color: 'rgba(255,82,82,0.8)',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addJobRequirement}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Add Requirement
                </button>
              </div>
              
              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
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
              
              {/* Save/Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  onClick={() => setIsEditing(false)}
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
          ) : currentCompany ? (
            // View Details
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{currentCompany.name}</h2>
                <div>
                  <button 
                    onClick={startEditing}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={deleteCompany}
                    style={{
                      background: 'rgba(255,82,82,0.2)',
                      border: '1px solid rgba(255,82,82,0.5)',
                      color: 'rgba(255,82,82,0.8)',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <p><strong>Industry:</strong> {currentCompany.industry}</p>
                <p><strong>Status:</strong> <span style={{ backgroundColor: getStatusColor(currentCompany.status), color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{currentCompany.status}</span></p>
              </div>
              
              {/* Key Players */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Key Players</h3>
                {currentCompany.keyPlayers.length > 0 ? (
                  currentCompany.keyPlayers.map((player, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                      <p style={{ margin: 0 }}><strong>{player.name}</strong> - {player.title}</p>
                      {player.linkedIn && <a href={`https://${player.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{ color: '#16B3F7', fontSize: '0.9em' }}>LinkedIn</a>}
                    </div>
                  ))
                ) : (
                  <p>No key players added.</p>
                )}
              </div>
              
              {/* Hiring Manager */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Hiring Manager</h3>
                {currentCompany.hiringManager.firstName || currentCompany.hiringManager.lastName ? (
                  <div>
                    <p style={{ margin: 0 }}><strong>{currentCompany.hiringManager.firstName} {currentCompany.hiringManager.lastName}</strong> - {currentCompany.hiringManager.title}</p>
                    {currentCompany.hiringManager.linkedIn && <a href={`https://${currentCompany.hiringManager.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{ color: '#16B3F7', fontSize: '0.9em' }}>LinkedIn</a>}
                  </div>
                ) : (
                  <p>No hiring manager added.</p>
                )}
              </div>
              
              {/* Job Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Job Description</h3>
                {currentCompany.jobDescription.title ? (
                  <div>
                    <p style={{ margin: 0 }}><strong>{currentCompany.jobDescription.title}</strong> (Posted: {currentCompany.jobDescription.datePosted})</p>
                    {currentCompany.jobDescription.link && <a href={`https://${currentCompany.jobDescription.link}`} target="_blank" rel="noopener noreferrer" style={{ color: '#16B3F7', fontSize: '0.9em' }}>View Job</a>}
                    <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Key Requirements:</h4>
                    {currentCompany.jobDescription.keyRequirements.length > 0 ? (
                      <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {currentCompany.jobDescription.keyRequirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No key requirements listed.</p>
                    )}
                  </div>
                ) : (
                  <p>No job description added.</p>
                )}
              </div>
              
              {/* Notes */}
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Notes</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{currentCompany.notes || 'No notes added.'}</p>
              </div>
            </div>
          ) : (
            // Placeholder when no company is selected
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p>Select a company from the list or add a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetCompanies;
