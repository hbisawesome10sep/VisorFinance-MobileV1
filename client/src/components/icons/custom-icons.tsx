import React from 'react';

// Custom Rupee Icon - Clean and modern
export const RupeeIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M7 5h10v2H7zm0 4h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2z"/>
    <path d="M7 9v2h6c.55 0 1 .45 1 1s-.45 1-1 1H7v7l5-5v2l-5 5h2l5-5v5h2V9H7z"/>
  </svg>
);

// Dashboard Icon - Grid layout with rounded corners
export const DashboardIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M3 5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5z"/>
    <path d="M13 5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V5z"/>
    <path d="M3 15c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4z"/>
    <path d="M13 11c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-8z"/>
  </svg>
);

// Transaction Icon - Credit card with chip
export const TransactionIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6zm0 4h16v8H4v-8z"/>
    <path d="M6 14h3v2H6zm5 0h7v1h-7z"/>
  </svg>
);

// Insights Icon - Brain with circuit patterns
export const InsightsIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
    <circle cx="9" cy="8" r="1"/>
    <circle cx="15" cy="8" r="1"/>
    <circle cx="12" cy="11" r="1"/>
  </svg>
);

// Investment Icon - Trending chart with dollar
export const InvestmentIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="17" cy="7" r="1.5"/>
  </svg>
);

// Settings Icon - Gear
export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

// Income Icon - Arrow up with coins
export const IncomeIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 4l-6 6h4v8h4v-8h4z"/>
    <circle cx="6" cy="19" r="2"/>
    <circle cx="18" cy="19" r="2"/>
    <circle cx="12" cy="19" r="2"/>
  </svg>
);

// Expense Icon - Arrow down with money
export const ExpenseIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 20l6-6h-4V6h-4v8H6z"/>
    <circle cx="6" cy="4" r="2"/>
    <circle cx="18" cy="4" r="2"/>
    <circle cx="12" cy="4" r="2"/>
  </svg>
);

// Goal Icon - Target with center
export const GoalIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" fillOpacity="0.2"/>
    <circle cx="12" cy="12" r="6" fillOpacity="0.4"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 1v2M12 21v2M1 12h2M21 12h2"/>
  </svg>
);

// Add Icon - Plus in circle
export const AddIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);