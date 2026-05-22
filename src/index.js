import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode remount can consume Firebase redirect twice in dev — breaks editor OAuth.
root.render(<App />);

reportWebVitals();
