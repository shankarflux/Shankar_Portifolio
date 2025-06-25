import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
// No direct use of getAnalytics from 'firebase/analytics' in this App component's logic,
// but the import for Analytics is kept commented out as it was in your provided code
// import { Analytics } from 'firebase/analytics'; 

// --- Global Variables for Canvas Environment ---
// Note: These are ONLY available within the Canvas environment (e.g., when running in Google's AI Studio).
// For deployments like GitHub Pages, these will be undefined, so we provide hardcoded values.

// Using the projectId from your actual Firebase config as a consistent appId.
// This is used for Firestore collection paths (public/data/ and users/{userId}/)
const appId = 'shnakar-portfolio'; // This should match your Firebase projectId

// *** YOUR ACTUAL FIREBASE CONFIGURATION ***
// This configuration MUST EXACTLY match the details for the 'shankar' web app
// (App ID: 1:283865216684:web:3c824b2df5ebf73adf1109) in your Firebase Project Settings.
const firebaseConfig = {
  apiKey: "AIzaSyB22e6RAx4jHl_eRHmC6Zj6Xjl9U6lRlf8",
  authDomain: "shnakar-portfolio.firebaseapp.com",
  projectId: "shnakar-portfolio",
  storageBucket: "shnakar-portfolio.firebasestorage.app",
  messagingSenderId: "283865216684",
  appId: "1:283865216684:web:3c824b2df5ebf73adf1109", // Make SURE this appId is correct for 'shankar'
  measurementId: "G-D5QQH552VJ" // Make SURE this measurementId is correct for 'shankar'
};
// ********************************************

// __initial_auth_token is provided by the Canvas environment for authentication.
// For GitHub Pages, it will be undefined, so we default to null.
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase outside the component to prevent re-initialization on re-renders
let firebaseApp;
let db;
let auth;

try {
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  // If you intend to use Google Analytics for Firebase, initialize it here:
  // const analytics = getAnalytics(firebaseApp);
} catch (error) {
  // Catching and logging the Firebase initialization error here
  console.error("Firebase initialization failed:", error);
  // An optional user-facing message could be displayed here if initialization fails
  // For now, the App will display its own error modal if `authReady` isn't true
}

