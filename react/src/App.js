import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="app" data-easytag="id001-react/src/App.js">
        <a href="#main-content" className="skip-link" data-easytag="id002-react/src/App.js">
          Пропустить к основному содержимому
        </a>

        <header className="app-header" role="banner" data-easytag="id003-react/src/App.js">
          <nav className="app-nav" aria-label="Основная навигация" data-easytag="id004-react/src/App.js">
            <div className="brand" aria-label="Easyappz" data-easytag="id005-react/src/App.js">Easyappz</div>
          </nav>
        </header>

        <main id="main-content" className="app-main" tabIndex="-1" aria-live="polite" data-easytag="id006-react/src/App.js">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>

        <footer className="app-footer" role="contentinfo" data-easytag="id007-react/src/App.js">
          <p className="footer-text" data-easytag="id008-react/src/App.js">© {new Date().getFullYear()} Easyappz</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
