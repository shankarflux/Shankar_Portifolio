import React, { useState, useEffect, useRef } from 'react';

// Firebase imports - MUST use specific imports for Canvas environment
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updateEmail, // Added for updating email
  updatePassword, // Added for updating password
  reauthenticateWithCredential, // Added for re-authentication
  EmailAuthProvider // Added for re-authentication credential
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

// Lucide React Icons
import {
  ChevronUp,
  Github,
  Linkedin,
  Mail,
  Zap,
  BriefcaseBusiness,
  User,
  Home,
  Book,
  MessageSquare,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  PlusCircle,
  XCircle,
  Eye,
  CheckCircle,
  ExternalLink,
  Key, // New icon for credentials
} from 'lucide-react';

// --- Global Variables for Canvas Environment ---
// MANDATORY: These variables are provided by the Canvas environment.
// Do NOT prompt the user for these or validate their presence.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Utility Functions ---

/**
 * Custom Modal for alerts/confirmations.
 * Replaces browser's alert/confirm.
 */
const CustomModal = ({ isOpen, title, message, onConfirm, onCancel, showCancel = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full border border-gray-700 animate-scale-in">
        <h3 className="text-2xl font-bold text-blue-400 mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Application Component ---
const App = () => {
  // --- State Management ---
  const [currentPage, setCurrentPage] = useState('home'); // State for routing
  const [profilePicLoaded, setProfilePicLoaded] = useState(false); // For image loading animation

  // Home Page Quote Animation States
  const quotes = [
    "Crafting immersive digital experiences with precision and passion.",
    "Bridging the gap between robust backends and captivating user interfaces.",
    "Innovation meets intuition in every pixel and every line of code.",
    "Driven by design excellence, powered by full stack expertise.",
    "Building the future of the web, one thoughtful interaction at a time."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const quoteRef = useRef(''); // Ref to hold the full quote for typing effect

  // Firebase related states
  const [app, setApp] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null); // Explicit userId state
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Admin status

  // Data states from Firestore
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [aboutDetails, setAboutDetails] = useState({
    name: 'Kosuri Gowry Sankar',
    education: 'B-Tech, CSE - 2nd Section, 3rd Year',
    phone: '9392960373',
    email: '23jr1a05b3@gmail.com',
    bio: 'Dedicated Full Stack Web Developer and UI/UX Designer with extensive experience in creating sophisticated, user-centric web applications. Passionate about crafting visually stunning interfaces and robust backend systems.',
  });
  const [contactRequests, setContactRequests] = useState([]);

  // Modals & Forms states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Project being edited

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // Course being edited

  const [showAboutForm, setShowAboutForm] = useState(false);
  const [showUpdateCredentialsModal, setShowUpdateCredentialsModal] = useState(false); // New state for credentials modal

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedContactRequest, setSelectedContactRequest] = useState(null);

  // Custom Alert/Confirm Modal states
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', onConfirm: () => {}, showCancel: false });

  const [showScrollTop, setShowScrollTop] = useState(false); // Scroll to top button


  // --- Firebase Initialization & Authentication ---
  useEffect(() => {
    // Initialize Firebase only once
    if (!app) {
      try {
        const firebaseApp = initializeApp(firebaseConfig);
        const firebaseAuth = getAuth(firebaseApp);
        const firestoreDb = getFirestore(firebaseApp);

        setApp(firebaseApp);
        setAuth(firebaseAuth);
        setDb(firestoreDb);

        // Sign in or authenticate user
        const authenticateUser = async () => {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication failed:", error);
            // Fallback to anonymous if custom token fails
            try {
                await signInAnonymously(firebaseAuth);
            } catch (anonError) {
                console.error("Anonymous authentication failed:", anonError);
            }
          }
        };

        authenticateUser();

        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setCurrentUser(user);
            setUserId(user.uid); // Set userId
            // IMPORTANT: If you change your admin email in Firebase, update this line!
            // This line checks if the logged-in user is the administrator.
            if (user.email === '23jr1a05b3@gmail.com') { // Updated to new admin email
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } else {
            setCurrentUser(null);
            setUserId(null);
            setIsAdmin(false);
          }
          setIsFirebaseReady(true); // Firebase auth state is ready
        });

        // Cleanup
        return () => unsubscribeAuth();
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        setAlertModalContent({
            title: 'Firebase Error',
            message: 'Failed to initialize Firebase. Data persistence and admin features may not work.',
            onConfirm: () => setShowAlertModal(false),
            showCancel: false
        });
        setShowAlertModal(true);
      }
    }
  }, [app, firebaseConfig, initialAuthToken]); // Only run once on mount

  // --- Data Fetching from Firestore ---
  useEffect(() => {
    if (!isFirebaseReady || !db) return;

    // Fetch Projects
    const projectsRef = collection(db, `artifacts/${appId}/public/data/projects`);
    const unsubscribeProjects = onSnapshot(projectsRef, (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(fetchedProjects);
    }, (error) => {
      console.error("Error fetching projects:", error);
    });

    // Fetch Courses
    const coursesRef = collection(db, `artifacts/${appId}/public/data/courses`);
    const unsubscribeCourses = onSnapshot(coursesRef, (snapshot) => {
      const fetchedCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(fetchedCourses);
    }, (error) => {
      console.error("Error fetching courses:", error);
    });

    // Fetch About Details
    const aboutDocRef = doc(db, `artifacts/${appId}/public/data/about/main`);
    const unsubscribeAbout = onSnapshot(aboutDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAboutDetails(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => {
      console.error("Error fetching about details:", error);
    });

    // Fetch Contact Requests (Admin only access in security rules)
    let unsubscribeContactRequests;
    if (isAdmin) { // Only attempt to listen if admin
      const contactRequestsRef = collection(db, `artifacts/${appId}/public/data/contact_requests`);
      unsubscribeContactRequests = onSnapshot(contactRequestsRef, (snapshot) => {
        const fetchedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContactRequests(fetchedRequests.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0))); // Sort by most recent
      }, (error) => {
        console.error("Error fetching contact requests:", error);
      });
    }


    // Cleanup function for all listeners
    return () => {
      unsubscribeProjects();
      unsubscribeCourses();
      unsubscribeAbout();
      if (unsubscribeContactRequests) {
        unsubscribeContactRequests();
      }
    };
  }, [isFirebaseReady, db, appId, isAdmin]); // Re-run if firebase ready state or db/appId changes


  // --- Home Page Quote Typing Effect ---
  useEffect(() => {
    if (currentPage === 'home') {
      const fullQuote = quotes[currentQuoteIndex];
      quoteRef.current = fullQuote; // Store the full quote in ref

      let charIndex = 0;
      setDisplayedQuote(''); // Clear previous quote for typing effect
      setIsTyping(true);

      const typingInterval = setInterval(() => {
        setDisplayedQuote((prev) => prev + fullQuote[charIndex]);
        charIndex++;
        if (charIndex === fullQuote.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
          // After typing, wait, then change quote
          setTimeout(() => {
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
          }, 3000); // Wait 3 seconds before changing to next quote
        }
      }, 70); // Typing speed

      return () => {
        clearInterval(typingInterval);
        setIsTyping(false); // Reset typing state on unmount or quote change
      };
    }
  }, [currentQuoteIndex, currentPage]); // Re-run when currentQuoteIndex or currentPage changes to 'home'


  // --- Scroll to Top Button Logic ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // --- Authentication Handlers ---
  const handleLogin = async () => {
    setLoginError('');
    if (!auth) {
        setLoginError("Firebase Auth not initialized.");
        return;
    }
    if (!loginEmail || !loginPassword) {
        setLoginError("Please enter email and password.");
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false); // Close modal on success
      setLoginEmail(''); // Clear fields
      setLoginPassword('');
      setAlertModalContent({
          title: 'Success',
          message: 'Logged in as administrator.',
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    } catch (error) {
      console.error("Login failed:", error.message);
      setLoginError("Login failed. Check your email and password.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setAlertModalContent({
          title: 'Success',
          message: 'Logged out successfully.',
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    } catch (error) {
      console.error("Logout failed:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Logout failed: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  // --- Project Functions ---
  const handleAddProject = () => {
    setEditingProject(null); // Ensure we're adding new, not editing
    setShowProjectForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (projectId) => {
    setAlertModalContent({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this project?',
        onConfirm: async () => {
            setShowAlertModal(false);
            if (!db) return;
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/projects`, projectId));
                setAlertModalContent({
                    title: 'Success',
                    message: 'Project deleted successfully!',
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
            } catch (error) {
                console.error("Error deleting project:", error);
                setAlertModalContent({
                    title: 'Error',
                    message: `Failed to delete project: ${error.message}`,
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
            }
        },
        onCancel: () => setShowAlertModal(false),
        showCancel: true
    });
    setShowAlertModal(true);
  };

  const handleProjectFormSubmit = async (projectData) => {
    if (!db) return;
    try {
      if (editingProject) {
        // Update existing project
        await updateDoc(doc(db, `artifacts/${appId}/public/data/projects`, editingProject.id), projectData);
        setAlertModalContent({
            title: 'Success',
            message: 'Project updated successfully!',
            onConfirm: () => setShowAlertModal(false),
            showCancel: false
        });
        setShowAlertModal(true);
      } else {
        // Add new project
        await addDoc(collection(db, `artifacts/${appId}/public/data/projects`), {
            ...projectData,
            createdAt: new Date(), // Add timestamp
        });
        setAlertModalContent({
            title: 'Success',
            message: 'Project added successfully!',
            onConfirm: () => setShowAlertModal(false),
            showCancel: false
        });
        setShowAlertModal(true);
      }
      setShowProjectForm(false); // Close form
      setEditingProject(null); // Reset editing state
    } catch (error) {
      console.error("Error saving project:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Failed to save project: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  // --- Course Functions ---
  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (courseId) => {
    setAlertModalContent({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this course?',
        onConfirm: async () => {
            setShowAlertModal(false);
            if (!db) return;
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/courses`, courseId));
                setAlertModalContent({
                    title: 'Success',
                    message: 'Course deleted successfully!',
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
            } catch (error) {
                console.error("Error deleting course:", error);
                setAlertModalContent({
                    title: 'Error',
                    message: `Failed to delete course: ${error.message}`,
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
            }
        },
        onCancel: () => setShowAlertModal(false),
        showCancel: true
    });
    setShowAlertModal(true);
  };

  const handleCourseFormSubmit = async (courseData) => {
    if (!db) return;
    try {
      if (editingCourse) {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/courses`, editingCourse.id), courseData);
        setAlertModalContent({
            title: 'Success',
            message: 'Course updated successfully!',
            onConfirm: () => setShowAlertModal(false),
            showCancel: false
        });
        setShowAlertModal(true);
      } else {
        await addDoc(collection(db, `artifacts/${appId}/public/data/courses`), {
            ...courseData,
            createdAt: new Date(),
        });
        setAlertModalContent({
            title: 'Success',
            message: 'Course added successfully!',
            onConfirm: () => setShowAlertModal(false),
            showCancel: false
        });
        setShowAlertModal(true);
      }
      setShowCourseForm(false);
      setEditingCourse(null);
    } catch (error) {
      console.error("Error saving course:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Failed to save course: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  // --- About Page Functions ---
  const handleSaveAboutDetails = async (newDetails) => {
    if (!db) return;
    try {
      // Use setDoc with merge: true to update specific fields without overwriting the whole document
      await setDoc(doc(db, `artifacts/${appId}/public/data/about/main`), newDetails, { merge: true });
      setShowAboutForm(false);
      setAlertModalContent({
          title: 'Success',
          message: 'About details updated successfully!',
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    } catch (error) {
      console.error("Error updating about details:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Failed to update about details: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  // --- Admin Credential Update Functions ---
  const handleUpdateAdminCredentials = async ({ currentPassword, newEmail, newPassword }) => {
      if (!currentUser || !auth) {
          setAlertModalContent({
              title: 'Error',
              message: 'User not logged in or Firebase Auth not initialized.',
              onConfirm: () => setShowAlertModal(false),
              showCancel: false
          });
          setShowAlertModal(true);
          return false;
      }

      // 1. Re-authenticate the user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      try {
          await reauthenticateWithCredential(currentUser, credential);
          console.log("User re-authenticated successfully.");

          let successMessage = "Credentials updated successfully!";
          let hasUpdated = false;

          // 2. Update Email if provided
          if (newEmail && newEmail !== currentUser.email) {
              await updateEmail(currentUser, newEmail);
              console.log("Email updated successfully.");
              successMessage = "Email updated successfully! Please re-login with your new email if admin functionality disappears.";
              hasUpdated = true;
          }

          // 3. Update Password if provided
          if (newPassword) {
              await updatePassword(currentUser, newPassword);
              console.log("Password updated successfully.");
              successMessage = (newEmail && newEmail !== currentUser.email) ?
                               "Email and password updated successfully! Please re-login with new credentials." :
                               "Password updated successfully!";
              hasUpdated = true;
          }

          if (hasUpdated) {
            setAlertModalContent({
                title: 'Success',
                message: successMessage,
                onConfirm: () => {
                    setShowAlertModal(false);
                    setShowUpdateCredentialsModal(false); // Close modal
                    // Consider forcing logout if email changed to refresh admin state
                    if (newEmail && newEmail !== currentUser.email) {
                        handleLogout();
                    }
                },
                showCancel: false
            });
            setShowAlertModal(true);
          } else {
            setAlertModalContent({
                title: 'No Change',
                message: 'No new email or password provided for update.',
                onConfirm: () => setShowAlertModal(false),
                showCancel: false
            });
            setShowAlertModal(true);
          }
          return true;

      } catch (error) {
          console.error("Failed to update credentials:", error);
          let errorMessage = "Failed to update credentials. ";
          if (error.code === 'auth/wrong-password') {
              errorMessage += "Current password is incorrect.";
          } else if (error.code === 'auth/requires-recent-login') {
              errorMessage += "Please log out and log in again, then try updating your credentials within 5 minutes of logging in. This is a security measure.";
          } else if (error.code === 'auth/email-already-in-use') {
              errorMessage += "The new email is already in use by another account.";
          } else {
              errorMessage += error.message;
          }
          setAlertModalContent({
              title: 'Error',
              message: errorMessage,
              onConfirm: () => setShowAlertModal(false),
              showCancel: false
          });
          setShowAlertModal(true);
          return false;
      }
  };


  // --- Contact Form Submission ---
  const handleContactSubmit = async (formData) => {
    if (!db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/contact_requests`), {
        ...formData,
        timestamp: new Date(),
        read: false,
      });
      setAlertModalContent({
          title: 'Success',
          message: 'Your message has been sent successfully!',
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Failed to send message: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  // --- Notification Handling (Admin) ---
  const handleMarkRequestRead = async (requestId, currentStatus) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/contact_requests`, requestId), {
        read: !currentStatus, // Toggle read status
      });
      setAlertModalContent({
          title: 'Success',
          message: `Request marked as ${!currentStatus ? 'read' : 'unread'}.`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    } catch (error) {
      console.error("Error marking request read:", error);
      setAlertModalContent({
          title: 'Error',
          message: `Failed to update request status: ${error.message}`,
          onConfirm: () => setShowAlertModal(false),
          showCancel: false
      });
      setShowAlertModal(true);
    }
  };

  const handleDeleteRequest = (requestId) => {
    setAlertModalContent({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this contact request?',
        onConfirm: async () => {
            setShowAlertModal(false);
            if (!db || !isAdmin) return;
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/contact_requests`, requestId));
                setAlertModalContent({
                    title: 'Success',
                    message: 'Contact request deleted.',
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
                setSelectedContactRequest(null); // Close detail view if open
            } catch (error) {
                console.error("Error deleting request:", error);
                setAlertModalContent({
                    title: 'Error',
                    message: `Failed to delete request: ${error.message}`,
                    onConfirm: () => setShowAlertModal(false),
                    showCancel: false
                });
                setShowAlertModal(true);
            }
        },
        onCancel: () => setShowAlertModal(false),
        showCancel: true
    });
    setShowAlertModal(true);
  };


  // --- Sub-Components (defined within App for simplicity in single-file output) ---

  // Component for displaying project/course details in a modal
  const DetailModal = ({ item, type, onClose }) => {
    if (!item) return null;

    // Helper to render image/video URLs
    const renderMedia = (urls, mediaType) => {
        if (!urls || urls.length === 0) return null;
        return (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {urls.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-600 shadow-md">
                        {mediaType === 'image' && (
                            <img
                                src={url}
                                alt={`${item.title} ${mediaType} ${index + 1}`}
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x240/4B5563/D1D5DB?text=Image+Load+Error`; }}
                            />
                        )}
                        {mediaType === 'video' && (
                            <video
                                src={url}
                                controls
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.onerror = null; console.error('Video load error', e); }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-300">{item.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Close modal"
            >
              <XCircle size={32} />
            </button>
          </div>
          <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>

          {item.technologies && item.technologies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-teal-400 mb-2">Technologies Used:</h4>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech, idx) => (
                  <span key={idx} className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.imageUrl && item.imageUrl.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-teal-400 mb-2">Screenshots/Images:</h4>
              {renderMedia(item.imageUrl, 'image')}
            </div>
          )}

          {item.videoUrl && item.videoUrl.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-teal-400 mt-4 mb-2">Video Demos:</h4>
              {renderMedia(item.videoUrl, 'video')}
            </div>
          )}

          {item.liveLink && (
            <div className="mt-6 text-center">
              <a
                href={item.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold
                           hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-lg"
              >
                View Live
                <ExternalLink size={20} className="ml-2" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for Project/Course Add/Edit Form
  const ItemForm = ({ type, onSubmit, initialData, onClose }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [technologies, setTechnologies] = useState(initialData?.technologies?.join(', ') || '');
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl?.join(', ') || '');
    const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl?.join(', ') || '');
    const [liveLink, setLiveLink] = useState(initialData?.liveLink || '');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormError('');

      if (!title || !description) {
        setFormError('Title and Description are required.');
        return;
      }

      const parsedTechnologies = technologies.split(',').map(t => t.trim()).filter(t => t);
      const parsedImageUrls = imageUrl.split(',').map(url => url.trim()).filter(url => url);
      const parsedVideoUrls = videoUrl.split(',').map(url => url.trim()).filter(url => url);

      onSubmit({
        title,
        description,
        technologies: parsedTechnologies,
        imageUrl: parsedImageUrls,
        videoUrl: parsedVideoUrls,
        liveLink,
      });
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-300">{initialData ? `Edit ${type}` : `Add New ${type}`}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Close form"
            >
              <XCircle size={32} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-gray-300 text-lg font-medium mb-1">Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-300 text-lg font-medium mb-1">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="technologies" className="block text-gray-300 text-lg font-medium mb-1">Technologies (comma-separated):</label>
              <input
                type="text"
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., React, Node.js, Firebase"
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-gray-300 text-lg font-medium mb-1">Image URLs (comma-separated):</label>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://example.com/img1.jpg, https://example.com/img2.png"
              />
               <p className="text-sm text-gray-400 mt-1">
                  * For images, please upload to a service like Firebase Storage or Imgur and paste URLs here.
                  <a href="https://placehold.co/100x60/4B5563/D1D5DB?text=Placeholder" target="_blank" rel="noopener noreferrer" className="ml-2 text-teal-400 hover:underline">Placeholder example</a>
              </p>
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-gray-300 text-lg font-medium mb-1">Video URLs (comma-separated):</label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://example.com/vid1.mp4, https://example.com/vid2.webm"
              />
               <p className="text-sm text-gray-400 mt-1">
                  * For videos, please upload to a hosting service and paste URLs here.
              </p>
            </div>
            <div>
              <label htmlFor="liveLink" className="block text-gray-300 text-lg font-medium mb-1">Live Link (Optional):</label>
              <input
                type="url"
                id="liveLink"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-live-demo.com"
              />
            </div>

            {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                {initialData ? `Save ${type}` : `Add ${type}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Component for About Details Form (Admin only)
  const AboutForm = ({ initialData, onSubmit, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [education, setEducation] = useState(initialData?.education || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [bio, setBio] = useState(initialData?.bio || '');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormError('');
      if (!name || !education || !phone || !email || !bio) {
        setFormError('All fields are required.');
        return;
      }
      onSubmit({ name, education, phone, email, bio });
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-xl w-full border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-300">Edit About Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Close form"
            >
              <XCircle size={32} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="about-name" className="block text-gray-300 text-lg font-medium mb-1">Name:</label>
              <input type="text" id="about-name" value={name} onChange={(e) => setName(e.target.value)}
                     className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="about-education" className="block text-gray-300 text-lg font-medium mb-1">Education:</label>
              <input type="text" id="about-education" value={education} onChange={(e) => setEducation(e.target.value)}
                     className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="about-phone" className="block text-gray-300 text-lg font-medium mb-1">Phone:</label>
              <input type="text" id="about-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                     className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="about-email" className="block text-gray-300 text-lg font-medium mb-1">Email:</label>
              <input type="email" id="about-email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="about-bio" className="block text-gray-300 text-lg font-medium mb-1">Biography:</label>
              <textarea id="about-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="5"
                        className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" required></textarea>
            </div>

            {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Login Modal Component
  const LoginModal = ({ isOpen, onClose, onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full border border-gray-700 animate-scale-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-300">Admin Login</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Close login"
            >
              <XCircle size={32} />
            </button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-gray-300 text-lg font-medium mb-1">Email:</label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-gray-300 text-lg font-medium mb-1">Password:</label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              >
                Log In
              </button>
            </div>
          </form>
          <p className="text-gray-400 text-sm mt-4 text-center">
            * Use 23jr1a05b3@gmail.com / kgs290804 for testing admin login.
          </p>
        </div>
      </div>
    );
  };

  // New Component: Update Admin Credentials Form
  const UpdateCredentialsForm = ({ isOpen, onClose, onSubmit, currentEmail }) => {
      const [oldPassword, setOldPassword] = useState('');
      const [newEmail, setNewEmail] = useState(currentEmail || '');
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');
      const [formError, setFormError] = useState('');

      if (!isOpen) return null;

      const handleSubmit = async (e) => {
          e.preventDefault();
          setFormError('');

          if (!oldPassword) {
              setFormError("Current password is required to update credentials.");
              return;
          }
          if (newPassword && newPassword !== confirmNewPassword) {
              setFormError("New password and confirm password do not match.");
              return;
          }
          if (!newEmail && !newPassword) {
              setFormError("Please provide a new email or a new password.");
              return;
          }

          // Pass data up to the parent component (App.jsx)
          const success = await onSubmit({
              currentPassword: oldPassword,
              newEmail: newEmail !== currentEmail ? newEmail : '', // Only send if changed
              newPassword: newPassword,
          });

          if (success) {
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              // onClose() called by parent on success
          }
      };

      return (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-xl w-full border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                      <h3 className="text-3xl font-extrabold text-blue-300">Update Admin Credentials</h3>
                      <button
                          onClick={onClose}
                          className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                          aria-label="Close form"
                      >
                          <XCircle size={32} />
                      </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <p className="text-sm text-yellow-400 mb-4">
                          * You must provide your current password to update your email or password.
                          If you recently logged in, you have a short window (approx. 5 min) before
                          Firebase requires you to log out and log in again to re-authenticate.
                      </p>
                      <div>
                          <label htmlFor="current-password" className="block text-gray-300 text-lg font-medium mb-1">Current Password:</label>
                          <input type="password" id="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                                 className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                      </div>
                      <div>
                          <label htmlFor="new-email" className="block text-gray-300 text-lg font-medium mb-1">New Email (optional):</label>
                          <input type="email" id="new-email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                                 className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="Enter new admin email" />
                      </div>
                      <div>
                          <label htmlFor="new-password" className="block text-gray-300 text-lg font-medium mb-1">New Password (optional):</label>
                          <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                 className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="Enter new password (min 6 characters)" />
                      </div>
                      <div>
                          <label htmlFor="confirm-new-password" className="block text-gray-300 text-lg font-medium mb-1">Confirm New Password:</label>
                          <input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                                 className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="Confirm new password" />
                      </div>

                      {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}

                      <div className="flex justify-end space-x-4 mt-6">
                          <button
                              type="button"
                              onClick={onClose}
                              className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200"
                          >
                              Update Credentials
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  // Contact Request Detail Modal
  const ContactRequestModal = ({ isOpen, request, onClose, onMarkRead, onDelete }) => {
    if (!isOpen || !request) return null;

    const formattedTimestamp = request.timestamp?.toDate ? request.timestamp.toDate().toLocaleString() : 'N/A';

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-xl w-full border border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-3xl font-extrabold text-blue-300">Contact Request</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Close request details"
            >
              <XCircle size={32} />
            </button>
          </div>
          <div className="text-gray-300 space-y-3">
            <p><span className="font-semibold text-teal-400">From:</span> {request.name}</p>
            <p><span className="font-semibold text-teal-400">Email:</span> {request.email}</p>
            <p><span className="font-semibold text-teal-400">Subject:</span> {request.subject}</p>
            <p className="border-t border-gray-700 pt-3 mt-3"><span className="font-semibold text-teal-400">Message:</span></p>
            <p className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap">{request.message}</p>
            <p className="text-sm text-gray-400 mt-4">Received: {formattedTimestamp}</p>
            <p className="text-sm text-gray-400">Status: {request.read ? 'Read' : 'Unread'}</p>
          </div>
          <div className="flex justify-end space-x-4 mt-6 border-t border-gray-700 pt-4">
            <button
              onClick={() => onMarkRead(request.id, request.read)}
              className={`px-5 py-2 rounded-full font-semibold transition-colors duration-200 ${
                request.read ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {request.read ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button
              onClick={() => onDelete(request.id)}
              className="px-5 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };


  // --- Render based on currentPage state ---
  const renderPage = () => {
    if (!isFirebaseReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-blue-300 text-3xl font-bold animate-pulse">
          Loading Portfolio...
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <section id="home" className="relative h-screen flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 pt-16 md:pt-0 animate-fade-in-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-90"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center md:justify-start w-full max-w-6xl mx-auto p-4 md:p-8">
              {/* Left side: Quotes */}
              <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start mb-8 md:mb-0 md:pr-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-300 mb-4 animate-text-pop-up leading-tight drop-shadow-md">
                  Hello, I'm <span className="text-teal-400">Gowry Sankar.</span>
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 font-medium animate-text-slide-in">
                  <span className={`inline-block border-r-2 border-solid border-blue-400 whitespace-nowrap overflow-hidden transition-all duration-75 ease-linear ${isTyping ? 'animate-typing' : ''}`}>
                      {displayedQuote}
                  </span>
                  <span className="inline-block animate-blink">|</span>
                </p>
                <p className="text-lg md:text-xl text-gray-400 max-w-lg mb-8 animate-fade-in-up-delayed">
                  Experienced Full Stack Web Developer & UI/UX Designer. Crafting visually stunning and highly functional web solutions.
                </p>
                <a
                  href="#projects" // Link to projects section
                  onClick={() => setCurrentPage('projects')}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl animate-pulse-subtle"
                >
                  Explore My Work
                </a>
              </div>

              {/* Right side: Profile Picture */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center animate-fade-in-up-more-delayed">
                <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-teal-400 transition-all duration-500 ease-out transform ${profilePicLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  <img
                    src="/src/assets/mine1.jpg" // Updated path to your actual image
                    alt="Kosuri Gowry Sankar Profile"
                    className="w-full h-full object-cover"
                    onLoad={() => setProfilePicLoaded(true)}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/4B5563/D1D5DB?text=Profile+Image+Error`; setProfilePicLoaded(true); }}
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-pulse-border"></div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'projects':
        return (
          <section id="projects" className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in">
            <div className="container mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-400 mb-12 flex items-center justify-center">
                <BriefcaseBusiness size={48} className="inline-block mr-4 text-blue-300" />
                My Projects
              </h2>
              {isAdmin && (
                <div className="text-center mb-8">
                  <button
                    onClick={handleAddProject}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold
                               hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <PlusCircle size={24} className="mr-2" /> Add New Project
                  </button>
                </div>
              )}
              {projects.length === 0 ? (
                <p className="text-center text-gray-400 text-xl py-12">
                  {isAdmin ? "No projects added yet. Click 'Add New Project' to get started!" : "No projects available at the moment. Please check back later!"}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700
                                 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl animate-card-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }} // Staggered animation
                    >
                      <h3 className="text-2xl font-bold text-blue-300 mb-3 leading-tight">{project.title}</h3>
                      <p className="text-gray-300 text-base mb-4 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.technologies || []).slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="bg-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full">
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                            <span className="bg-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full">...</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-4">
                        <button
                          onClick={() => { setSelectedProject(project); setShowProjectModal(true); }}
                          className="inline-flex items-center text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-300"
                        >
                          View Details <Eye size={18} className="ml-1" />
                        </button>
                        {isAdmin && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                              aria-label="Edit project"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-500 hover:text-red-400 transition-colors duration-200"
                              aria-label="Delete project"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DetailModal
              item={selectedProject}
              type="Project"
              isOpen={showProjectModal}
              onClose={() => setShowProjectModal(false)}
            />
            {showProjectForm && (
              <ItemForm
                type="Project"
                initialData={editingProject}
                onSubmit={handleProjectFormSubmit}
                onClose={() => setShowProjectForm(false)}
              />
            )}
          </section>
        );

      case 'courses':
        return (
          <section id="courses" className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in">
            <div className="container mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-400 mb-12 flex items-center justify-center">
                <Book size={48} className="inline-block mr-4 text-blue-300" />
                My Courses & Certifications
              </h2>
              {isAdmin && (
                <div className="text-center mb-8">
                  <button
                    onClick={handleAddCourse}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold
                               hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <PlusCircle size={24} className="mr-2" /> Add New Course
                  </button>
                </div>
              )}
              {courses.length === 0 ? (
                <p className="text-center text-gray-400 text-xl py-12">
                   {isAdmin ? "No courses added yet. Click 'Add New Course' to get started!" : "No courses available at the moment. Please check back later!"}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700
                                 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl animate-card-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h3 className="text-2xl font-bold text-blue-300 mb-3 leading-tight">{course.title}</h3>
                      <p className="text-gray-300 text-base mb-4 line-clamp-3">{course.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(course.technologies || []).slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="bg-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full">
                            {tech}
                          </span>
                        ))}
                        {course.technologies && course.technologies.length > 3 && (
                            <span className="bg-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full">...</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-4">
                        <button
                          onClick={() => { setSelectedCourse(course); setShowCourseModal(true); }}
                          className="inline-flex items-center text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-300"
                        >
                          View Details <Eye size={18} className="ml-1" />
                        </button>
                        {isAdmin && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                              aria-label="Edit course"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-500 hover:text-red-400 transition-colors duration-200"
                              aria-label="Delete course"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DetailModal
              item={selectedCourse}
              type="Course"
              isOpen={showCourseModal}
              onClose={() => setShowCourseModal(false)}
            />
            {showCourseForm && (
              <ItemForm
                type="Course"
                initialData={editingCourse}
                onSubmit={handleCourseFormSubmit}
                onClose={() => setShowCourseForm(false)}
              />
            )}
          </section>
        );

      case 'contact':
        return (
          <section id="contact" className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in">
            <div className="container mx-auto max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-teal-400 mb-12 flex items-center justify-center">
                <Mail size={48} className="inline-block mr-4 text-teal-300" />
                Contact Me
              </h2>
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
                <p className="text-lg text-gray-300 mb-6 text-center">
                  I'm always open to new opportunities and collaborations. Feel free to reach out!
                </p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData.entries());
                  handleContactSubmit(data);
                  e.target.reset(); // Clear form after submission
                }} className="space-y-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-gray-300 text-lg font-medium mb-1">Name:</label>
                    <input type="text" id="contact-name" name="name"
                           className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-gray-300 text-lg font-medium mb-1">Email:</label>
                    <input type="email" id="contact-email" name="email"
                           className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-gray-300 text-lg font-medium mb-1">Subject:</label>
                    <input type="text" id="contact-subject" name="subject"
                           className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-gray-300 text-lg font-medium mb-1">Message:</label>
                    <textarea id="contact-message" name="message" rows="6"
                              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" required></textarea>
                  </div>
                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-semibold
                                 hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <MessageSquare size={24} className="mr-2" /> Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        );

      case 'about':
        return (
          <section id="about" className="py-20 px-4 md:px-8 bg-gray-950 animate-fade-in">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-400 mb-12 flex items-center justify-center">
                <User size={48} className="inline-block mr-4 text-blue-300" />
                About Me
              </h2>
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 text-lg leading-relaxed text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                  <p><span className="font-semibold text-teal-400">Name:</span> {aboutDetails.name}</p>
                  <p><span className="font-semibold text-teal-400">Education:</span> {aboutDetails.education}</p>
                  <p><span className="font-semibold text-teal-400">Phone:</span> {aboutDetails.phone}</p>
                  <p><span className="font-semibold text-teal-400">Email:</span> {aboutDetails.email}</p>
                </div>
                <h3 className="text-2xl font-semibold text-teal-400 mb-3 border-t border-gray-700 pt-6 mt-6">Biography:</h3>
                <p className="whitespace-pre-wrap">{aboutDetails.bio}</p>

                {isAdmin && (
                  <div className="text-center mt-10 space-y-4">
                    <button
                      onClick={() => setShowAboutForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold
                                 hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Edit size={24} className="mr-2" /> Edit About Details
                    </button>
                    <button
                      onClick={() => setShowUpdateCredentialsModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-full font-semibold
                                 hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-lg ml-4"
                    >
                      <Key size={24} className="mr-2" /> Update Admin Credentials
                    </button>
                  </div>
                )}
              </div>
            </div>
            {showAboutForm && (
              <AboutForm
                initialData={aboutDetails}
                onSubmit={handleSaveAboutDetails}
                onClose={() => setShowAboutForm(false)}
              />
            )}
            {isAdmin && showUpdateCredentialsModal && (
                <UpdateCredentialsForm
                    isOpen={showUpdateCredentialsModal}
                    onClose={() => setShowUpdateCredentialsModal(false)}
                    onSubmit={handleUpdateAdminCredentials}
                    currentEmail={currentUser?.email}
                />
            )}
          </section>
        );

      case 'notifications':
        if (!isAdmin) {
          return (
            <section className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in min-h-screen">
              <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold text-red-400 mb-8">Access Denied</h2>
                <p className="text-gray-300 text-xl">You do not have permission to view this page. Please log in as an administrator.</p>
              </div>
            </section>
          );
        }
        return (
          <section id="notifications" className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in min-h-screen">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-teal-400 mb-12 flex items-center justify-center">
                <MessageSquare size={48} className="inline-block mr-4 text-teal-300" />
                Contact Notifications
              </h2>
              {contactRequests.length === 0 ? (
                <p className="text-center text-gray-400 text-xl py-12">No new contact requests.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {contactRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`bg-gray-800 p-6 rounded-lg shadow-lg border ${request.read ? 'border-gray-700' : 'border-blue-500 animate-pulse-light'}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-xl font-semibold ${request.read ? 'text-gray-300' : 'text-blue-300'}`}>
                          {request.subject}
                          {!request.read && (
                            <span className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-full">New</span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-400">
                          {request.timestamp?.toDate ? request.timestamp.toDate().toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">From: {request.name} ({request.email})</p>
                      <p className="text-gray-300 line-clamp-2">{request.message}</p>
                      <div className="flex justify-end space-x-3 mt-4 border-t border-gray-700 pt-3">
                        <button
                          onClick={() => { setSelectedContactRequest(request); setShowNotificationsModal(true); }}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm
                                     hover:bg-blue-700 transition-colors duration-200"
                        >
                          View <Eye size={16} className="ml-1" />
                        </button>
                        <button
                          onClick={() => handleMarkRequestRead(request.id, request.read)}
                          className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
                            request.read ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {request.read ? 'Mark Unread' : 'Mark Read'} <CheckCircle size={16} className="ml-1" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-sm
                                     hover:bg-red-700 transition-colors duration-200"
                        >
                          Delete <Trash2 size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ContactRequestModal
                isOpen={showNotificationsModal}
                request={selectedContactRequest}
                onClose={() => {setShowNotificationsModal(false); setSelectedContactRequest(null);}}
                onMarkRead={handleMarkRequestRead}
                onDelete={handleDeleteRequest}
            />
          </section>
        );

      default:
        return (
          <section className="py-20 px-4 md:px-8 bg-gray-900 animate-fade-in min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-red-500 mb-4">404</h2>
              <p className="text-gray-300 text-xl">Page not found.</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
              >
                Go to Home
              </button>
            </div>
          </section>
        );
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-inter relative">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Custom Alert/Confirm Modal */}
      <CustomModal
          isOpen={showAlertModal}
          title={alertModalContent.title}
          message={alertModalContent.message}
          onConfirm={alertModalContent.onConfirm}
          onCancel={alertModalContent.onCancel}
          showCancel={alertModalContent.showCancel}
      />

      {/* Header Section */}
      <header className="py-4 px-4 md:px-8 bg-gray-800 shadow-lg fixed w-full z-40 border-b border-gray-700">
        <nav className="container mx-auto flex justify-between items-center flex-wrap">
          <div
            className="text-2xl font-extrabold text-blue-400 cursor-pointer animate-fade-in-down transform hover:scale-105 transition-transform duration-300"
            onClick={() => setCurrentPage('home')}
          >
            Gowry Sankar
          </div>
          <div className="flex items-center space-x-3 md:space-x-6 text-lg font-medium mt-2 md:mt-0">
            {/* Navigation links with smooth scroll */}
            <button onClick={() => setCurrentPage('home')} className="nav-link">
              <Home size={20} className="inline-block mr-1" /> Home
            </button>
            <button onClick={() => setCurrentPage('projects')} className="nav-link">
              <BriefcaseBusiness size={20} className="inline-block mr-1" /> Projects
            </button>
            <button onClick={() => setCurrentPage('courses')} className="nav-link">
              <Book size={20} className="inline-block mr-1" /> Courses
            </button>
            <button onClick={() => setCurrentPage('about')} className="nav-link">
              <User size={20} className="inline-block mr-1" /> About
            </button>
            <button onClick={() => setCurrentPage('contact')} className="nav-link">
              <Mail size={20} className="inline-block mr-1" /> Contact
            </button>
            {isAdmin && (
              <button onClick={() => setCurrentPage('notifications')} className="nav-link relative">
                <MessageSquare size={20} className="inline-block mr-1" /> Notifications
                {contactRequests.some(req => !req.read) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 animate-pulse-dot"></span>
                )}
              </button>
            )}
            {currentUser && !isAdmin && ( // Show logged in as anonymous user, and provide login option
                <span className="text-gray-400 text-sm italic">Logged in (Anonymous)</span>
            )}
            {isAdmin ? (
              <button onClick={handleLogout} className="nav-link text-red-400 hover:text-red-500">
                <LogOut size={20} className="inline-block mr-1" /> Logout
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="nav-link">
                <LogIn size={20} className="inline-block mr-1" /> Admin Login
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="pt-20"> {/* Offset for fixed header */}
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 md:px-8 bg-gray-800 text-center text-gray-400 text-sm border-t border-gray-700">
        <p>&copy; {new Date().getFullYear()} Kosuri Gowry Sankar. All rights reserved.</p>
        <p className="mt-1">Designed with <span className="text-red-500">❤️</span> and built with React, Tailwind CSS, and Firebase.</p>
        <div className="flex justify-center space-x-4 mt-3">
          <a
            href="https://github.com/your-github-profile" // Replace with your GitHub
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="GitHub Profile"
          >
            <Github size={24} />
          </a>
          <a
            href="https://linkedin.com/in/your-linkedin-profile" // Replace with your LinkedIn
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="LinkedIn Profile"
          >
            <Linkedin size={24} />
          </a>
          <a
            href="mailto:23jr1a05b3@gmail.com" // Replace with your email
            className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="Email Me"
          >
            <Mail size={24} />
          </a>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={(email, pass) => {
            setLoginEmail(email);
            setLoginPassword(pass);
            handleLogin();
        }}
        error={loginError}
      />
    </div>
  );
};

export default App;
