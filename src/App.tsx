import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import Levels from './pages/Levels';
import Contact from './pages/Contact';
import Header from './components/Header';
import MadeWithApplaa from './components/made-with-applaa';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* No 404: redirect to home */}
          <Route path="*" element={<Index />} />
        </Routes>
      </main>

      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-slate-300">
          <div className="mb-2">Made with passion.</div>
          <MadeWithApplaa />
        </div>
      </footer>
    </div>
  );
}