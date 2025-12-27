import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

// =================================================================================================
// Application Entry Point
// -------------------------------------------------------------------------------------------------
// Bootstraps the React application:
// - Mounts to the root DOM element.
// - Wraps with React.StrictMode for development checks.
// - Wraps with HashRouter for local file support.
// =================================================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
      {/* ======================= Main App Component ======================= */}
      <App />
    </HashRouter>
  </React.StrictMode>
);

