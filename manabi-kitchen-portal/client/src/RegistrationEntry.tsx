import React from 'react';
import ReactDOM from 'react-dom/client';
import Registration from './pages/Registration';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="top-center" />
    <Registration />
  </React.StrictMode>,
);
