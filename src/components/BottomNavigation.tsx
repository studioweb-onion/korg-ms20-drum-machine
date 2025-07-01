import React from 'react';
import { Music, Disc3, Volume2 } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: 'drums' | 'synth' | 'mixer';
  onPageChange: (page: 'drums' | 'synth' | 'mixer') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'drums' as const, label: 'Drum Machine', icon: Music },
    { id: 'synth' as const, label: 'MS20 Synth', icon: Disc3 },
    { id: 'mixer' as const, label: 'Mixer', icon: Volume2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-purple-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 ${
                  isActive
                    ? 'text-purple-400 bg-purple-500/20'
                    : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-t-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;