import { getInitials } from '../../utils/helpers';

const COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500',
  'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500',
];

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
