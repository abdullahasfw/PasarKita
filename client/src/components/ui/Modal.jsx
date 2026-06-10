import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div 
          className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${maxWidth} animate-in fade-in zoom-in-95 duration-200`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
