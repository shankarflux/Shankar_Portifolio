import { useState, useEffect, useRef, useCallback } from 'react';

// Default initial portfolio data if Local Storage is empty
const defaultPortfolioData = {
  about: "A passionate full stack developer and UI/UX designer with a knack for creating intuitive and efficient web applications. I love bringing ideas to life through code and crafting seamless user experiences. My core interests lie in Cybersecurity, AI Development, and Cloud Computing, areas where I continuously learn and build.",
  contact: {
    email: "23jr1a05b3@gmail.com",
    phone: "+91 9392960373",
    linkedin: "https://www.linkedin.com/in/gowry-sankar-kosuri-03990231a/",
    github: "https://github.com/shankarflux",
    resumeLink: "/resume.pdf" // Path to your resume in the public folder
  },
  experience: [
    { title: "Software Engineer", company: "Tech Innovations", years: "2022-Present", description: "Developed and maintained web applications using React and Node.js, improving performance by 20%." },
    { title: "UI/UX Intern", company: "Creative Designs Inc.", years: "2021-2022", description: "Assisted in designing user interfaces and conducting usability tests for mobile applications." }
  ],
  projects: [
    {
      name: "AI Chatbot",
      description: "Developed an intelligent chatbot using NLP to provide automated customer support.",
      category: "AI",
      images: [ // Placeholder images, replace with your actual screenshots
        "https://placehold.co/600x400/5A189A/FFF?text=AI+Chatbot",
        "https://placehold.co/600x400/5A189A/FFF?text=Chatbot+Detail"
      ],
      techUsed: ["Python", "NLTK", "TensorFlow", "Flask"],
      challenges: "Handling complex user queries and integrating with external APIs, ensuring real-time responsiveness.",
      liveLink: "#", // Replace with actual live demo link
      githubLink: "https://github.com/shankarflux/ai-chatbot" // Replace with actual GitHub repo link
    },
    {
      name: "Playing Tic Tac Toe with AI",
      description: "Implemented an unbeatable Tic-Tac-Toe AI player using the Minimax algorithm, demonstrating strategic decision-making.",
      category: "AI",
      images: ["https://placehold.co/600x400/FF0080/FFF?text=TicTacToe+AI"],
      techUsed: ["Python", "Minimax Algorithm"],
      challenges: "Optimizing the AI's decision-making process for quick responses without noticeable delay.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/tic-tac-toe-ai"
    },
    {
      name: "Image Captioning using AI",
      description: "A deep learning model that generates descriptive and contextually relevant captions for given images.",
      category: "AI",
      images: ["https://placehold.co/600x400/00BFFF/FFF?text=Image+Captioning"],
      techUsed: ["Python", "TensorFlow", "Keras", "CNN", "RNN"],
      challenges: "Achieving high accuracy in caption generation across diverse image content and vocabularies.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/image-captioning-ai"
    },
    {
      name: "Face Recognition",
      description: "Developed a real-time face recognition system for secure authentication and attendance tracking.",
      category: "AI",
      images: ["https://placehold.co/600x400/5A189A/FFF?text=Face+Recognition"],
      techUsed: ["Python", "OpenCV", "dlib"],
      challenges: "Ensuring robustness under varying lighting conditions, facial expressions, and angles.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/face-recognition"
    },
    {
      name: "IDS (Intrusion Detection System) with own rules using Snort",
      description: "Configured and customized Snort to detect various network intrusions based on custom, meticulously crafted rule sets.",
      category: "Cybersecurity",
      images: ["https://placehold.co/600x400/FF0080/FFF?text=Snort+IDS"],
      techUsed: ["Snort", "Linux", "Network Security Concepts", "Rule Engineering"],
      challenges: "Writing effective and efficient Snort rules to minimize false positives and accurately identify threats.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/snort-ids"
    },
    {
      name: "Basic Packet Sniffer Tool",
      description: "A command-line tool developed to capture and analyze network packets, providing insights into network traffic.",
      category: "Cybersecurity",
      images: ["https://placehold.co/600x400/00BFFF/FFF?text=Packet+Sniffer"],
      techUsed: ["Python", "Scapy"],
      challenges: "Parsing various network protocols accurately and presenting complex data in a readable format.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/packet-sniffer"
    },
    {
      name: "Port Scanner",
      description: "A robust network tool to identify open ports on a target host, crucial for vulnerability assessments and network mapping.",
      category: "Cybersecurity",
      images: ["https://placehold.co/600x400/5A189A/FFF?text=Port+Scanner"],
      techUsed: ["Python", "Sockets"],
      challenges: "Handling different port states (open, closed, filtered) and optimizing scan speed for large networks.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/port-scanner"
    },
    {
      name: "Typing Speed Tester",
      description: "An interactive web application designed to test and improve typing speed and accuracy with real-time feedback.",
      category: "Full Stack",
      images: ["https://placehold.co/600x400/FF0080/FFF?text=Typing+Tester"],
      techUsed: ["HTML", "CSS", "JavaScript", "React"],
      challenges: "Implementing accurate timer logic, real-time character comparison, and user performance tracking.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/typing-speed-tester"
    },
    {
      name: "Secure IoT Dashboard",
      description: "Developed a real-time IoT dashboard with enhanced security features for data transmission and device management.",
      category: "Cybersecurity",
      images: ["https://placehold.co/600x400/00BFFF/FFF?text=IoT+Dashboard"],
      techUsed: ["React", "Node.js", "MQTT", "TLS", "MongoDB"],
      challenges: "Securing data at rest and in transit for various IoT devices, implementing robust access controls.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/secure-iot-dashboard"
    },
    {
      name: "Serverless E-commerce API",
      description: "Designed and deployed a scalable and cost-effective e-commerce API leveraging AWS Lambda and API Gateway.",
      category: "Cloud Computing",
      images: ["https://placehold.co/600x400/5A189A/FFF?text=Serverless+API"],
      techUsed: ["AWS Lambda", "API Gateway", "DynamoDB", "Node.js"],
      challenges: "Managing serverless cold starts, optimizing data access patterns for high traffic, and ensuring data consistency.",
      liveLink: "#",
      githubLink: "https://github.com/shankarflux/serverless-ecommerce-api"
    },
    {
      name: "Portfolio Website",
      description: "Created this responsive portfolio using React, Tailwind CSS, and Local Storage for dynamic content management, showcasing various skills and projects.",
      category: "Full Stack",
      images: ["https://placehold.co/600x400/FF0080/FFF?text=Portfolio"],
      techUsed: ["React", "Tailwind CSS", "JavaScript", "Local Storage", "HTML", "CSS"],
      challenges: "Implementing a multi-page structure with client-side routing, responsive design across devices, and theme switching.",
      liveLink: "https://shankarflux.github.io/Shankar_Portifolio/",
      githubLink: "https://github.com/shankarflux/Shankar_Portifolio"
    }
  ],
  courses: [
    { name: "Java Programming", certificate: "Oracle Certified Associate", description: "Comprehensive course covering core Java concepts and object-oriented programming.", link: "#" },
    { name: "Python for Data Science", certificate: "Coursera", description: "Explored data manipulation, analysis, and visualization with Python libraries, focusing on practical applications.", link: "#" },
    { name: "Flutter Mobile Development", certificate: "Udemy", description: "Built cross-platform mobile applications using Dart and Flutter framework, from UI design to state management.", link: "#" },
    { name: "Data Structures & Algorithms (DSA)", certificate: "NPTEL", description: "Mastered fundamental data structures and algorithms for efficient problem-solving and competitive programming.", link: "#" },
    { name: "C Language Fundamentals", certificate: "Online Course", description: "Learned basic to advanced concepts of C programming for system-level programming and embedded systems.", link: "#" },
    { name: "Internet of Things (IoT) Fundamentals", certificate: "Cisco Networking Academy", description: "Gained knowledge in IoT architectures, device connectivity, data analytics, and security considerations.", link: "#" }
  ],
  skills: {
    cybersecurity: [
        { name: "Network Security", level: 90 }, // Level added (1-100%)
        { name: "Penetration Testing", level: 85 },
        { name: "Vulnerability Assessment", level: 80 },
        { name: "IoT Security", level: 75 },
        { name: "SIEM (Security Information and Event Management)", level: 70 },
        { name: "Web Security Testing (Burp Suite, Wireshark)", level: 88 }
    ],
    ai_development: [
        { name: "Machine Learning", level: 92 },
        { name: "Deep Learning", level: 88 },
        { name: "Natural Language Processing (NLP)", level: 85 },
        { name: "Computer Vision", level: 80 },
        { name: "TensorFlow", level: 87 },
        { name: "PyTorch", level: 82 },
        { name: "AI Development", level: 90 }
    ],
    cloud_computing: [
        { name: "AWS", level: 85 },
        { name: "Azure", level: 70 },
        { name: "GCP", level: 65 },
        { name: "Serverless Architectures", level: 80 },
        { name: "Containerization (Docker, Kubernetes)", level: 78 }
    ],
    frontend: [
        { name: "React", level: 90 },
        { name: "JavaScript", level: 95 },
        { name: "HTML", level: 98 },
        { name: "CSS", level: 95 },
        { name: "Tailwind CSS", level: 90 },
        { name: "UI/UX Design", level: 85 }
    ],
    backend: [
        { name: "Node.js", level: 85 },
        { name: "Express.js", level: 80 },
        { name: "MongoDB", level: 75 },
        { name: "Python", level: 93 }
    ],
    tools: [
        { name: "Git", level: 95 },
        { name: "VS Code", level: 90 },
        { name: "Figma", level: 75 },
        { name: "Jira", level: 70 }
    ],
    app_development: [
        { name: "App Development (Flutter)", level: 88 }
    ]
  },
  achievements: [
    "Awarded 'Innovator of the Year' at Tech Innovations 2023.",
    "Published a research paper on accessible web design.",
    "Mentored junior developers in web development best practices.",
    "Secured top 5% in national cybersecurity hackathon.",
    "Developed and deployed an open-source AI anomaly detection system on AWS."
  ],
  profileImage: 'me1.png', // Corrected to .png
  trackedInterests: [
    { name: "GitHub", image: "https://placehold.co/60x60/181717/FFFFFF?text=GitHub", link: "https://github.com/shankarflux" },
    { name: "LeetCode", image: "https://placehold.co/60x60/FFA116/000000?text=LeetCode", link: "https://leetcode.com/u/Kosuri_Gowry_Sankar/" },
    { name: "HackerRank", image: "https://placehold.co/60x60/2EC866/FFFFFF?text=HRank", link: "https://www.hackerrank.com/profile/23jr1a05b3" },
    { name: "Hack The Box", image: "https://placehold.co/60x60/00C39C/FFFFFF?text=HTB", link: "https://account.hackthebox.com/nanomaverick4247" }
  ],
  blogPosts: [
    {
      id: "blog1",
      title: "The Future of Cybersecurity in IoT",
      date: "2024-06-25",
      tags: ["Cybersecurity", "IoT"],
      content: "IoT devices are becoming ubiquitous, and with their proliferation comes a significant increase in attack surface. This post explores emerging threats and best practices for securing IoT ecosystems, including challenges in device authentication, data privacy, and firmware updates. We delve into the importance of a layered security approach, leveraging robust encryption, secure boot mechanisms, and continuous monitoring to mitigate risks in connected environments."
    },
    {
      id: "blog2",
      title: "Demystifying AI for Beginners",
      date: "2024-05-10",
      tags: ["AI", "Machine Learning"],
      content: "Artificial Intelligence can seem daunting, but at its core, it's about teaching machines to learn from data. This article breaks down fundamental AI concepts for newcomers, from supervised and unsupervised learning to neural networks. We discuss the real-world applications of AI, such as natural language processing and computer vision, providing a stepping stone for aspiring AI enthusiasts to embark on their learning journey."
    },
    {
      id: "blog3",
      title: "Building Responsive UIs with Tailwind CSS",
      date: "2024-04-15",
      tags: ["Frontend", "Tailwind CSS", "UI/UX"],
      content: "Tailwind CSS has revolutionized frontend development with its utility-first approach. Learn how to build highly responsive and customizable user interfaces efficiently without writing custom CSS. This guide covers responsive breakpoints, component-based styling, and optimizing your development workflow to create beautiful and performant web applications with unparalleled speed and flexibility."
    }
  ]
};