function App() {
  const [activeTab, setActiveTab] = useState('About'); // State for active navigation tab
  const [portfolioData, setPortfolioData] = useState({}); // Stores all portfolio data
  const [isAdmin, setIsAdmin] = useState(false); // State to check if current user is admin
  const [showLoginModal, setShowLoginModal] = useState(false); // State to control login modal visibility
  const [adminEmail, setAdminEmail] = useState(''); // State for admin login email
  const [adminPassword, setAdminPassword] = useState(''); // State for admin login password
  const [loginError, setLoginError] = useState(''); // State for login error messages (also used for general app errors)
  const [authReady, setAuthReady] = useState(false); // State to indicate Firebase Auth is ready
  const [currentUserId, setCurrentUserId] = useState(null); // Stores current user's UID
  const [showNotificationModal, setShowNotificationModal] = useState(false); // State for notification modal
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [newNotification, setNewNotification] = useState(''); // State for new notification input
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
  const [profileImageFile, setProfileImageFile] = useState(null); // For image upload
  const [profileImageUrl, setProfileImageUrl] = useState('https://placehold.co/400x400/CCCCCC/FFFFFF?text=Profile'); // Default profile image

  const notificationInputRef = useRef(null); // Ref for notification input to maintain focus

  // Admin credentials (hardcoded for this example, in a real app, manage securely)
  const ADMIN_EMAIL = '23jr1a05b3@gmail.com';

  // --- Utility Functions ---

  /**
   * Generates a unique ID for new documents.
   * @returns {string} A unique ID.
   */
  const generateUniqueId = () => crypto.randomUUID();

  /**
   * Sets up real-time listener for portfolio data.
   * Fetches data from Firestore and updates state.
   */
  const setupPortfolioListener = useCallback(() => {
    // Only proceed if db is initialized
    if (!db) {
      console.error("Firestore not initialized for portfolio listener.");
      setLoading(false);
      return undefined; // Return undefined for cleanup
    }

    const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
    const unsubscribe = onSnapshot(portfolioDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPortfolioData(data);
        if (data.profileImage) {
          setProfileImageUrl(data.profileImage);
        }
        console.log("Portfolio data updated:", data);
      } else {
        console.log("No portfolio data found. Initializing with default structure.");
        const defaultPortfolioData = { // Define default data here
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
          profileImage: profileImageUrl // Use default initially
        };
        setPortfolioData(defaultPortfolioData);
        // Create the document if it doesn't exist
        setDoc(portfolioDocRef, defaultPortfolioData).catch(e => console.error("Error setting default portfolio data:", e));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching portfolio data:", error);
      setLoginError(`Failed to load portfolio data: ${error.message}. Please check Firebase rules.`); // Display error to user
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on component unmount
  }, [db, appId, profileImageUrl]); // Added db, appId, profileImageUrl as dependencies

  /**
   * Sets up real-time listener for notifications.
   * Fetches data from Firestore and updates state.
   */
  const setupNotificationsListener = useCallback(() => {
    // Only proceed if db and currentUserId are initialized
    if (!db || !currentUserId) {
      console.log("Skipping notification listener setup: DB not ready or user not authenticated.");
      return undefined; // Return undefined if prerequisites not met
    }

    // Notifications are private to the user
    const notificationsCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'notifications');
    // Using a more robust query that Firestore supports (no orderBy if not indexed, but assuming for now)
    const q = query(notificationsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(fetchedNotifications);
      console.log("Notifications updated:", fetchedNotifications);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoginError(`Failed to load notifications: ${error.message}.`); // Display error to user
    });

    return unsubscribe;
  }, [db, appId, currentUserId]); // Added all dependencies

  // --- Firebase Authentication Effect ---
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          if (user.email === ADMIN_EMAIL) {
            setIsAdmin(true);
            console.log("Admin logged in:", user.uid);
          } else {
            setIsAdmin(false);
            console.log("User logged in:", user.uid);
          }
        } else {
          setCurrentUserId(null);
          setIsAdmin(false);
          console.log("No user logged in. Attempting anonymous sign-in.");
          // Anonymous sign-in for unauthenticated users (like on GitHub Pages)
          try {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
          } catch (error) {
            console.error("Error signing in anonymously:", error);
            setLoginError(`Authentication failed: ${error.message}. App may not function correctly.`); // Display error to user
          }
        }
        setAuthReady(true); // Set authReady to true after initial check
      });
      return () => unsubscribe(); // Cleanup on unmount
    } else {
      // If auth object itself is not initialized (e.g., firebaseApp failed to initialize)
      setLoginError("Firebase Authentication service is not available. Check Firebase setup.");
      setAuthReady(true); // Still set authReady to true to proceed with UI render
      setLoading(false); // Stop loading if auth failed
    }
  }, [auth, ADMIN_EMAIL]);

  // --- Data Listeners Effect ---
  useEffect(() => {
    if (authReady && db) { // Ensure auth is ready and db is initialized before setting up listeners
      const unsubscribePortfolio = setupPortfolioListener();
      let unsubscribeNotifications;
      // Only set up notifications listener if currentUserId is available
      // This also implicitly relies on authentication succeeding
      if (currentUserId) {
        unsubscribeNotifications = setupNotificationsListener();
      }

      return () => {
        if (unsubscribePortfolio) unsubscribePortfolio();
        if (unsubscribeNotifications) unsubscribeNotifications();
      };
    } else if (authReady && !db) {
      // Auth is ready but DB failed to initialize. Display an error.
      setLoginError("Firestore Database is not available. Data persistence will not work.");
      setLoading(false); // Stop loading if DB not available
    }
  }, [authReady, db, currentUserId, setupPortfolioListener, setupNotificationsListener]);

  // --- Handlers for Admin/Edit Functionality ---

  const handleLogin = async () => {
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setShowLoginModal(false);
    } catch (error) {
      setLoginError(error.message);
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out.");
      // After logging out, attempt anonymous sign-in to keep a user session
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      setLoginError(`Logout failed: ${error.message}`);
    }
  };

  const handleAddNotification = async () => {
    if (!newNotification.trim() || !db || !currentUserId) {
      setLoginError("Cannot add notification: Invalid input or Firebase not ready.");
      return;
    }
    try {
      const notificationsCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'notifications');
      await addDoc(notificationsCollectionRef, {
        message: newNotification.trim(),
        timestamp: new Date().toISOString(), // Use ISO string for consistent sorting
      });
      setNewNotification('');
      if (notificationInputRef.current) {
        notificationInputRef.current.focus();
      }
    } catch (error) {
      console.error("Error adding notification:", error);
      setLoginError(`Error adding notification: ${error.message}`);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!db || !currentUserId) {
      setLoginError("Cannot delete notification: Firebase not ready or no user.");
      return;
    }
    try {
      const notificationDocRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'notifications', id);
      await deleteDoc(notificationDocRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setLoginError(`Error deleting notification: ${error.message}`);
    }
  };

  const handleEdit = (field, value, index = null) => {
    setEditingField(field);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!db) {
      setLoginError("Cannot save changes: Firebase not ready.");
      return;
    }
    setLoading(true);
    try {
      const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
      let updatedData = { ...portfolioData };

      if (editingField === 'about') {
        updatedData.about = editValue;
      } else if (editingField === 'contact') {
        // Validate JSON parsing
        try {
          updatedData.contact = JSON.parse(editValue);
        } catch (e) {
          throw new Error("Invalid JSON for Contact data.");
        }
      } else if (editingField.startsWith('skills')) {
        const skillCategory = editingField.split('.')[1];
        updatedData.skills[skillCategory] = editValue.split(',').map(s => s.trim()).filter(s => s); // Filter out empty strings
      } else if (editingField === 'achievements') {
        updatedData.achievements = editValue.split('\n').map(s => s.trim()).filter(s => s);
      } else if (editingField === 'experience' || editingField === 'projects' || editingField === 'courses') {
        // Validate JSON parsing and array type for complex fields
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

      await setDoc(portfolioDocRef, updatedData); // Use setDoc to overwrite with updated data
      // Optimistically update UI, but Firestore listener will eventually provide canonical data
      setPortfolioData(updatedData); 
      setShowEditModal(false);
      setLoading(false);
      setLoginError(''); // Clear any previous error on successful save
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      setLoginError(`Error saving: ${error.message}`); // Use loginError state for general errors
      setLoading(false);
    }
  };

  const handleAddItem = (type) => {
    setEditingField(type); // Re-use editingField to denote item type for add
    setShowAddModal(true);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewCourseName('');
    setNewCourseCert('');
  };

  const handleSaveNewItem = async () => {
    if (!db) {
      setLoginError("Cannot add item: Firebase not ready.");
      return;
    }
    setLoading(true);
    try {
      const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
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

      await setDoc(portfolioDocRef, updatedData);
      setPortfolioData(updatedData);
      setShowAddModal(false);
      setLoading(false);
      setLoginError(''); // Clear any previous error
    } catch (error) {
      console.error("Error adding new item:", error);
      setLoginError(`Error adding item: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type, index) => {
    if (!db) {
      setLoginError("Cannot delete item: Firebase not ready.");
      return;
    }
    setLoading(true);
    try {
      const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
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

      await setDoc(portfolioDocRef, updatedData);
      setPortfolioData(updatedData);
      setLoading(false);
      setLoginError(''); // Clear any previous error
    } catch (error) {
      console.error("Error deleting item:", error);
      setLoginError(`Error deleting item: ${error.message}`);
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!db) {
      setLoginError("Cannot upload image: Firebase not ready.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result; // This is the base64 string

      try {
        const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
        await updateDoc(portfolioDocRef, { profileImage: base64Image });
        setProfileImageUrl(base64Image); // Update state to display new image
        setLoading(false);
        setLoginError(''); // Clear any previous error
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setLoginError(`Error uploading image: ${error.message}`);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file); // Convert file to base64
  };

  // Display initial loading state or an error if Firebase setup completely failed
  if (loading || !authReady) { // Keep loading until auth is ready and initial data fetch starts
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-2xl font-bold">
          {loginError ? `Error: ${loginError}` : "Loading Portfolio..."}
        </p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-800 flex flex-col items-center p-4 sm:p-8">
      {/* Global Error Message Display */}
      {loginError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-md shadow-lg z-50 flex items-center space-x-2">
          <span>{loginError}</span>
          <button onClick={() => setLoginError('')} className="ml-2 text-white font-bold">&times;</button>
        </div>
      )}

      {/* Login/Logout and Notifications */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Logout (Admin)
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Admin Login
          </button>
        )}

        {/* Display currentUserId */}
        {currentUserId && (
          <div className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
            User ID: {currentUserId}
          </div>
        )}

        {isAdmin && (
          <button
            onClick={() => setShowNotificationModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Manage Notifications
          </button>
        )}
      </div>

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
            {isAdmin && (
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
              {isAdmin && (
                <button
                  onClick={() => handleEdit('about', portfolioData.about)}
                  className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
              )}
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
                    {isAdmin && (
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
            <div className="bg-purple-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-purple-600 mb-4">Experience</h2>
              <div className="space-y-6">
                {(portfolioData.experience || []).map((exp, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-md relative group">
                    <h3 className="text-xl font-semibold text-gray-700">{exp.title} at {exp.company}</h3>
                    <p className="text-gray-500 text-sm mb-2">{exp.years}</p>
                    <p className="text-gray-600">{exp.description}</p>
                    {isAdmin && (
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
              {isAdmin && (
                <button
                  onClick={() => handleEdit('experience', portfolioData.experience)}
                  className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Edit Experience
                </button>
              )}
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
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteItem('projects', index)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleAddItem('projects')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4"
                >
                  Add Project
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleEdit('projects', portfolioData.projects)}
                  className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Edit Projects
                </button>
              )}
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
                    {isAdmin && (
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
              {isAdmin && (
                <button
                  onClick={() => handleAddItem('courses')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4"
                >
                  Add Course
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleEdit('courses', portfolioData.courses)}
                  className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Edit Courses
                </button>
              )}
            </div>
          )}

          {activeTab === 'Achievements' && (
            <div className="bg-teal-50 p-6 rounded-lg shadow-inner relative">
              <h2 className="text-3xl font-bold text-teal-600 mb-4">Achievements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(portfolioData.achievements || []).map((achievement, index) => (
                  <li key={index} className="relative group">
                    {achievement}
                    {isAdmin && (
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
              {isAdmin && (
                <button
                  onClick={() => handleEdit('achievements', (portfolioData.achievements || []).join('\n'))}
                  className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Edit Achievements
                </button>
              )}
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
              {isAdmin && (
                <button
                  onClick={() => handleEdit('contact', portfolioData.contact)}
                  className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
            {loginError && <p className="text-red-600 text-center mb-4">{loginError}</p>}
            <input
              type="email"
              placeholder="Admin Email"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Notifications</h2>
            <div className="mb-6">
              <input
                ref={notificationInputRef}
                type="text"
                placeholder="Add new notification"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddNotification();
                }}
              />
              <button
                onClick={handleAddNotification}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 w-full"
              >
                Add Notification
              </button>
            </div>
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow-sm">
                  <span className="text-gray-700 text-base">{notification.message}</span>
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
                onClick={() => setShowNotificationModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (for about, contact, skills, achievements, experience, projects, courses) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit {editingField.replace('skills.', '').replace(/([A-Z])/g, ' $1').trim().replace(/^(.)/, (match) => match.toUpperCase())}</h2>
            {loginError && <p className="text-red-600 text-center mb-4">{loginError}</p>} {/* Display potential save errors here */}
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
                onClick={() => { setShowEditModal(false); setLoginError(''); }} // Clear error on close
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
