import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';

// --- Global Variables for Canvas Environment ---
// Note: These are ONLY available within the Canvas environment (e.g., when running in Google's AI Studio).
// For deployments like GitHub Pages, these will be undefined, so we provide hardcoded values.

const appId = 'shnakar-portfolio'; // This should match your Firebase projectId

// *** YOUR ACTUAL FIREBASE CONFIGURATION (FOR portwebApp) ***
// This configuration MUST EXACTLY match the details for the 'portwebApp' web app
// (App ID: 1:283865216684:web:1e5e9af6946fc513df1109) in your Firebase Project Settings.
const firebaseConfig = {
  apiKey: "AIzaSyB22e6RAx4jHl_eRHmC6Zj6Xjl9U6lRlf8",
  authDomain: "shnakar-portfolio.firebaseapp.com",
  projectId: "shnakar-portfolio",
  storageBucket: "shnakar-portfolio.firebasestorage.app",
  messagingSenderId: "283865216684",
  appId: "1:283865216684:web:1e5e9af6946fc513df1109", // CORRECT APP ID for portwebApp
  measurementId: "G-Z3EXX744MN" // CORRECT MEASUREMENT ID for portwebApp
};
// ******************************************************

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase outside the component to prevent re-initialization on re-renders
let firebaseApp;
let db;
let auth;

