import { useEffect, useState } from 'react';

const Toast = ({ message, duration = 1000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Allow animation to complete before removing
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className={`fixed top-4 right-4 flex items-center p-4 mb-4 max-w-xs text-white bg-indigo-600 rounded-lg shadow-lg transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <div className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
    </div>
  );
};

export default Toast; 