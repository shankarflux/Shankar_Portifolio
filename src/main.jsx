import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // This imports your main App component
import './index.css';         // This imports your global CSS (where Tailwind directives are)

// Renders your React application into the 'root' element in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