// Component for the Header/Navbar
const Header = ({ activeTab, setActiveTab, toggleDarkMode, isDarkMode, isLocalEditMode, handleToggleLocalEditMode, setShowNotificationModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const navTabs = ['Home', 'About', 'Achievements', 'Contact', 'Blog'];

  const headerBgClass = isDarkMode ? 'bg-dark-bg-end' : 'bg-white';
  const textColorClass = isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark';
  const hoverClass = isDarkMode ? 'hover:text-dark-gradient-pink' : 'hover:text-light-accent-blue';
  const activeClass = isDarkMode ? 'bg-dark-gradient-purple text-white' : 'bg-light-accent-blue text-white';

  return (
    <header className={`fixed top-0 left-0 w-full z-50 py-4 px-4 sm:px-8 shadow-lg transition-colors duration-500 ${headerBgClass} ${textColorClass}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Name */}
        <h1 className="text-2xl font-bold">
          <span className={`${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-purple'} transition-colors duration-500`}>Gowry Sankar</span>
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105
                ${activeTab === tab
                  ? `${activeClass} shadow-lg`
                  : `${textColorClass} ${hoverClass}`
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right-aligned controls */}
        <div className="flex items-center space-x-4">
          {isLocalEditMode && (
            <button
              onClick={() => setShowNotificationModal(true)}
              className={`hidden md:block py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold bg-green-600 hover:bg-green-700 text-white text-sm`}
            >
              Manage Notifications
            </button>
          )}
          <button
            onClick={handleToggleLocalEditMode}
            className={`hidden md:block py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white text-sm ${isLocalEditMode ? 'bg-red-700 hover:bg-red-800' : 'bg-dark-gradient-blue hover:bg-blue-700'}`}
          >
            {isLocalEditMode ? 'Exit Edit Mode' : 'Toggle Edit Mode'}
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105
              ${isDarkMode ? 'bg-dark-gradient-purple text-accent-gold hover:bg-dark-gradient-blue' : 'bg-light-accent-blue text-white hover:bg-light-accent-purple'}`}
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
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-dark-gradient-pink' : 'focus:ring-light-accent-blue'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden mt-4 pb-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex flex-col space-y-2 px-2">
            {navTabs.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2 px-4 rounded-md font-medium transition-all duration-300
                  ${activeTab === tab
                    ? `${activeClass}`
                    : `${textColorClass} ${hoverClass}`
                  }`}
              >
                {tab}
              </button>
            ))}
            {isLocalEditMode && (
              <button
                onClick={() => { setShowNotificationModal(true); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2 px-4 rounded-md font-medium transition-all duration-300 bg-green-600 hover:bg-green-700 text-white`}
              >
                Manage Notifications
              </button>
            )}
            <button
              onClick={() => { handleToggleLocalEditMode(); setIsMobileMenuOpen(false); }}
              className={`block w-full text-left py-2 px-4 rounded-md font-medium transition-all duration-300 text-white ${isLocalEditMode ? 'bg-red-700 hover:bg-red-800' : 'bg-dark-gradient-blue hover:bg-blue-700'}`}
            >
              {isLocalEditMode ? 'Exit Edit Mode' : 'Toggle Edit Mode'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

// SkillBar component for visual proficiency
const SkillBar = ({ skill, isDarkMode }) => {
  const barColor = isDarkMode ? 'bg-dark-gradient-pink' : 'bg-light-accent-blue';
  const textColor = isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark';
  const bgColor = isDarkMode ? 'bg-dark-bg-start' : 'bg-gray-300'; // Adjusted for new dark theme background

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className={`font-semibold ${textColor}`}>{skill.name}</span>
        <span className={`text-sm font-medium ${textColor}`}>{skill.level}%</span>
      </div>
      <div className={`w-full ${bgColor} rounded-full h-2.5`}>
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${skill.level}%` }}
        ></div>
      </div>
    </div>
  );
};

// ProjectDetailModal Component
const ProjectDetailModal = ({ project, isDarkMode, onClose }) => {
  if (!project) return null;

  const bgColorClass = isDarkMode ? 'bg-dark-bg-end' : 'bg-white';
  const headingColorClass = isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-blue';
  const textColorClass = isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark';
  const accentTextColor = isDarkMode ? 'text-dark-gradient-blue' : 'text-light-accent-purple';
  const buttonBgClass = isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue' : 'bg-light-accent-blue hover:bg-light-accent-purple';
  const secondaryButtonBgClass = isDarkMode ? 'bg-dark-bg-start hover:bg-dark-gradient-purple' : 'bg-gray-300 hover:bg-gray-400';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
      <div className={`relative ${bgColorClass} ${textColorClass} p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 transform scale-95 opacity-0 animate-scale-in`}>
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all duration-300`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h3 className={`text-3xl font-bold mb-4 ${headingColorClass}`}>{project.name}</h3>
        <p className={`text-sm italic mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category: {project.category || 'Uncategorized'}</p>

        {project.images && project.images.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.images.map((imgSrc, idx) => (
              <img key={idx} src={imgSrc} alt={`${project.name} screenshot ${idx + 1}`} className="rounded-lg shadow-md w-full h-auto object-cover" />
            ))}
          </div>
        )}

        <p className={`mb-4 leading-relaxed ${textColorClass}`}>{project.description}</p>

        {project.techUsed && project.techUsed.length > 0 && (
          <div className="mb-4">
            <h4 className={`font-semibold mb-2 ${accentTextColor}`}>Technologies Used:</h4>
            <div className="flex flex-wrap gap-2">
              {project.techUsed.map((tech, idx) => (
                <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-dark-gradient-purple text-white' : 'bg-light-accent-blue text-white'}`}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.challenges && (
          <div className="mb-4">
            <h4 className={`font-semibold mb-2 ${accentTextColor}`}>Challenges:</h4>
            <p className={`italic ${textColorClass}`}>{project.challenges}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-6">
          {project.liveLink && project.liveLink !== '#' && (
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
               className={`flex items-center justify-center px-4 py-2 rounded-md font-bold text-white transition duration-300 ease-in-out transform hover:scale-105 ${buttonBgClass}`}>
              <i className="fas fa-external-link-alt mr-2"></i> Live Demo
            </a>
          )}
          {project.githubLink && project.githubLink !== '#' && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
               className={`flex items-center justify-center px-4 py-2 rounded-md font-bold transition duration-300 ease-in-out transform hover:scale-105 ${secondaryButtonBgClass} ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'}`}>
              <i className="fab fa-github mr-2"></i> GitHub Repo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [activeAchievementsSubTab, setActiveAchievementsSubTab] = useState('Courses'); // For nested navigation

  // Initialize portfolioData from Local Storage, or use default if empty
  const [portfolioData, setPortfolioData] = useState(() => {
    try {
      const savedData = localStorage.getItem('portfolioData');
      const parsedData = savedData ? JSON.parse(savedData) : defaultPortfolioData;

      // Ensure that if new fields are added to defaultPortfolioData, they exist in saved data
      return { ...defaultPortfolioData, ...parsedData };
    } catch (error)
    {
      console.error("Error parsing portfolioData from localStorage:", error);
      return defaultPortfolioData; // Fallback to default on error
    }
  });

  const [isLocalEditMode, setIsLocalEditMode] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      return savedNotifications ? JSON.parse(savedNotifications) : [];
    } catch (error) {
      console.error("Error parsing notifications from localStorage:", error);
      return [];
    }
  });
  const [newNotification, setNewNotification] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editValue, setEditValue] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('');
  const [newProjectImages, setNewProjectImages] = useState('');
  const [newProjectTechUsed, setNewProjectTechUsed] = useState('');
  const [newProjectChallenges, setNewProjectChallenges] = useState('');
  const [newProjectLiveLink, setNewProjectLiveLink] = useState('');
  const [newProjectGithubLink, setNewProjectGithubLink] = useState('');


  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCert, setNewCourseCert] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseLink, setNewCourseLink] = useState('');

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(0);
  const [newSkillCategory, setNewSkillCategory] = useState('');

  // Correctly reference the local asset path for profile image
  // Using `new URL()` and `import.meta.url` for reliable asset loading in Vite
  const profileImagePath = new URL(`/src/assets/${portfolioData.profileImage}`, import.meta.url).href;
  const [selectedProject, setSelectedProject] = useState(null);

  // Tracked Interests specific states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [newProfileLink, setNewProfileLink] = useState('');

  // Contact Form states (frontend only now)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');

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
  const pauseTime = 6500; // ms (time to wait after typing before starting next quote)

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
        setIsTyping(false); // Finished typing, now pause
        timeout = setTimeout(() => {
          setIsTyping(true); // Reset to start typing next quote
          charIndex = 0;
          setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, pauseTime);
      }
    };

    if (isTyping) { // Only start typing if isTyping is true
      typeCharacter();
    }

    return () => clearTimeout(timeout);
  }, [currentQuoteIndex, isTyping]); // Added isTyping to dependency array

  // --- Dark/Light Mode Toggle Effect ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      // Apply dark mode gradient background to the entire body
      document.body.style.background = 'linear-gradient(135deg, var(--tw-colors-dark-bg-start) 0%, var(--tw-colors-dark-bg-end) 100%)';
      document.body.style.minHeight = '100vh'; // Ensure it covers full height
      document.body.style.transition = 'background 0.5s ease-in-out';
    } else {
      document.documentElement.classList.remove('dark');
      // Apply light mode background
      document.body.style.background = 'linear-gradient(135deg, #F0F2F5 0%, #E6E8EB 100%)'; // Light gray gradient
      document.body.style.minHeight = '100vh';
      document.body.style.transition = 'background 0.5s ease-in-out';
    }
    localStorage.setItem('theme-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Handlers for Local Edit Mode Functionality ---
  const handleToggleLocalEditMode = () => {
    setIsLocalEditMode(prevMode => !prevMode);
    setShowInfoModal(true); // Reuse modal to show info
    if (!isLocalEditMode) {
      setInfoMessage("You are now in Local Edit Mode. Changes will only be saved in this browser.");
    } else {
      setInfoMessage("Local Edit Mode is OFF. Changes are not being saved.");
    }
  };

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    setInfoMessage('');
  };

  const handleAddNotification = () => {
    if (!newNotification.trim()) {
      setInfoMessage("Cannot add empty notification."); // Use setInfoModalMessage if exists, or setInfoMessage
      return;
    }
    const newId = Date.now().toString(); // Simple ID for local storage
    const updatedNotifications = [{ id: newId, message: newNotification.trim(), timestamp: new Date().toISOString() }, ...notifications];
    setNotifications(updatedNotifications);
    setNewNotification('');
    if (notificationInputRef.current) {
      notificationInputRef.current.focus();
    }
    setInfoMessage('');
  };

  const handleDeleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    setInfoMessage('');
  };

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    setShowEditModal(true);
    setInfoMessage(''); // Clear any previous message
  };

  const handleSaveEdit = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'about') {
        updatedData.about = editValue;
      } else if (editingField === 'contact') {
        updatedData.contact = JSON.parse(editValue);
      } else if (editingField.startsWith('skills.')) {
        // For skills, editValue is a JSON string of array of objects: [{"name": "Skill", "level": 90}, ...]
        const skillCategory = editingField.split('.')[1];
        const parsedSkills = JSON.parse(editValue);
        if (!Array.isArray(parsedSkills)) {
            throw new Error("Skills data must be a JSON array of objects.");
        }
        updatedData.skills[skillCategory] = parsedSkills;
      } else if (editingField === 'achievements') {
        updatedData.achievements = editValue.split('\n').map(s => s.trim()).filter(s => s);
      } else if (['experience', 'projects', 'courses', 'trackedInterests', 'blogPosts'].includes(editingField)) {
        const parsedArray = JSON.parse(editValue);
        if (Array.isArray(parsedArray)) {
          updatedData[editingField] = parsedArray;
        } else {
          throw new Error(`${editingField} data must be a JSON array.`);
        }
      }

      setPortfolioData(updatedData); // This will trigger useEffect to save to localStorage
      setShowEditModal(false);
      setInfoMessage('Changes saved locally!');
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      setInfoMessage(`Error saving: ${error.message}`);
    }
  };

  const handleAddItem = (type) => {
    setEditingField(type);
    setShowAddModal(true);
    // Reset all new item specific states
    setNewProjectName(''); setNewProjectDesc(''); setNewProjectCategory('');
    setNewProjectImages(''); setNewProjectTechUsed(''); setNewProjectChallenges('');
    setNewProjectLiveLink(''); setNewProjectGithubLink('');
    setNewCourseName(''); setNewCourseCert(''); setNewCourseDesc(''); setNewCourseLink('');
    setNewSkillName(''); setNewSkillLevel(0); setNewSkillCategory('');
    setNewProfileName(''); setNewProfileImage(''); setNewProfileLink('');
    setInfoMessage('');
  };

  const handleSaveNewItem = () => {
    try {
      let updatedData = { ...portfolioData };

      if (editingField === 'projects') {
        if (newProjectName && newProjectDesc && newProjectCategory) {
          const newProject = {
            name: newProjectName,
            description: newProjectDesc,
            category: newProjectCategory,
            images: newProjectImages ? newProjectImages.split(',').map(s => s.trim()).filter(s => s) : [],
            techUsed: newProjectTechUsed ? newProjectTechUsed.split(',').map(s => s.trim()).filter(s => s) : [],
            challenges: newProjectChallenges,
            liveLink: newProjectLiveLink,
            githubLink: newProjectGithubLink
          };
          updatedData.projects = [...(updatedData.projects || []), newProject];
        } else {
          throw new Error("Project name, description, and category cannot be empty.");
        }
      } else if (editingField === 'courses') {
        if (newCourseName && newCourseCert) {
          const newCourse = {
            name: newCourseName,
            certificate: newCourseCert,
            description: newCourseDesc, // New field
            link: newCourseLink // New field
          };
          updatedData.courses = [...(updatedData.courses || []), newCourse];
        } else {
          throw new Error("Course name and certificate cannot be empty.");
        }
      } else if (editingField === 'skills') { // Adding new skill
        if (newSkillName && newSkillLevel && newSkillCategory) {
          const newSkill = { name: newSkillName, level: parseInt(newSkillLevel, 10) };
          if (!updatedData.skills[newSkillCategory]) {
              updatedData.skills[newSkillCategory] = [];
          }
          updatedData.skills[newSkillCategory] = [...(updatedData.skills[newSkillCategory] || []), newSkill];
        } else {
          throw new Error("Skill name, level, and category cannot be empty.");
        }
      }

      setPortfolioData(updatedData);
      setShowAddModal(false);
      setInfoMessage('New item added locally!');
    } catch (error) {
      console.error("Error adding new item:", error);
      setInfoMessage(`Error adding item: ${error.message}`);
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
      } else if (type.startsWith('skills.')) {
        const skillCategory = type.split('.')[1];
        const skillIndex = parseInt(index, 10); // Index of the skill to delete within its category
        updatedData.skills[skillCategory] = updatedData.skills[skillCategory].filter((_, i) => i !== skillIndex);
      } else if (type === 'blogPosts') {
        updatedData.blogPosts = updatedData.blogPosts.filter((_, i) => i !== index);
      }

      setPortfolioData(updatedData);
      setInfoMessage('Item deleted locally!');
    } catch (error) {
      console.error("Error deleting item:", error);
      setInfoMessage(`Error deleting item: ${error.message}`);
    }
  };

  // Adjusted to use profileImagePath which handles Vite's asset serving
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      // Update portfolioData's profileImage to store the base64 string
      setPortfolioData(prevData => ({ ...prevData, profileImage: base64Image }));
      // Set profileImageUrl state to the new base64 string for immediate display
      setProfileImageUrl(base64Image);
      setInfoMessage('Profile image updated locally!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddProfile = () => {
    setShowAddProfileModal(true);
    setNewProfileName('');
    setNewProfileImage('');
    setNewProfileLink('');
    setInfoMessage('');
  };

  const handleSaveNewProfile = () => {
    if (!newProfileName || !newProfileImage || !newProfileLink) {
      setInfoMessage("All profile fields are required.");
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
      setInfoMessage('New profile added locally!');
    } catch (error) {
      console.error("Error adding new profile:", error);
      setInfoMessage(`Error adding profile: ${error.message}`);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');
    setInfoMessage('');
    // Simulate sending, as there's no backend for local storage version
    setTimeout(() => {
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setInfoMessage('Message received (frontend demo only). A backend service is needed to send actual emails.');
      setTimeout(() => { setContactStatus(''); setInfoMessage(''); }, 8000); // Clear after longer time
    }, 1500);
  };

  const projectCategories = ['All', 'Cybersecurity', 'AI', 'Cloud Computing', 'Full Stack', 'Other'];
  const [currentProjectFilter, setCurrentProjectFilter] = useState('All');

  const filteredProjects = currentProjectFilter === 'All'
    ? (portfolioData.projects || [])
    : (portfolioData.projects || []).filter(project => project.category === currentProjectFilter);

  // Home Page Content
  const HomePage = () => (
    <div className={`relative min-h-screen flex flex-col items-center justify-start p-4 sm:p-8 overflow-hidden pt-20
      ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'}`}>
      {/* Dynamic Background Elements for Dark Mode (Cloning the image) */}
      {isDarkMode && (
        <>
          {/* Main large circle (like the VR headset image) */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-dark-gradient-purple to-dark-gradient-blue opacity-50 blur-3xl z-0 hidden lg:block animate-fade-in"></div>
          {/* Smaller abstract shapes/lines */}
          <div className="absolute left-10 top-1/4 w-40 h-40 rounded-full bg-dark-gradient-pink opacity-30 blur-2xl z-0 animate-fade-in hidden md:block"></div>
          <div className="absolute bottom-5 right-1/4 w-60 h-60 rounded-full bg-dark-gradient-blue opacity-30 blur-2xl z-0 animate-fade-in hidden md:block"></div>
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-gradient-pink blur-sm animate-pulse-slow"></div> {/* Small pulsing dot */}
        </>
      )}

      {/* Background Video (Subtle, for both themes, adjusted opacity) */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20" // Increased opacity for more visibility
        src="https://assets.mixkit.co/videos/preview/mixkit-abstract-blue-and-red-lines-41589-large.mp4" // Abstract tech video
        autoPlay
        loop
        muted
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay for text readability and theme blending - Adjusted opacity */}
      <div className={`absolute inset-0 z-10 ${isDarkMode ? 'bg-gradient-to-b from-dark-bg-start to-dark-bg-end opacity-80' : 'bg-gradient-to-b from-white to-gray-100 opacity-80'}`}></div>


      <div className="relative z-20 w-full max-w-4xl mx-auto pt-8 animate-fade-in"> {/* Changed from flex-col items-center to w-full mx-auto */}

        {/* New container for image and intro text - flex-row on large screens */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start w-full mb-8">
          {/* Profile Picture and Glowing Border - Position and Size Adjusted */}
          <div className={`relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden shadow-2xl group flex-shrink-0 mb-8 lg:mb-0 lg:mr-12 transition-all duration-500 transform hover:scale-105
              ${isDarkMode ? 'border-4 sm:border-8 border-dark-gradient-pink shadow-glow-pink' : 'border-4 sm:border-8 border-light-accent-blue shadow-lg'}
              mx-auto lg:mx-0`}> {/* mx-auto for mobile centering, lg:mx-0 for left align on desktop */}
            <img
              src={profileImagePath} // Use the resolved path
              alt="Gowry Sankar Profile"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {isLocalEditMode && (
              <label
                htmlFor="profileImageUpload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
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

          {/* Text content - flex-grow and left-aligned on large screens */}
          <div className="flex-grow text-center lg:text-left">
            <h1 className={`text-4xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg
              ${isDarkMode ? 'text-white' : 'text-text-light-dark'}`}>
              Hi, I'm <span className={`${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-blue'} gradient-text`}>Gowry Sankar</span>
            </h1>
            <p className={`text-xl sm:text-2xl font-semibold mb-6 max-w-2xl
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Stack Developer & UI/UX Designer
            </p>
            <p className={`text-lg sm:text-xl leading-relaxed mb-8 max-w-3xl
              ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {portfolioData.about.split('. ').slice(0,2).join('. ')}.
            </p>
          </div>
        </div>

        {/* Typing Animation Section - Now outside the image/text flex container, centered */}
        <div className={`w-full max-w-xl text-lg sm:text-xl font-light rounded-xl p-6 flex items-center justify-center min-h-[90px] shadow-lg border animate-pulse-border mx-auto mb-12
          ${isDarkMode ? 'bg-dark-bg-start bg-opacity-80 border-dark-gradient-blue text-dark-gradient-blue' : 'bg-gray-100 bg-opacity-80 border-light-accent-blue text-light-accent-blue'}`}>
            <span ref={typingRef} className="whitespace-pre-wrap">{displayedQuote}</span>
        </div>

        {/* Call to action buttons - Now outside the image/text flex container, centered */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-12 mx-auto mb-12">
            <button
                onClick={() => setActiveTab('About')}
                className={`py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl
                  ${isDarkMode ? 'bg-dark-gradient-purple text-white hover:bg-dark-gradient-blue' : 'bg-light-accent-blue text-white hover:bg-light-accent-purple'}`}
            >
                Learn More
            </button>
            <button
                onClick={() => setActiveTab('Achievements')}
                className={`py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl
                  ${isDarkMode ? 'bg-dark-gradient-pink text-white hover:bg-dark-gradient-purple' : 'bg-light-accent-pink text-white hover:bg-light-accent-purple'}`}
            >
                View My Work
            </button>
        </div>


        {/* Track My Interests Portal - Centered */}
        <div className={`mt-16 w-full max-w-3xl pt-8 border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center animate-fade-in mx-auto`}>
            <h3 className={`text-2xl sm:text-3xl font-bold mb-6
              ${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-purple'}`}>Track My Interests</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {(portfolioData.trackedInterests || []).map((profile, index) => (
                    <div key={index} className={`relative group p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                      ${isDarkMode ? 'bg-dark-bg-start' : 'bg-white'} border border-transparent ${isDarkMode ? 'hover:border-dark-gradient-blue' : 'hover:border-light-accent-blue'}`}>
                        <a href={profile.link} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={profile.image} alt={profile.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-contain border-2 border-dark-gradient-purple" />
                            <span className={`${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'} font-semibold text-sm sm:text-base`}>{profile.name}</span>
                        </a>
                        {isLocalEditMode && (
                            <button
                                onClick={() => handleDeleteItem('trackedInterests', index)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                            >
                                <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {isLocalEditMode && (
                <button
                    onClick={handleAddProfile}
                    className={`mt-8 py-2 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
                      ${isDarkMode ? 'bg-dark-gradient-blue hover:bg-dark-gradient-purple' : 'bg-light-accent-blue hover:bg-light-accent-purple'}`}
                >
                    Add More Profiles
                </button>
            )}
        </div>
      </div>
    </div>
  );

  // About Page Content
  const AboutPage = () => (
    <div className={`w-full min-h-screen pt-20 p-4 sm:p-8 ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'} transition-colors duration-500`}>
      <div className={`max-w-7xl mx-auto rounded-lg shadow-xl p-6 sm:p-10 ${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} animate-fade-in`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-purple'}`}>About Me</h2>
        <div className="relative group">
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{portfolioData.about}</p>
          {isLocalEditMode && (
            <button
              onClick={() => handleEdit('about', portfolioData.about)}
              className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          )}
        </div>

        <div className={`mt-10 pt-8 border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-gradient-blue' : 'text-light-accent-blue'} mb-6`}>My Core Interests</h3>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-6`}>
            My professional journey is driven by a deep fascination with cutting-edge technologies and their application. I am particularly passionate about:
          </p>
          <ul className={`list-disc list-inside space-y-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            <li><strong>Cybersecurity:</strong> Safeguarding digital assets and exploring robust defense mechanisms against evolving threats.</li>
            <li><strong>AI Development:</strong> Crafting intelligent systems that can learn, adapt, and solve complex problems.</li>
            <li><strong>Cloud Computing:</strong> Architecting scalable, resilient, and efficient solutions leveraging cloud platforms.</li>
            <li><strong>Full Stack Development:</strong> Bridging the gap between beautiful user interfaces and powerful backend systems.</li>
            <li><strong>UI/UX Design:</strong> Creating intuitive and delightful user experiences that are both functional and aesthetically pleasing.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Achievements Page (Parent)
  const AchievementsPage = () => (
    <div className={`w-full min-h-screen pt-20 p-4 sm:p-8 ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'} transition-colors duration-500`}>
      <div className={`max-w-7xl mx-auto rounded-lg shadow-xl p-6 sm:p-10 ${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} animate-fade-in`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-purple'}`}>My Achievements & Expertise</h2>

        {/* Sub-navigation for Achievements */}
        <div className={`flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4 mb-8 p-2 rounded-lg ${isDarkMode ? 'bg-dark-bg-start' : 'bg-gray-200'}`}>
          {['Courses', 'Skills', 'Projects'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveAchievementsSubTab(tab)}
              className={`py-2 px-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105
                ${activeAchievementsSubTab === tab
                  ? `${isDarkMode ? 'bg-dark-gradient-blue text-white shadow-lg' : 'bg-light-accent-blue text-white shadow-lg'}`
                  : `${isDarkMode ? 'text-gray-200 hover:text-dark-gradient-pink' : 'text-gray-700 hover:text-light-accent-blue'}`
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conditional rendering for sub-tabs */}
        {activeAchievementsSubTab === 'Courses' && (
          <div className={`p-6 rounded-lg shadow-inner relative ${isDarkMode ? 'bg-dark-bg-start' : 'bg-yellow-50'} transition-colors duration-300`}>
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-accent-gold' : 'text-yellow-600'} mb-4`}>Courses & Certifications</h3>
            <div className="space-y-6">
              {(portfolioData.courses || []).map((course, index) => (
                <div key={index} className={`${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-gradient-pink' : 'text-text-light-dark'}`}>{course.name}</h4>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{course.certificate}</p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{course.description}</p>
                  {course.link && course.link !== '#' && (
                      <a href={course.link} target="_blank" rel="noopener noreferrer"
                         className={`mt-3 inline-flex items-center text-sm font-medium ${isDarkMode ? 'text-dark-gradient-blue hover:text-dark-gradient-pink' : 'text-light-accent-blue hover:text-light-accent-purple'}`}>
                          View Credential <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                      </a>
                  )}
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
                className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold text-white
                  ${isDarkMode ? 'bg-dark-gradient-blue hover:bg-dark-gradient-purple' : 'bg-light-accent-blue hover:bg-light-accent-purple'}`}
              >
                Add Course
              </button>
            )}
            {isLocalEditMode && (
              <button
                onClick={() => handleEdit('courses', portfolioData.courses)}
                className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
                  ${isDarkMode ? 'bg-accent-gold text-black hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
              >
                Edit Courses (JSON)
              </button>
            )}
          </div>
        )}

        {activeAchievementsSubTab === 'Skills' && (
          <div className={`p-6 rounded-lg shadow-inner transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg-start' : 'bg-green-50'}`}>
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-gradient-blue' : 'text-green-600'} mb-4`}>Technical Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(portfolioData.skills || {}).map(category => (
                <div key={category} className={`${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} p-5 rounded-lg shadow-md relative group transition-colors duration-300`}>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-gradient-pink' : 'text-text-light-dark'} mb-3 capitalize`}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </h4>
                  <div className="space-y-3">
                    {(portfolioData.skills[category] || []).map((skill, idx) => (
                      <div key={idx} className="relative group">
                        <SkillBar skill={skill} isDarkMode={isDarkMode} />
                        {isLocalEditMode && (
                          <button
                            onClick={() => handleDeleteItem(`skills.${category}`, idx)} // Pass category and index
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                          >
                            <i className="fas fa-trash-alt text-sm"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isLocalEditMode && (
                      <button
                          onClick={() => handleEdit(`skills.${category}`, portfolioData.skills[category])}
                          className={`mt-4 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
                            ${isDarkMode ? 'bg-accent-gold text-black hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                      >
                          Edit {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Skills
                      </button>
                  )}
                </div>
              ))}
            </div>
            {isLocalEditMode && (
              <button
                onClick={() => handleAddItem('skills')}
                className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
                  ${isDarkMode ? 'bg-dark-gradient-blue hover:bg-dark-gradient-purple' : 'bg-light-accent-blue hover:bg-light-accent-purple'}`}
              >
                Add New Skill
              </button>
            )}
          </div>
        )}

        {activeAchievementsSubTab === 'Projects' && (
          <div className={`p-6 rounded-lg shadow-inner relative ${isDarkMode ? 'bg-dark-bg-start' : 'bg-red-50'} transition-colors duration-300`}>
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-gradient-blue' : 'text-red-600'} mb-4`}>My Projects</h3>
            {/* Project Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {projectCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setCurrentProjectFilter(category)}
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                    ${currentProjectFilter === category
                      ? `${isDarkMode ? 'bg-dark-gradient-pink text-white' : 'bg-light-accent-blue text-white'}`
                      : `${isDarkMode ? 'bg-dark-bg-end text-text-dark-light hover:text-dark-gradient-pink' : 'bg-gray-200 text-gray-700 hover:text-light-accent-blue'}`
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredProjects || []).map((project, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedProject(project)}
                  className={`p-5 rounded-lg shadow-md relative group cursor-pointer transition-colors duration-300 transform hover:scale-105 hover:shadow-xl
                    ${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} border border-transparent ${isDarkMode ? 'hover:border-dark-gradient-blue' : 'hover:border-light-accent-blue'}`}
                >
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-gradient-pink' : 'text-text-light-dark'} mb-2`}>{project.name}</h4>
                  <p className={`text-sm italic mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category: {project.category || 'Uncategorized'}</p>
                  {project.images && project.images.length > 0 && (
                    <img src={project.images[0]} alt={`${project.name} thumbnail`} className="w-full h-32 object-cover rounded-md mb-3" />
                  )}
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>{project.description}</p>
                  <button
                      className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-dark-gradient-blue hover:text-dark-gradient-pink' : 'text-light-accent-blue hover:text-light-accent-purple'}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                  >
                      Learn More <i className="fas fa-arrow-right text-xs ml-1"></i>
                  </button>
                  {isLocalEditMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem('projects', portfolioData.projects.indexOf(project)); }}
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
                className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 mr-4 font-bold text-white
                  ${isDarkMode ? 'bg-dark-gradient-blue hover:bg-dark-gradient-purple' : 'bg-light-accent-blue hover:bg-light-accent-purple'}`}
              >
                Add Project
              </button>
            )}
            {isLocalEditMode && (
              <button
                onClick={() => handleEdit('projects', portfolioData.projects)}
                className={`mt-6 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
                  ${isDarkMode ? 'bg-accent-gold text-black hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
              >
                Edit Projects (JSON)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Contact Page Content
  const ContactPage = () => (
    <div className={`w-full min-h-screen pt-20 p-4 sm:p-8 ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'} transition-colors duration-500`}>
      <div className={`max-w-7xl mx-auto rounded-lg shadow-xl p-6 sm:p-10 ${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} animate-fade-in`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-purple'}`}>Contact Me</h2>
        <div className={`space-y-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
          <p className="flex items-center"><i className={`fas fa-envelope mr-3 text-xl ${isDarkMode ? 'text-dark-gradient-blue' : 'text-light-accent-blue'}`}></i> <strong>Email:</strong> {portfolioData.contact?.email}</p>
          <p className="flex items-center"><i className={`fas fa-phone mr-3 text-xl ${isDarkMode ? 'text-dark-gradient-pink' : 'text-light-accent-pink'}`}></i> <strong>Phone:</strong> {portfolioData.contact?.phone}</p>
          <p className="flex items-center"><i className={`fab fa-linkedin mr-3 text-xl ${isDarkMode ? 'text-dark-gradient-blue' : 'text-light-accent-blue'}`}></i> <strong>LinkedIn:</strong> <a href={portfolioData.contact?.linkedin} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-dark-gradient-blue hover:underline' : 'text-light-accent-blue hover:underline'}`}>{portfolioData.contact?.linkedin}</a></p>
          <p className="flex items-center"><i className={`fab fa-github mr-3 text-xl ${isDarkMode ? 'text-dark-gradient-pink' : 'text-text-light-dark'}`}></i> <strong>GitHub:</strong> <a href={portfolioData.contact?.github} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-dark-gradient-pink hover:underline' : 'text-text-light-dark hover:underline'}`}>{portfolioData.contact?.github}</a></p>
          {portfolioData.contact?.resumeLink && (
              <p className="flex items-center">
                  <i className={`fas fa-file-download mr-3 text-xl ${isDarkMode ? 'text-accent-gold' : 'text-purple-500'}`}></i>
                  <a href={portfolioData.contact.resumeLink} download="Gowry_Sankar_Resume.pdf"
                     className={`font-bold text-white py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105
                      ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue' : 'bg-light-accent-purple hover:bg-purple-700'}`}>
                      Download My Resume
                  </a>
              </p>
          )}
        </div>
        {isLocalEditMode && (
          <button
            onClick={() => handleEdit('contact', portfolioData.contact)}
            className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition duration-300 transform hover:scale-110"
          >
            <i className="fas fa-edit text-sm"></i> Edit Contact Info
          </button>
        )}

        {/* Contact Form */}
        <form onSubmit={handleContactSubmit} className="mt-10 pt-8 border-t-2 border-gray-700">
          <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-gradient-blue' : 'text-light-accent-blue'} mb-4`}>Send a Message</h3>
          <input
            type="text"
            placeholder="Your Name"
            className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2
              ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2
              ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Message"
            rows="5"
            className={`w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2
              ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className={`w-full py-3 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
              ${isDarkMode ? 'bg-dark-gradient-pink hover:bg-dark-gradient-purple' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={contactStatus === 'sending'}
          >
            {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
          {contactStatus === 'success' && <p className="text-green-500 mt-2 text-center">Message received (frontend demo only). A backend service is needed to send actual emails.</p>}
          {contactStatus === 'error' && <p className="text-red-500 mt-2 text-center">Failed to send message. Please try again.</p>}
        </form>
      </div>
    </div>
  );

  // Blog Page Content
  const BlogPage = () => (
    <div className={`w-full min-h-screen pt-20 p-4 sm:p-8 ${isDarkMode ? 'text-text-dark-light' : 'text-text-light-dark'} transition-colors duration-500`}>
      <div className={`max-w-7xl mx-auto rounded-lg shadow-xl p-6 sm:p-10 ${isDarkMode ? 'bg-dark-bg-end' : 'bg-white'} animate-fade-in`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-dark-gradient-blue' : 'text-orange-600'}`}>My Blog & Articles</h2>
        <div className="space-y-8">
          {(portfolioData.blogPosts || []).map((post, index) => (
            <div key={post.id || index} className={`${isDarkMode ? 'bg-dark-bg-start' : 'bg-gray-50'} p-6 rounded-lg shadow-md relative group transition-colors duration-300`}>
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-dark-gradient-pink' : 'text-text-light-dark'} mb-2`}>{post.title}</h3>
              <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                {new Date(post.date).toLocaleDateString()} &bull; {post.tags && post.tags.map((tag, idx) => (
                  <span key={idx} className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-dark-gradient-purple text-white' : 'bg-light-accent-blue text-white'} mr-1`}>{tag}</span>
                ))}
              </p>
              <p className={`text-md leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.content}</p>
              {isLocalEditMode && (
                <button
                  onClick={() => handleDeleteItem('blogPosts', index)}
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
            onClick={() => handleEdit('blogPosts', portfolioData.blogPosts)}
            className={`mt-8 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 font-bold text-white
              ${isDarkMode ? 'bg-accent-gold text-black hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
          >
            Edit Blog Posts (JSON)
          </button>
        )}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen font-inter flex flex-col items-center">
      {/* Global Message Display (for local storage info/errors) */}
      {infoMessage && (
        <div className={`fixed top-4 right-4 ${isDarkMode ? 'bg-dark-gradient-purple' : 'bg-light-accent-blue'} text-white p-3 rounded-md shadow-lg z-50 flex items-center space-x-2`}>
          <span>{infoMessage}</span>
          <button onClick={handleCloseInfoModal} className="ml-2 text-white font-bold">&times;</button>
        </div>
      )}

      {/* Header (Navbar) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        isLocalEditMode={isLocalEditMode}
        handleToggleLocalEditMode={handleToggleLocalEditMode}
        setShowNotificationModal={setShowNotificationModal}
      />

      {/* Main Content Area - dynamically rendered based on activeTab */}
      <main className="flex-grow w-full">
        {activeTab === 'Home' && <HomePage />}
        {activeTab === 'About' && <AboutPage />}
        {activeTab === 'Achievements' && <AchievementsPage />}
        {activeTab === 'Contact' && <ContactPage />}
        {activeTab === 'Blog' && <BlogPage />}
      </main>

      {/* Footer */}
      <footer className={`w-full mt-12 py-6 text-center text-sm transition-colors duration-500
        ${isDarkMode ? 'bg-dark-bg-end text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <p>© {new Date().getFullYear()} Kosuri Gowry Sankar. All rights reserved.</p>
        <p>Designed with ❤️ and built with React, Tailwind CSS, and Local Storage.</p>
      </footer>


      {/* Modals */}
      {/* Info Modal (for Local Edit Mode status) */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
          <div className={`${isDarkMode ? 'bg-dark-bg-end text-text-dark-light' : 'bg-white text-text-light-dark'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Local Edit Mode Status</h2>
            <p className="text-lg text-center mb-6">{infoMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseInfoModal}
                className={`py-2 px-6 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue text-white' : 'bg-gray-300 hover:bg-gray-400 text-text-light-dark'} font-bold`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
          <div className={`${isDarkMode ? 'bg-dark-bg-end text-text-dark-light' : 'bg-white text-text-light-dark'} p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Notifications</h2>
            <div className="mb-6">
              <input
                ref={notificationInputRef}
                type="text"
                placeholder="Add new notification"
                className={`w-full p-3 mb-2 border rounded-md focus:outline-none focus:ring-2
                  ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddNotification();
                }}
              />
              <button
                onClick={handleAddNotification}
                className={`w-full py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-pink hover:bg-dark-gradient-purple' : 'bg-green-600 hover:bg-green-700'} text-white font-bold`}
              >
                Add Notification
              </button>
            </div>
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li key={notification.id} className={`flex justify-between items-center p-3 rounded-md shadow-sm ${isDarkMode ? 'bg-dark-bg-start' : 'bg-gray-100'}`}>
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
                onClick={() => { setShowNotificationModal(false); setInfoMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue text-white' : 'bg-gray-300 hover:bg-gray-400 text-text-light-dark'} font-bold`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (for about, contact, skills, achievements, experience, projects, courses, trackedInterests, blogPosts) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
          <div className={`${isDarkMode ? 'bg-dark-bg-end text-text-dark-light' : 'bg-white text-text-light-dark'} p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Edit {editingField.replace('skills.', '').replace(/([A-Z])/g, ' $1').trim().replace(/^(.)/, (match) => match.toUpperCase())}</h2>
            {infoMessage && <p className="text-red-600 text-center mb-4">{infoMessage}</p>}
            {['about', 'achievements'].includes(editingField) && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-32 focus:outline-none focus:ring-2
                  ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editingField === 'about' ? "About Me description" : "Enter each achievement on a new line"}
              ></textarea>
            )}
            {editingField === 'contact' && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-40 font-mono text-sm focus:outline-none focus:ring-2
                  ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter contact info as JSON: {"email": "...", "phone": "...", "linkedin": "...", "github": "...", "resumeLink": "/resume.pdf"}'
              ></textarea>
            )}
            {editingField.startsWith('skills.') && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-40 font-mono text-sm focus:outline-none focus:ring-2
                  ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='Enter skills as JSON array of objects: [{"name": "Skill Name", "level": 90}]'
              ></textarea>
            )}
            {['experience', 'projects', 'courses', 'trackedInterests', 'blogPosts'].includes(editingField) && (
              <textarea
                className={`w-full p-3 mb-4 border rounded-md h-60 font-mono text-sm focus:outline-none focus:ring-2
                  ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter data as a JSON array of objects.
                For Projects: [{"name": "Name", "description": "Desc", "category": "Category", "images": ["url1"], "techUsed": ["Tech1"], "challenges": "Challenges", "liveLink": "url", "githubLink": "url"}]
                For Courses: [{"name": "Course Name", "certificate": "Cert Details", "description": "Desc", "link": "link"}]
                For Tracked Interests: [{"name": "Platform", "image": "URL", "link": "URL"}]
                For Blog Posts: [{"id": "id", "title": "Title", "date": "YYYY-MM-DD", "tags": ["Tag1"], "content": "Content..."}]
                `}
              ></textarea>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowEditModal(false); setInfoMessage(''); }}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue text-white' : 'bg-gray-300 hover:bg-gray-400 text-text-light-dark'} font-bold`}
              >
                Close
              </button>
              <button
                onClick={handleSaveEdit}
                className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-pink hover:bg-dark-gradient-purple text-white' : 'bg-light-accent-blue hover:bg-light-accent-purple text-white'} font-bold`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal (for projects/courses/skills) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
          <div className={`${isDarkMode ? 'bg-dark-bg-end text-text-dark-light' : 'bg-white text-text-light-dark'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-6">Add New {editingField === 'skills' ? 'Skill' : editingField.slice(0, -1)}</h2>
            {infoMessage && <p className="text-red-600 text-center mb-4">{infoMessage}</p>}
            {editingField === 'projects' && (
              <>
                <input type="text" placeholder="Project Name" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
                <textarea placeholder="Project Description" className={`w-full p-3 mb-4 border rounded-md h-24 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} required ></textarea>
                <input type="text" placeholder="Image URLs (comma-separated)" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectImages} onChange={(e) => setNewProjectImages(e.target.value)} />
                <input type="text" placeholder="Technologies Used (comma-separated)" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectTechUsed} onChange={(e) => setNewProjectTechUsed(e.target.value)} />
                <textarea placeholder="Challenges Faced" className={`w-full p-3 mb-4 border rounded-md h-20 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectChallenges} onChange={(e) => setNewProjectChallenges(e.target.value)}></textarea>
                <input type="url" placeholder="Live Demo Link" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectLiveLink} onChange={(e) => setNewProjectLiveLink(e.target.value)} />
                <input type="url" placeholder="GitHub Link" className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newProjectGithubLink} onChange={(e) => setNewProjectGithubLink(e.target.value)} />

                  <select
                     className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                     value={newProjectCategory}
                     onChange={(e) => setNewProjectCategory(e.target.value)}
                     required
                  >
                     <option value="">Select Category</option>
                     {projectCategories.filter(cat => cat !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </>
             )}
             {editingField === 'courses' && (
               <>
                 <input type="text" placeholder="Course Name" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} required />
                 <input type="text" placeholder="Certificate Details" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newCourseCert} onChange={(e) => setNewCourseCert(e.target.value)} required />
                 <textarea placeholder="Course Description" className={`w-full p-3 mb-4 border rounded-md h-20 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)}></textarea>
                 <input type="url" placeholder="Course Link (optional)" className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newCourseLink} onChange={(e) => setNewCourseLink(e.target.value)} />
               </>
             )}
             {editingField === 'skills' && (
               <>
                 <input type="text" placeholder="Skill Name" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} required />
                 <input type="number" placeholder="Proficiency Level (0-100)" min="0" max="100" className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`} value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)} required />
                 <select
                     className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
                     value={newSkillCategory}
                     onChange={(e) => setNewSkillCategory(e.target.value)}
                     required
                  >
                     <option value="">Select Category</option>
                     {Object.keys(defaultPortfolioData.skills).map(cat => (
                         <option key={cat} value={cat}>{cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                     ))}
                  </select>
               </>
             )}
             <div className="flex justify-end space-x-4">
               <button
                 onClick={() => { setShowAddModal(false); setInfoMessage(''); }}
                 className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue text-white' : 'bg-gray-300 hover:bg-gray-400 text-text-light-dark'} font-bold`}
               >
                 Cancel
               </button>
               <button
                 onClick={handleSaveNewItem}
                 className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-pink hover:bg-dark-gradient-purple text-white' : 'bg-light-accent-blue hover:bg-light-accent-purple text-white'} font-bold`}
               >
                 Add Item
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Add Profile Modal */}
       {showAddProfileModal && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]">
           <div className={`${isDarkMode ? 'bg-dark-bg-end text-text-dark-light' : 'bg-white text-text-light-dark'} p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
             <h2 className="text-2xl font-bold mb-6">Add New Tracked Profile</h2>
             {infoMessage && <p className="text-red-600 text-center mb-4">{infoMessage}</p>}
             <input
               type="text"
               placeholder="Platform Name (e.g., Medium, Stack Overflow)"
               className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
               value={newProfileName}
               onChange={(e) => setNewProfileName(e.target.value)}
               required
             />
             <input
               type="url"
               placeholder="Image URL (e.g., https://placehold.co/60x60?text=Icon)"
               className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
               value={newProfileImage}
               onChange={(e) => setNewProfileImage(e.target.value)}
               required
             />
             <input
               type="url"
               placeholder="Profile Link (e.g., https://stackoverflow.com/users/your_id)"
               className={`w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-dark-bg-start border-dark-gradient-purple text-text-dark-light focus:ring-dark-gradient-blue' : 'bg-white border-gray-300 text-text-light-dark focus:ring-light-accent-blue'}`}
               value={newProfileLink}
               onChange={(e) => setNewProfileLink(e.target.value)}
               required
             />
             <div className="flex justify-end space-x-4">
               <button
                 onClick={() => { setShowAddProfileModal(false); setInfoMessage(''); }}
                 className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-purple hover:bg-dark-gradient-blue text-white' : 'bg-gray-300 hover:bg-gray-400 text-text-light-dark'} font-bold`}
               >
                 Cancel
               </button>
               <button
                 onClick={handleSaveNewProfile}
                 className={`py-2 px-4 rounded-md transition duration-300 ${isDarkMode ? 'bg-dark-gradient-pink hover:bg-dark-gradient-purple text-white' : 'bg-light-accent-blue hover:bg-light-accent-purple text-white'} font-bold`}
               >
                 Add Profile
               </button>
             </div>
           </div>
         </div>
       )}
       {/* Project Detail Modal */}
       {selectedProject && (
         <ProjectDetailModal
           project={selectedProject}
           isDarkMode={isDarkMode}
           onClose={() => setSelectedProject(null)}
         />
       )}
     </div>
   );
 }

 export default App;
 