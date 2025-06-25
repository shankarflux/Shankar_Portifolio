import { useState, useEffect, useRef, useCallback } from 'react';

// Default initial portfolio data if Local Storage is empty
const defaultPortfolioData = {
  about: "A passionate full stack developer and UI/UX designer with a knack for creating intuitive and efficient web applications. I love bringing ideas to life through code and crafting seamless user experiences. My core interests lie in Cybersecurity, AI Development, and Cloud Computing, areas where I continuously learn and build.",
  contact: {
    email: "shankarflux@example.com",
    phone: "+1234567890",
    linkedin: "https://linkedin.com/in/shankarflux",
    github: "https://github.com/shankarflux"
  },
  experience: [
    { title: "Software Engineer", company: "Tech Innovations", years: "2022-Present", description: "Developed and maintained web applications using React and Node.js, improving performance by 20%." },
    { title: "UI/UX Intern", company: "Creative Designs Inc.", years: "2021-2022", description: "Assisted in designing user interfaces and conducting usability tests for mobile applications." }
  ],
  projects: [
    { name: "Secure IoT Dashboard", description: "Developed a real-time IoT dashboard with enhanced security features for data transmission.", category: "Cybersecurity" },
    { name: "AI Chatbot Assistant", description: "Built an AI-powered chatbot using natural language processing for customer support automation.", category: "AI" },
    { name: "Serverless E-commerce API", description: "Designed and deployed a scalable e-commerce API leveraging AWS Lambda and API Gateway.", category: "Cloud Computing" },
    { name: "Portfolio Website", description: "Created this responsive portfolio using React, Tailwind CSS, and Firebase for dynamic content management.", category: "Full Stack" }
  ],
  courses: [
    { name: "Advanced React Patterns", certificate: "Issued by Online Academy" },
    { name: "Responsive Web Design", certificate: "Issued by Web Dev Institute" },
    { name: "Certified Ethical Hacker (CEH)", certificate: "Issued by EC-Council" },
    { name: "Machine Learning with Python", certificate: "Issued by Coursera" },
    { name: "AWS Certified Solutions Architect", certificate: "Issued by AWS" }
  ],
  skills: {
    cybersecurity: ["Network Security", "Penetration Testing", "Vulnerability Assessment", "IoT Security", "SIEM"],
    ai_development: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch"],
    cloud_computing: ["AWS", "Azure", "GCP", "Serverless Architectures", "Containerization (Docker, Kubernetes)"],
    frontend: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    backend: ["Node.js", "Express.js", "Firebase", "MongoDB", "Python"],
    tools: ["Git", "VS Code", "Figma", "Jira", "Wireshark", "Burp Suite"]
  },
  achievements: [
    "Awarded 'Innovator of the Year' at Tech Innovations 2023.",
    "Published a research paper on accessible web design.",
    "Mentored junior developers in web development best practices.",
    "Secured top 5% in national cybersecurity hackathon.",
    "Developed and deployed an open-source AI anomaly detection system on AWS."
  ],
  profileImage: 'https://placehold.co/400x400/CCCCCC/FFFFFF?text=Profile',
  trackedInterests: [
    { name: "GitHub", image: "https://placehold.co/60x60/181717/FFFFFF?text=GitHub", link: "https://github.com/shankarflux" },
    { name: "LeetCode", image: "https://placehold.co/60x60/FFA116/000000?text=LeetCode", link: "https://leetcode.com/your-username" },
    { name: "HackerRank", image: "https://placehold.co/60x60/2EC866/FFFFFF?text=HRank", link: "https://www.hackerrank.com/your-username" },
    { name: "Hack The Box", image: "https://placehold.co/60x60/00C39C/FFFFFF?text=HTB", link: "https://www.hackthebox.com/profile/your-id" }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState('About');
  // Initialize portfolioData from Local Storage, or use default if empty
  const [portfolioData, setPortfolioData] = useState(() => {
    try {
      const savedData = localStorage.getItem('portfolioData');
      return savedData ? JSON.parse(savedData) : defaultPortfolioData;
    } catch (error) {
      console.error("Error parsing portfolioData from localStorage:", error);
      return defaultPortfolioData; // Fallback to default on error
    }
  });

  // Local "Admin" state for editing, no actual login
  const [isLocalEditMode, setIsLocalEditMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Still used for toggling edit mode info
  const [loginMessage, setLoginMessage] = useState(''); // Used for info messages about local mode

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      return savedNotifications ? JSON.parse(savedNotifications) : [];
    } catch (error) {
      console.error("Error parsing notifications from localStorage:", error);
      return []; // Fallback to empty array on error
    }
  });
  const [newNotification, setNewNotification] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('');

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCert, setNewCourseCert] = useState('');

  const [profileImageUrl, setProfileImageUrl] = useState(portfolioData.profileImage);

  // Tracked Interests specific states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [newProfileLink, setNewProfileLink] = useState('');

  // Contact Form states (frontend only now)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(''); // 'success', 'error', 'sending'

  // Dark/Light Mode state (already local storage based)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const notificationInputRef = useRef(null);
  const typingRef = useRef(null); // Ref for typing animation container

  // Professional Quotes for typing animation
  const quotes = [
    "Security is not a product, but a process.",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "AI will transform the world more than electricity. - Andrew Ng",
    "Cloud is not just a technology, it's a new way of thinking. - Satya Nadella",
    "Learning is a continuous process. Embrace the challenge.",
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const typingSpeed = 50; // ms per character
  const pauseTime = 9000; // Total time per quote (10s) - typing speed (approx 1s) = 9s pause

  // --- Effect to save portfolioData to Local Storage whenever it changes ---
  useEffect(() => {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
  }, [portfolioData]);

  // --- Effect to save notifications to Local Storage whenever they change ---
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // --- Typing Animation Effect ---
  useEffect(() => {
    let charIndex = 0;
    let timeout;
    let currentQuote = quotes[currentQuoteIndex];

    const typeCharacter = () => {
      if (charIndex < currentQuote.length) {
        setDisplayedQuote(currentQuote.substring(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(typeCharacter, typingSpeed);
      } else {
        setIsTyping(false);
        // Pause after typing, then go to next quote
        timeout = setTimeout(() => {
          setIsTyping(true);
          charIndex = 0;
          setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, pauseTime);
      }
    };

    if (isTyping) {
      typeCharacter();
    }

    return () => clearTimeout(timeout);
  }, [currentQuoteIndex, isTyping]);


  // --- Dark/Light Mode Toggle Effect ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };


  // --- Handlers for Local Edit Mode Functionality ---

  const handleToggleLocalEditMode = () => {
    setIsLocalEditMode(prevMode => !prevMode);
    setShowLoginModal(true); // Reuse modal to show info
    if (!isLocalEditMode) {
      setLoginMessage("You are now in Local Edit Mode. Changes will only be saved in this browser.");
    } else {
      setLoginMessage("Local Edit Mode is OFF. Changes are not being saved.");
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setLoginMessage('');
  };

  const handleAddNotification = () => {
    if (!newNotification.trim()) {
      setLoginMessage("Cannot add empty notification.");
      return;
    }
    const newId = Date.now().toString(); // Simple ID for local storage
    const updatedNotifications = [{ id: newId, message: newNotification.trim(), timestamp: new Date().toISOString() }, ...notifications];
    setNotifications(updatedNotifications);
    setNewNotification('');
    if (notificationInputRef.current) {
      notificationInputRef.current.focus();
    }
    setLoginMessage('');
  };

  const handleDeleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    setLoginMessage('');
  };

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    setShowEditModal(true);
    setLoginMessage(''); // Clear any previous message
  };

  const handleSaveEdit = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'about') {
        updatedData.about = editValue;
      } else if (editingField === 'contact') {
        updatedData.contact = JSON.parse(editValue);
      } else if (editingField.startsWith('skills')) {
        const skillCategory = editingField.split('.')[1];
        updatedData.skills[skillCategory] = editValue.split(',').map(s => s.trim()).filter(s => s);
      } else if (editingField === 'achievements') {
        updatedData.achievements = editValue.split('\n').map(s => s.trim()).filter(s => s);
      } else if (editingField === 'experience' || editingField === 'projects' || editingField === 'courses' || editingField === 'trackedInterests') {
        const parsedArray = JSON.parse(editValue);
        if (Array.isArray(parsedArray)) {
          updatedData[editingField] = parsedArray;
        } else {
          throw new Error(`${editingField} data must be a JSON array.`);
        }
      }

      setPortfolioData(updatedData); // This will trigger useEffect to save to localStorage
      setShowEditModal(false);
      setLoginMessage('Changes saved locally!');
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      setLoginMessage(`Error saving: ${error.message}`);
    }
  };

  const handleAddItem = (type) => {
    setEditingField(type);
    setShowAddModal(true);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectCategory('');
    setNewCourseName('');
    setNewCourseCert('');
    setLoginMessage('');
  };

  const handleSaveNewItem = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'projects') {
        if (newProjectName && newProjectDesc && newProjectCategory) {
          const newProject = { name: newProjectName, description: newProjectDesc, category: newProjectCategory };
          updatedData.projects = [...(updatedData.projects || []), newProject];
        } else {
          throw new Error("Project name, description, and category cannot be empty.");
        }
      } else if (editingField === 'courses') {
        if (newCourseName && newCourseCert) {
          const newCourse = { name: newCourseName, certificate: newCourseCert };
          updatedData.courses = [...(updatedData.courses || []), newCourse];
        } else {
          throw new Error("Course name and certificate cannot be empty.");
        }
      }

      setPortfolioData(updatedData);
      setShowAddModal(false);
      setLoginMessage('New item added locally!');
    } catch (error) {
      console.error("Error adding new item:", error);
      setLoginMessage(`Error adding item: ${error.message}`);
    }
  };

  const handleDeleteItem = (type, index) => {
    try {
      let updatedData = { ...portfolioData };

      if (type === 'experience') {
        updatedData.experience = updatedData.experience.filter((_, i) => i !== index);
      } else if (type === 'projects') {
        updatedData.projects = updatedData.projects.filter((_, i) => i !== index);
      } else if (type === 'courses') {
        updatedData.courses = updatedData.courses.filter((_, i) => i !== index);
      } else if (type === 'achievements') {
        updatedData.achievements = updatedData.achievements.filter((_, i) => i !== index);
      } else if (type === 'trackedInterests') {
        updatedData.trackedInterests = updatedData.trackedInterests.filter((_, i) => i !== index);
      }

      setPortfolioData(updatedData);
      setLoginMessage('Item deleted locally!');
    } catch (error) {
      console.error("Error deleting item:", error);
      setLoginMessage(`Error deleting item: ${error.message}`);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setProfileImageUrl(base64Image);
      setPortfolioData(prevData => ({ ...prevData, profileImage: base64Image }));
      setLoginMessage('Profile image updated locally!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddProfile = () => {
    setShowAddProfileModal(true);
    setNewProfileName('');
    setNewProfileImage('');
    setNewProfileLink('');
    setLoginMessage('');
  };

  const handleSaveNewProfile = () => {
    if (!newProfileName || !newProfileImage || !newProfileLink) {
      setLoginMessage("All profile fields are required.");
      return;
    }

    try {
      let updatedData = { ...portfolioData };
      const newProfile = {
        name: newProfileName,
        image: newProfileImage,
        link: newProfileLink
      };
      updatedData.trackedInterests = [...(updatedData.trackedInterests || []), newProfile];

      setPortfolioData(updatedData);
      setShowAddProfileModal(false);
      setLoginMessage('New profile added locally!');
    } catch (error) {
      console.error("Error adding new profile:", error);
      setLoginMessage(`Error adding profile: ${error.message}`);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');
    setLoginMessage('');
    // Simulate sending, as there's no backend for local storage version
    setTimeout(() => {
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setLoginMessage('Message received (frontend demo only). A backend service is needed to send actual emails.');
      setTimeout(() => { setContactStatus(''); setLoginMessage(''); }, 8000); // Clear after longer time
    }, 1500);
  };


  const projectCategories = ['All', 'Cybersecurity', 'AI', 'Cloud Computing', 'Full Stack'];
  const [currentProjectFilter, setCurrentProjectFilter] = useState('All');

  const filteredProjects = currentProjectFilter === 'All'
    ? (portfolioData.projects || [])
    : (portfolioData.projects || []).filter(project => project.category === currentProjectFilter);


  // No loading state needed as data is instant from local storage or default
  return (
    <div className={`min-h-screen font-inter flex flex-col items-center p-4 sm:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      {/* Global Message Display (for local storage info/errors) */}
      {loginMessage && (
        <div className={`fixed top-4 right-4 ${isDarkMode ? 'bg-indigo-700' : 'bg-indigo-600'} text-white p-3 rounded-md shadow-lg z-50 flex items-center space-x-2`}>
          <span>{loginMessage}</span>
          <button onClick={() => setLoginMessage('')} className="ml-2 text-white font-bold">&times;</button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 z-10">
        <div className="flex space-x-4">
          <button
            onClick={handleToggleLocalEditMode}
            className={`py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isLocalEditMode ? 'bg-red-700 hover:bg-red-800' : 'bg-blue-700 hover:bg-blue-800'} text-white`}
          >
            {isLocalEditMode ? 'Exit Local Edit Mode' : 'Toggle Local Edit Mode'}
          </button>
        </div>

        <div className="flex space-x-4 items-center">
          {isLocalEditMode && (
            <button
              onClick={() => setShowNotificationModal(true)}
              className={`py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              Manage Notifications
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-indigo-700 hover:bg-gray-300'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.275l.707-.707M6.707 6.707l-.707-.707m1.414 14.142l-.707-.707m10.606 0l-.707-.707M12 18a6 6 0 100-12 6 6 0 000 12z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-lg p-6 sm:p-10 w-full max-w-6xl transform transition-all duration-500 ease-in-out scale-95 sm:scale-100`}>

        {/* Background Video (Hero Section) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-lg">
          {/* Placeholder video - replace with your own optimized video */}
          <video
            className="w-full h-full object-cover z-0"
            src="https://assets.mixkit.co/videos/preview/mixkit-circuit-board-background-2720-large.mp4" // Example tech-themed video
            autoPlay
            loop
            muted
            playsInline
          >
            Your browser does not support the video tag.
          </video>
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 z-10"></div>
        </div>


        {/* Profile Section with Video Backdrop - Z-index for content above video */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-10 pb-8 border-b-2 border-gray-700">
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-blue-400 group flex-shrink-0">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {isLocalEditMode && (
              <label
                htmlFor="profileImageUpload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                Upload
                <input
                  id="profileImageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Gowry Sankar</h1>
            <p className="text-xl font-semibold text-gray-300 mb-4">Full Stack Developer & UI/UX Designer</p>
            <div className="flex justify-center sm:justify-start space-x-4">
              {portfolioData.contact?.linkedin && (
                <a
                  href={portfolioData.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-300 text-3xl transition-colors duration-300"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
              {portfolioData.contact?.github && (
                <a
                  href={portfolioData.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white text-3xl transition-colors duration-300"
                >
                  <i className="fab fa-github"></i>
                </a>
              )}
              {portfolioData.contact?.email && (
                <a
                  href={`mailto:${portfolioData.contact.email}`}
                  className="text-red-400 hover:text-red-300 text-3xl transition-colors duration-300"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              )}
            </div>
            {/* Typing Animation Section */}
            <div className="mt-8 text-xl font-light text-gray-300 bg-gray-700 bg-opacity-70 rounded-md p-4 flex items-center justify-center min-h-[80px]">
                <span ref={typingRef} className="whitespace-pre-wrap">{displayedQuote}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`relative z-20 flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4 mb-8 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {['About', 'Skills', 'Experience', 'Projects', 'Courses', 'Achievements', 'Contact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === tab
                  ? `${isDarkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg'}`
                  : `${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content relative z-20">
          {activeTab === 'About' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-6 rounded-lg shadow-inner relative group transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-4`}>About Me</h2>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{portfolioData.about}</p>
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('about', portfolioData.about)}
                  className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
              )}

              {/* Track My Interests Portal */}
              <div className={`mt-10 pt-8 border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-4`}>Track My Interests</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {(portfolioData.trackedInterests || []).map((profile, index) => (
                    <div key={index} className={`relative group ${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-colors duration-300`}>
                      <a href={profile.link} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={profile.image} alt={profile.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-contain" />
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-semibold`}>{profile.name}</span>
                      </a>
                      {isLocalEditMode && (
                        <button
                          onClick={() => handleDeleteItem('trackedInterests', index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isLocalEditMode && (
                  <button
                    onClick={handleAddProfile}
                    className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    Add More Profiles
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Skills' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-6 rounded-lg shadow-inner transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-4`}>Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(portfolioData.skills || {}).map(category => (
                  <div key={category} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} mb-3 capitalize`}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} {/* Format category names */}
                    </h3>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      {(portfolioData.skills[category] || []).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                    {isLocalEditMode && (
                      <button
                        onClick={() => handleEdit(`skills.${category}`, portfolioData.skills[category].join(', '))}
                        className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Experience' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'} p-6 rounded-lg shadow-inner relative transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-4`}>Experience</h2>
              <div className="space-y-6">
                {(portfolioData.experience || []).map((exp, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>{exp.title} at {exp.company}</h3>
                    <p className={`text-gray-400 text-sm mb-2`}>{exp.years}</p>
                    <p className={`text-gray-300`}>{exp.description}</p>
                    {isLocalEditMode && (
                      <button
                        onClick={() => handleDeleteItem('experience', index)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('experience', portfolioData.experience)}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                >
                  Edit Experience
                </button>
              )}
            </div>
          )}

          {activeTab === 'Projects' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-50'} p-6 rounded-lg shadow-inner relative transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>Projects</h2>
              {/* Project Category Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {projectCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setCurrentProjectFilter(category)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                      currentProjectFilter === category
                        ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`
                        : `${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(filteredProjects || []).map((project, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} mb-2`}>{project.name}</h3>
                    <p className={`text-gray-400 mb-2 text-sm italic`}>Category: {project.category || 'Uncategorized'}</p>
                    <p className={`text-gray-300`}>{project.description}</p>
                    {isLocalEditMode && (
                      <button
                        onClick={() => handleDeleteItem('projects', portfolioData.projects.indexOf(project))} // Find original index for deletion
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isLocalEditMode && (
                <button
                  onClick={() => handleAddItem('projects')}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Add Project
                </button>
              )}
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('projects', portfolioData.projects)}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                >
                  Edit Projects
                </button>
              )}
            </div>
          )}

          {activeTab === 'Courses' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-6 rounded-lg shadow-inner relative transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mb-4`}>Courses & Certifications</h2>
              <div className="space-y-6">
                {(portfolioData.courses || []).map((course, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>{course.name}</h3>
                    <p className={`text-gray-400`}>{course.certificate}</p>
                    {isLocalEditMode && (
                      <button
                        onClick={() => handleDeleteItem('courses', index)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isLocalEditMode && (
                <button
                  onClick={() => handleAddItem('courses')}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Add Course
                </button>
              )}
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('courses', portfolioData.courses)}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                >
                  Edit Courses
                </button>
              )}
            </div>
          )}

          {activeTab === 'Achievements' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} p-6 rounded-lg shadow-inner relative transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} mb-4`}>Achievements</h2>
              <ul className={`list-disc list-inside space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {(portfolioData.achievements || []).map((achievement, index) => (
                  <li key={index} className="relative group">
                    {achievement}
                    {isLocalEditMode && (
                      <button
                        onClick={() => handleDeleteItem('achievements', index)}
                        className="absolute left-full top-0 ml-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('achievements', (portfolioData.achievements || []).join('\n'))}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                >
                  Edit Achievements
                </button>
              )}
            </div>
          )}

          {activeTab === 'Contact' && (
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'} p-6 rounded-lg shadow-inner relative group transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} mb-4`}>Contact Me</h2>
              <div className={`space-y-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <p><strong>Email:</strong> {portfolioData.contact?.email}</p>
                <p><strong>Phone:</strong> {portfolioData.contact?.phone}</p>
                <p><strong>LinkedIn:</strong> <a href={portfolioData.contact?.linkedin} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}`}>{portfolioData.contact?.linkedin}</a></p>
                <p><strong>GitHub:</strong> <a href={portfolioData.contact?.github} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-gray-400 hover:underline' : 'text-gray-700 hover:underline'}`}>{portfolioData.contact?.github}</a></p>
              </div>
              {isLocalEditMode && (
                <button
                  onClick={() => handleEdit('contact', portfolioData.contact)}
                  className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
              )}

              {/* Contact Form */}
              <form onSubmit={handleContactSubmit} className="mt-8 pt-8 border-t-2 border-gray-600">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-4`}>Send a Message</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                ></textarea>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  disabled={contactStatus === 'sending'}
                >
                  {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {contactStatus === 'success' && <p className="text-green-500 mt-2 text-center">Message received (frontend demo only). A backend service is needed to send actual emails.</p>}
                {contactStatus === 'error' && <p className="text-red-500 mt-2 text-center">Failed to send message. Please try again.</p>}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>© {new Date().getFullYear()} Kosuri Gowry Sankar. All rights reserved.</p>
        <p>Designed with ❤️ and built with React, Tailwind CSS, and Local Storage.</p>
      </footer>


      {/* Modals */}
      {/* Login Modal (repurposed for Local Edit Mode info) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Local Edit Mode</h2>
            <p className="text-lg text-center mb-6">{loginMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseLoginModal}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            <div className="mb-6">
              <input
                ref={notificationInputRef}
                type="text"
                placeholder="Add new notification"
                className={`w-full p-3 mb-2 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddNotification();
                }}
              />
              <button
                onClick={handleAddNotification}
                className={`w-full py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold`}
              >
                Add Notification
              </button>
            </div>
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li key={notification.id} className={`flex justify-between items-center p-3 rounded-md shadow-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-base`}>{notification.message}</span>
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition duration-300 transform hover:scale-105"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setShowNotificationModal(false); setLoginMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (for about, contact, skills, achievements, experience, projects, courses, trackedInterests) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Edit {editingField.replace('skills.', '').replace(/([A-Z])/g, ' $1').trim().replace(/^(.)/, (match) => match.toUpperCase())}</h2>
            {loginMessage && <p className="text-red-600 text-center mb-4">{loginMessage}</p>}
            {editingField === 'about' && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-32 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="About Me description"
              ></textarea>
            )}
            {editingField === 'contact' && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-40 font-mono text-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter contact info as JSON: {"email": "...", "phone": "...", "linkedin": "...", "github": "..."}'
              ></textarea>
            )}
            {editingField.startsWith('skills.') && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-32 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter skills separated by commas (e.g., React, JavaScript, HTML)"
              ></textarea>
            )}
            {editingField === 'achievements' && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-40 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter each achievement on a new line"
              ></textarea>
            )}
            {(editingField === 'experience' || editingField === 'projects' || editingField === 'courses' || editingField === 'trackedInterests') && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-60 font-mono text-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter data as a JSON array of objects, e.g., [{"name": "Item 1", "description": "Desc 1", "category": "AI"}] for projects, or [{"name": "Platform", "image": "URL", "link": "URL"}] for tracked interests.`}
              ></textarea>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowEditModal(false); setLoginMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal (for projects/courses) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Add New {editingField.slice(0, -1)}</h2>
            {loginMessage && <p className="text-red-600 text-center mb-4">{loginMessage}</p>}
            {editingField === 'projects' && (
              <>
                <input
                  type="text"
                  placeholder="Project Name"
                  className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <textarea
                  placeholder="Project Description"
                  className={`w-full p-3 mb-4 border rounded-md h-24 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                ></textarea>
                 <select
                    className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                    value={newProjectCategory}
                    onChange={(e) => setNewProjectCategory(e.target.value)}
                    required
                 >
                    <option value="">Select Category</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="AI">AI</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="Other">Other</option>
                 </select>
              </>
            )}
            {editingField === 'courses' && (
              <>
                <input
                  type="text"
                  placeholder="Course Name"
                  className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Certificate Details"
                  className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
                  value={newCourseCert}
                  onChange={(e) => setNewCourseCert(e.target.value)}
                />
              </>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowAddModal(false); setLoginMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewItem}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Add New Tracked Profile</h2>
            {loginMessage && <p className="text-red-600 text-center mb-4">{loginMessage}</p>}
            <input
              type="text"
              placeholder="Platform Name (e.g., Medium, Stack Overflow)"
              className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Image URL (e.g., https://placehold.co/60x60?text=Icon)"
              className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
              value={newProfileImage}
              onChange={(e) => setNewProfileImage(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Profile Link (e.g., https://stackoverflow.com/users/your_id)"
              className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
              value={newProfileLink}
              onChange={(e) => setNewProfileLink(e.target.value)}
              required
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowAddProfileModal(false); setLoginMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewProfile}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
              >
                Add Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
