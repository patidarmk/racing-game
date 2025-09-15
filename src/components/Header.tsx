import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/8 backdrop-blur-xl shadow-lg border-b border-white/6">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-applaa-blue to-applaa-purple rounded-lg flex items-center justify-center shadow">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-applaa-blue to-applaa-purple">Applaa Racer</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-white font-semibold' : 'text-slate-200 hover:text-white'}>Home</NavLink>
            <NavLink to="/levels" className={({ isActive }) => isActive ? 'text-white font-semibold' : 'text-slate-200 hover:text-white'}>Levels</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-white font-semibold' : 'text-slate-200 hover:text-white'}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-white font-semibold' : 'text-slate-200 hover:text-white'}>Contact</NavLink>
          </nav>

          <div className="md:hidden text-slate-200">
            <Menu />
          </div>
        </div>
      </div>
    </header>
  );
}