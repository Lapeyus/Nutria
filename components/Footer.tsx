import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Nutria - Nutrición IA. Impulsado por Gemini.</p>
      </div>
    </footer>
  );
};

export default Footer;