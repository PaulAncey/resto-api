import React from 'react';

const Loading = ({ 
  size = 'md', 
  color = 'green', 
  text = 'Chargement...', 
  fullScreen = false,
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} ${sizeClasses[size]}`}
        style={{ borderTopColor: 'currentColor' }}
      />
      {showText && text && (
        <p className={`mt-4 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Composant pour les pages en cours de chargement
export const PageLoading = ({ text = 'Chargement de la page...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Loading size="lg" text={text} />
  </div>
);

// Composant pour les boutons en cours de chargement
export const ButtonLoading = ({ text = 'Chargement...', size = 'sm' }) => (
  <div className="flex items-center justify-center">
    <Loading size={size} showText={false} />
    <span className="ml-2">{text}</span>
  </div>
);

// Composant pour les sections en cours de chargement
export const SectionLoading = ({ text = 'Chargement...', className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <Loading size="md" text={text} />
  </div>
);

export default Loading;