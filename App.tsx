import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Holdings } from './pages/Holdings';
import { Checklist } from './pages/Checklist';
import { Risk } from './pages/Risk';
import { Journal } from './pages/Journal';

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
