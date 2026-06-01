// Shared Tailwind class strings for node styling
export const nodeBase = 'rounded-lg shadow-lg transition-shadow duration-200';
export const nodeSelected = 'ring-2 ring-blue-400 shadow-blue-400/20';
export const handleStyle = { width: 8, height: 8, background: '#6366f1' };
export const STICKY_COLORS = {
  yellow: { bg: 'bg-sticky-yellow', text: 'text-gray-800' },
  pink: { bg: 'bg-sticky-pink', text: 'text-gray-800' },
  blue: { bg: 'bg-sticky-blue', text: 'text-gray-800' },
  green: { bg: 'bg-sticky-green', text: 'text-gray-800' },
  purple: { bg: 'bg-sticky-purple', text: 'text-gray-800' },
  orange: { bg: 'bg-sticky-orange', text: 'text-gray-800' },
} as const;