try {
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// Contact form Cloud Function endpoint (REPLACE WITH YOUR DEPLOYED FUNCTION URL)
// Example: https://us-central1-your-project-id.cloudfunctions.net/sendMail
const CONTACT_FORM_CLOUD_FUNCTION_URL = 'https://us-central1-shnakar-portfolio.cloudfunctions.net/sendMail'; // Placeholder

// Sample Firebase Cloud Function (Node.js) for sending contact form emails
/*
// Filename: functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure the email transport using the default SMTP transport and a GMail account.
// For example, using Gmail. You can use any SMTP transporter.
// NOTE: Set these environment variables via `firebase functions:config:set gmail.email="your_email@gmail.com" gmail.password="your_app_password"`
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendMail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*'); // Adjust for production
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Missing required fields: name, email, message.');
  }

  const mailOptions = {
    from: functions.config().gmail.email,
    to: functions.config().gmail.email, // Send to your admin email
    subject: `Portfolio Contact Form: Message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).send('Failed to send email.');
  }
});

// To deploy this function:
// 1. Install Node.js, npm, and Firebase CLI globally.
// 2. In your Firebase project's functions directory (e.g., `my-portfolio-website/functions`), run `npm install nodemailer`.
// 3. Set your Gmail credentials:
//    `firebase functions:config:set gmail.email="your_email@gmail.com" gmail.password="your_app_password"`
//    (For `your_app_password`, you might need to generate an app-specific password in your Google Account security settings if you have 2FA enabled).
// 4. Deploy the function: `firebase deploy --only functions`
*/


function App() {
  const [activeTab, setActiveTab] = useState('About');
  const [portfolioData, setPortfolioData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState(''); // For categorized projects
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCert, setNewCourseCert] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('https://placehold.co/400x400/CCCCCC/FFFFFF?text=Profile');

  // Tracked Interests specific states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [newProfileLink, setNewProfileLink] = useState('');

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(''); // 'success', 'error', 'sending'

  // Dark/Light Mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from local storage, default to true (dark mode)
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const notificationInputRef = useRef(null);
  const typingRef = useRef(null); // Ref for typing animation container

  // Admin credentials
  const ADMIN_EMAIL = '23jr1a05b3@gmail.com';

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
    if (!db) {
      console.error("Firestore not initialized for portfolio listener.");
      setLoading(false);
      return undefined;
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
          profileImage: profileImageUrl,
          trackedInterests: [
            { name: "GitHub", image: "https://placehold.co/60x60/181717/FFFFFF?text=GitHub", link: "https://github.com/shankarflux" },
            { name: "LeetCode", image: "https://placehold.co/60x60/FFA116/000000?text=LeetCode", link: "https://leetcode.com/your-username" },
            { name: "HackerRank", image: "https://placehold.co/60x60/2EC866/FFFFFF?text=HRank", link: "https://www.hackerrank.com/your-username" },
            { name: "Hack The Box", image: "https://placehold.co/60x60/00C39C/FFFFFF?text=HTB", link: "https://www.hackthebox.com/profile/your-id" }
          ]
        };
        setPortfolioData(defaultPortfolioData);
        setDoc(portfolioDocRef, defaultPortfolioData) // Using setDoc to initialize or overwrite
          .then(() => console.log("Default portfolio data set."))
          .catch(e => console.error("Error setting default portfolio data:", e));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching portfolio data:", error);
      setLoginError(`Failed to load portfolio data: ${error.message}. Please check Firebase rules.`);
      setLoading(false);
    });

    return unsubscribe;
  }, [db, appId, profileImageUrl]);

  /**
   * Sets up real-time listener for notifications.
   * Fetches data from Firestore and updates state.
   */
  const setupNotificationsListener = useCallback(() => {
    if (!db || !currentUserId) {
      console.log("Skipping notification listener setup: DB not ready or user not authenticated.");
      return undefined;
    }

    const notificationsCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'notifications');
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
      setLoginError(`Failed to load notifications: ${error.message}.`);
    });

    return unsubscribe;
  }, [db, appId, currentUserId]);

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
          try {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
          } catch (error) {
            console.error("Error signing in anonymously:", error);
            setLoginError(`Authentication failed: ${error.message}. App may not function correctly.`);
          }
        }
        setAuthReady(true);
      });
      return () => unsubscribe();
    } else {
      setLoginError("Firebase Authentication service is not available. Check Firebase setup.");
      setAuthReady(true);
      setLoading(false);
    }
  }, [auth, ADMIN_EMAIL]);

  // --- Data Listeners Effect ---
  useEffect(() => {
    if (authReady && db) {
      const unsubscribePortfolio = setupPortfolioListener();
      let unsubscribeNotifications;
      if (currentUserId) {
        unsubscribeNotifications = setupNotificationsListener();
      }

      return () => {
        if (unsubscribePortfolio) unsubscribePortfolio();
        if (unsubscribeNotifications) unsubscribeNotifications();
      };
    } else if (authReady && !db) {
      setLoginError("Firestore Database is not available. Data persistence will not work.");
      setLoading(false);
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
        timestamp: new Date().toISOString(),
      });
      setNewNotification('');
      if (notificationInputRef.current) {
        notificationInputRef.current.focus();
      }
      setLoginError('');
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
      setLoginError('');
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
    setLoginError(''); // Clear error when opening edit modal
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
      } else if (editingField === 'trackedInterests') {
        try {
          const parsedArray = JSON.parse(editValue);
          if (Array.isArray(parsedArray)) {
            updatedData.trackedInterests = parsedArray;
          } else {
            throw new Error(`Tracked Interests data must be a JSON array.`);
          }
        } catch (e) {
          throw new Error(`Invalid JSON for Tracked Interests data: ${e.message}`);
        }
      }

      await setDoc(portfolioDocRef, updatedData);
      setShowEditModal(false);
      setLoading(false);
      setLoginError('');
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      setLoginError(`Error saving: ${error.message}`);
      setLoading(false);
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
    setLoginError('');
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

      await setDoc(portfolioDocRef, updatedData);
      setShowAddModal(false);
      setLoading(false);
      setLoginError('');
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
      } else if (type === 'trackedInterests') { // Handle deletion for tracked interests
        updatedData.trackedInterests = updatedData.trackedInterests.filter((_, i) => i !== index);
      }

      await setDoc(portfolioDocRef, updatedData);
      setLoading(false);
      setLoginError('');
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
      const base64Image = reader.result;

      try {
        const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
        await updateDoc(portfolioDocRef, { profileImage: base64Image });
        setProfileImageUrl(base64Image);
        setLoading(false);
        setLoginError('');
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setLoginError(`Error uploading image: ${error.message}`);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProfile = () => {
    setShowAddProfileModal(true);
    setNewProfileName('');
    setNewProfileImage('');
    setNewProfileLink('');
    setLoginError('');
  };

  const handleSaveNewProfile = async () => {
    if (!db) {
      setLoginError("Cannot add profile: Firebase not ready.");
      return;
    }
    if (!newProfileName || !newProfileImage || !newProfileLink) {
      setLoginError("All profile fields are required.");
      return;
    }

    setLoading(true);
    try {
      const portfolioDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'portfolio');
      let updatedData = { ...portfolioData };
      const newProfile = {
        name: newProfileName,
        image: newProfileImage,
        link: newProfileLink
      };
      updatedData.trackedInterests = [...(updatedData.trackedInterests || []), newProfile];

      await setDoc(portfolioDocRef, updatedData);
      setShowAddProfileModal(false);
      setLoading(false);
      setLoginError('');
    } catch (error) {
      console.error("Error adding new profile:", error);
      setLoginError(`Error adding profile: ${error.message}`);
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    setLoginError(''); // Clear general login error
    try {
      const response = await fetch(CONTACT_FORM_CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      if (response.ok) {
        setContactStatus('success');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => setContactStatus(''), 3000); // Clear status after 3 seconds
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to send message.');
      }
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setContactStatus('error');
      setLoginError(`Message failed to send: ${error.message}`);
      setTimeout(() => { setContactStatus(''); setLoginError(''); }, 5000); // Clear status/error
    }
  };


  const projectCategories = ['All', 'Cybersecurity', 'AI', 'Cloud Computing', 'Full Stack'];
  const [currentProjectFilter, setCurrentProjectFilter] = useState('All');

  const filteredProjects = currentProjectFilter === 'All'
    ? (portfolioData.projects || [])
    : (portfolioData.projects || []).filter(project => project.category === currentProjectFilter);


  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
        <p className="text-2xl font-bold">
          {loginError ? `Error: ${loginError}` : "Loading Portfolio..."}
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-inter flex flex-col items-center p-4 sm:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      {/* Global Error Message Display */}
      {loginError && (
        <div className={`fixed top-4 right-4 ${isDarkMode ? 'bg-red-700' : 'bg-red-600'} text-white p-3 rounded-md shadow-lg z-50 flex items-center space-x-2`}>
          <span>{loginError}</span>
          <button onClick={() => setLoginError('')} className="ml-2 text-white font-bold">&times;</button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 z-10">
        <div className="flex space-x-4">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className={`py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
              Logout (Admin)
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              Admin Login
            </button>
          )}
        </div>

        {/* Display currentUserId */}
        {currentUserId && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-200'} px-3 py-1 rounded-full`}>
            User ID: {currentUserId}
          </div>
        )}

        <div className="flex space-x-4 items-center">
          {isAdmin && (
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
              {isAdmin && (
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
                      {isAdmin && (
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
                {isAdmin && (
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
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'} p-6 rounded-lg shadow-inner relative transition-colors duration-300`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-4`}>Experience</h2>
              <div className="space-y-6">
                {(portfolioData.experience || []).map((exp, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>{exp.title} at {exp.company}</h3>
                    <p className={`text-gray-400 text-sm mb-2`}>{exp.years}</p>
                    <p className={`text-gray-300`}>{exp.description}</p>
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
                    {isAdmin && (
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
              {isAdmin && (
                <button
                  onClick={() => handleAddItem('projects')}
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Add Project
                </button>
              )}
              {isAdmin && (
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
                  className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Add Course
                </button>
              )}
              {isAdmin && (
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
              {isAdmin && (
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
                {contactStatus === 'success' && <p className="text-green-500 mt-2 text-center">Message sent successfully!</p>}
                {contactStatus === 'error' && <p className="text-red-500 mt-2 text-center">Failed to send message. Please try again.</p>}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>© {new Date().getFullYear()} Kosuri Gowry Sankar. All rights reserved.</p>
        <p>Designed with ❤️ and built with React, Tailwind CSS, and Firebase.</p>
      </footer>


      {/* Modals */}
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
            {loginError && <p className="text-red-600 text-center mb-4">{loginError}</p>}
            <input
              type="email"
              placeholder="Admin Email"
              className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Admin Password"
              className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
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
                onClick={() => { setShowNotificationModal(false); setLoginError(''); }}
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
            {loginError && <p className="text-red-600 text-center mb-4">{loginError}</p>}
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
                onClick={() => { setShowEditModal(false); setLoginError(''); }}
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
                onClick={() => { setShowAddModal(false); setLoginError(''); }}
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
            {loginError && <p className="text-red-600 text-center mb-4">{loginError}</p>}
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
                onClick={() => { setShowAddProfileModal(false); setLoginError(''); }}
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
