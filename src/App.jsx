import { useState, useEffect, useRef, useCallback } from 'react';

// --- Local Storage Implementation ---

// Key for storing portfolio data in Local Storage
const LOCAL_STORAGE_PORTFOLIO_KEY = 'myPortfolioData';

function App() {
  const [activeTab, setActiveTab] = useState('About'); // State for active navigation tab
  const [portfolioData, setPortfolioData] = useState({}); // Stores all portfolio data
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [editingField, setEditingField] = useState(''); // Stores the field being edited
  const [editValue, setEditValue] = useState(''); // Stores the value in the edit modal input
  const [editIndex, setEditIndex] = useState(null); // Stores the index of array item being edited (for projects/courses)
  const [showAddModal, setShowAddModal] = useState(false); // State for add item modal visibility
  const [newProjectName, setNewProjectName] = useState(''); // State for new project name
  const [newProjectDesc, setNewProjectDesc] = useState(''); // State for new project description
  const [newCourseName, setNewCourseName] = useState(''); // State for new course name
  const [newCourseCert, setNewCourseCert] = useState(''); // State for new course certificate
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [profileImageUrl, setProfileImageUrl] = useState('https://placehold.co/400x400/CCCCCC/FFFFFF?text=Profile'); // Default profile image

  const notificationInputRef = useRef(null); // Ref for potential future use, currently not used with local storage

  // No admin logic with local storage, as it's not multi-user/authenticated
  const isAdmin = true; // For demonstration, assume local user is always "admin" for editing UI
  const localError = useState('')[1]; // Placeholder for error display, not used for Firebase errors

  // --- Utility Functions for Local Storage ---

  /**
   * Defines default portfolio data if none exists in Local Storage.
   */
  const defaultPortfolioData = {
    about: "A passionate full stack developer and UI/UX designer with a knack for creating intuitive and efficient web applications. I love bringing ideas to life through code and crafting seamless user experiences.",
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
      { name: "E-commerce Platform", description: "Built a full-stack e-commerce site with user authentication, product listings, and payment integration." },
      { name: "Task Management App", description: "Developed a responsive task manager with drag-and-drop functionality and real-time updates." }
    ],
    courses: [
      { name: "Advanced React Patterns", certificate: "Issued by Online Academy" },
      { name: "Responsive Web Design", certificate: "Issued by Web Dev Institute" }
    ],
    skills: {
      frontend: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
      backend: ["Node.js", "Express.js", "Firebase", "MongoDB"],
      tools: ["Git", "VS Code", "Figma", "Jira"],
      design: ["UI/UX Design", "Wireframing", "Prototyping"]
    },
    achievements: [
      "Awarded 'Innovator of the Year' at Tech Innovations 2023.",
      "Published a research paper on accessible web design.",
      "Mentored junior developers in web development best practices."
    ],
    profileImage: 'https://placehold.co/400x400/CCCCCC/FFFFFF?text=Profile' // Default profile image
  };

  // --- Effect for loading data from Local Storage on mount ---
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_PORTFOLIO_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setPortfolioData(parsedData);
        if (parsedData.profileImage) {
          setProfileImageUrl(parsedData.profileImage);
        }
        console.log("Loaded portfolio data from Local Storage.");
      } else {
        // Initialize with default data if nothing in local storage
        setPortfolioData(defaultPortfolioData);
        localStorage.setItem(LOCAL_STORAGE_PORTFOLIO_KEY, JSON.stringify(defaultPortfolioData));
        console.log("Initialized portfolio data with defaults to Local Storage.");
      }
    } catch (error) {
      console.error("Error loading/parsing data from Local Storage:", error);
      // Fallback to default data if Local Storage is corrupted or inaccessible
      setPortfolioData(defaultPortfolioData);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- Effect for saving data to Local Storage whenever portfolioData changes ---
  useEffect(() => {
    if (!loading) { // Only save after initial load is complete
      try {
        localStorage.setItem(LOCAL_STORAGE_PORTFOLIO_KEY, JSON.stringify(portfolioData));
        console.log("Saved portfolio data to Local Storage.");
      } catch (error) {
        console.error("Error saving data to Local Storage:", error);
      }
    }
  }, [portfolioData, loading]);

  // --- Handlers for Editing Functionality (now local) ---

  const handleEdit = (field, value, index = null) => {
    setEditingField(field);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'about') {
        updatedData.about = editValue;
      } else if (editingField === 'contact') {
        try {
          updatedData.contact = JSON.parse(editValue);
        } catch (e) {
          throw new Error("Invalid JSON for Contact data.");
        }
      } else if (editingField.startsWith('skills')) {
        const skillCategory = editingField.split('.')[1];
        updatedData.skills[skillCategory] = editValue.split(',').map(s => s.trim()).filter(s => s);
      } else if (editingField === 'achievements') {
        updatedData.achievements = editValue.split('\n').map(s => s.trim()).filter(s => s);
      } else if (editingField === 'experience' || editingField === 'projects' || editingField === 'courses') {
        try {
          const parsedArray = JSON.parse(editValue);
          if (Array.isArray(parsedArray)) {
            updatedData[editingField] = parsedArray;
          } else {
            throw new Error(`${editingField} data must be a JSON array.`);
          }
        } catch (e) {
          throw new Error(`Invalid JSON for ${editingField} data: ${e.message}`);
        }
      }
      setPortfolioData(updatedData); // Update state, which triggers localStorage save
      setShowEditModal(false);
      localError(''); // Clear any previous local error
    } catch (error) {
      console.error("Error saving portfolio data locally:", error);
      localError(`Error saving: ${error.message}`);
    }
  };

  const handleAddItem = (type) => {
    setEditingField(type);
    setShowAddModal(true);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewCourseName('');
    setNewCourseCert('');
  };

  const handleSaveNewItem = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'projects') {
        if (newProjectName && newProjectDesc) {
          const newProject = { name: newProjectName, description: newProjectDesc };
          updatedData.projects = [...(updatedData.projects || []), newProject];
        } else {
          throw new Error("Project name and description cannot be empty.");
        }
      } else if (editingField === 'courses') {
        if (newCourseName && newCourseCert) {
          const newCourse = { name: newCourseName, certificate: newCourseCert };
          updatedData.courses = [...(updatedData.courses || []), newCourse];
        } else {
          throw new Error("Course name and certificate cannot be empty.");
        }
      }
      setPortfolioData(updatedData); // Update state, which triggers localStorage save
      setShowAddModal(false);
      localError(''); // Clear any previous local error
    } catch (error) {
      console.error("Error adding new item locally:", error);
      localError(`Error adding item: ${error.message}`);
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
      }
      setPortfolioData(updatedData); // Update state, which triggers localStorage save
      localError(''); // Clear any previous local error
    } catch (error) {
      console.error("Error deleting item locally:", error);
      localError(`Error deleting item: ${error.message}`);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result; // This is the base64 string
      setProfileImageUrl(base64Image); // Update state
      setPortfolioData(prevData => ({ ...prevData, profileImage: base64Image })); // This triggers localStorage save
      localError(''); // Clear any previous local error
    };
    reader.readAsDataURL(file); // Convert file to base64
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-2xl font-bold">Loading Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-800 flex flex-col items-center p-4 sm:p-8">
      {/* No admin login, notifications, or current user ID display with local storage */}
      {/* Main Content Area */}
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10 w-full max-w-6xl transform transition-all duration-500 ease-in-out scale-95 sm:scale-100">
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-10 pb-8 border-b-2 border-gray-200">
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-blue-400 group">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Editing is always enabled for local storage version */}
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
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Gowry Sankar</h1>
            <p className="text-xl font-semibold text-gray-700 mb-4">Full Stack Developer & UI/UX Designer</p>
            <div className="flex justify-center sm:justify-start space-x-4">
              {portfolioData.contact?.linkedin && (
                <a
                  href={portfolioData.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-3xl transition-colors duration-300"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
              {portfolioData.contact?.github && (
                <a
                  href={portfolioData.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black text-3xl transition-colors duration-300"
                >
                  <i className="fab fa-github"></i>
                </a>
              )}
              {portfolioData.contact?.email && (
                <a
                  href={`mailto:${portfolioData.contact.email}`}
                  className="text-red-500 hover:text-red-700 text-3xl transition-colors duration-300"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4 mb-8">
          {['About', 'Skills', 'Experience', 'Projects', 'Courses', 'Achievements', 'Contact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'About' && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-inner relative group">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">About Me</h2>
              <p className="text-lg leading-relaxed text-gray-800">{portfolioData.about}</p>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleEdit('about', portfolioData.about)}
                className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            </div>
          )}

          {activeTab === 'Skills' && (
            <div className="bg-green-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(portfolioData.skills || {}).map(category => (
                  <div key={category} className="bg-white p-5 rounded-lg shadow-md relative group">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3 capitalize">{category}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {(portfolioData.skills[category] || []).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                    {/* Editing is always enabled for local storage version */}
                    <button
                      onClick={() => handleEdit(`skills.${category}`, portfolioData.skills[category].join(', '))}
                      className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Experience' && (
            <div className="bg-purple-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-purple-600 mb-4">Experience</h2>
              <div className="space-y-6">
                {(portfolioData.experience || []).map((exp, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-md relative group">
                    <h3 className="text-xl font-semibold text-gray-700">{exp.title} at {exp.company}</h3>
                    <p className="text-gray-500 text-sm mb-2">{exp.years}</p>
                    <p className="text-gray-600">{exp.description}</p>
                    {/* Editing is always enabled for local storage version */}
                    <button
                      onClick={() => handleDeleteItem('experience', index)}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                    >
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleEdit('experience', portfolioData.experience)}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Edit Experience
              </button>
            </div>
          )}

          {activeTab === 'Projects' && (
            <div className="bg-red-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(portfolioData.projects || []).map((project, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-md relative group">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{project.name}</h3>
                    <p className="text-gray-600">{project.description}</p>
                    {/* Editing is always enabled for local storage version */}
                    <button
                      onClick={() => handleDeleteItem('projects', index)}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                    >
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleAddItem('projects')}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4"
              >
                Add Project
              </button>
              <button
                onClick={() => handleEdit('projects', portfolioData.projects)}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Edit Projects
              </button>
            </div>
          )}

          {activeTab === 'Courses' && (
            <div className="bg-yellow-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-yellow-600 mb-4">Courses & Certifications</h2>
              <div className="space-y-6">
                {(portfolioData.courses || []).map((course, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-md relative group">
                    <h3 className="text-xl font-semibold text-gray-700">{course.name}</h3>
                    <p className="text-gray-600">{course.certificate}</p>
                    {/* Editing is always enabled for local storage version */}
                    <button
                      onClick={() => handleDeleteItem('courses', index)}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                    >
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleAddItem('courses')}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4"
              >
                Add Course
              </button>
              <button
                onClick={() => handleEdit('courses', portfolioData.courses)}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Edit Courses
              </button>
            </div>
          )}

          {activeTab === 'Achievements' && (
            <div className="bg-teal-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-teal-600 mb-4">Achievements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(portfolioData.achievements || []).map((achievement, index) => (
                  <li key={index} className="relative group">
                    {achievement}
                    {/* Editing is always enabled for local storage version */}
                    <button
                      onClick={() => handleDeleteItem('achievements', index)}
                      className="absolute left-full top-0 ml-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      style={{ transform: 'translateY(-50%)' }}
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </li>
                ))}
              </ul>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleEdit('achievements', (portfolioData.achievements || []).join('\n'))}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Edit Achievements
              </button>
            </div>
          )}

          {activeTab === 'Contact' && (
            <div className="bg-indigo-50 p-6 rounded-lg shadow-inner relative group">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">Contact Me</h2>
              <div className="space-y-3 text-lg text-gray-800">
                <p><strong>Email:</strong> {portfolioData.contact?.email}</p>
                <p><strong>Phone:</strong> {portfolioData.contact?.phone}</p>
                <p><strong>LinkedIn:</strong> <a href={portfolioData.contact?.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{portfolioData.contact?.linkedin}</a></p>
                <p><strong>GitHub:</strong> <a href={portfolioData.contact?.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">{portfolioData.contact?.github}</a></p>
              </div>
              {/* Editing is always enabled for local storage version */}
              <button
                onClick={() => handleEdit('contact', portfolioData.contact)}
                className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals (Login/Notification modals removed as they are not applicable) */}

      {/* Edit Modal (for about, contact, skills, achievements, experience, projects, courses) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit {editingField.replace('skills.', '').replace(/([A-Z])/g, ' $1').trim().replace(/^(.)/, (match) => match.toUpperCase())}</h2>
            {/* localError display is just a placeholder here now */}
            {editingField === 'about' && (
              <textarea
                className="w-full p-3 mb-4 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="About Me description"
              ></textarea>
            )}
            {editingField === 'contact' && (
              <textarea
                className="w-full p-3 mb-4 border border-gray-300 rounded-md h-40 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter contact info as JSON: {"email": "...", "phone": "...", "linkedin": "...", "github": "..."}'
              ></textarea>
            )}
            {editingField.startsWith('skills.') && (
              <textarea
                className="w-full p-3 mb-4 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter skills separated by commas (e.g., React, JavaScript, HTML)"
              ></textarea>
            )}
            {editingField === 'achievements' && (
              <textarea
                className="w-full p-3 mb-4 border border-gray-300 rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter each achievement on a new line"
              ></textarea>
            )}
            {(editingField === 'experience' || editingField === 'projects' || editingField === 'courses') && (
              <textarea
                className="w-full p-3 mb-4 border border-gray-300 rounded-md h-60 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter data as a JSON array of objects, e.g., [{"name": "Item 1", "description": "Desc 1"}, {"name": "Item 2", "description": "Desc 2"}]`}
              ></textarea>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowEditModal(false); localError(''); }} // Clear error on close
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New {editingField.slice(0, -1)}</h2>
            {editingField === 'projects' && (
              <>
                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <textarea
                  placeholder="Project Description"
                  className="w-full p-3 mb-6 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                ></textarea>
              </>
            )}
            {editingField === 'courses' && (
              <>
                <input
                  type="text"
                  placeholder="Course Name"
                  className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Certificate Details"
                  className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCourseCert}
                  onChange={(e) => setNewCourseCert(e.target.value)}
                />
              </>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewItem}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
