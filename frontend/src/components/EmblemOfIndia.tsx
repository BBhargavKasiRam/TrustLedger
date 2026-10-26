import React from 'react';

interface EmblemOfIndiaProps {
  className?: string;
  size?: number;
  color?: string;
}

export const EmblemOfIndia: React.FC<EmblemOfIndiaProps> = ({
  className = '',
  size = 46,
  color = '#1E3A8A'
}) => {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
      role="img"
    >
      {/* Central Lion Head & Mane */}
      <path
        d="M50 8C43 8 38 13 38 20C38 25 41 29 44 32C41 35 39 40 40 45C41 49 44 52 48 53V57H52V53C56 52 59 49 60 45C61 40 59 35 56 32C59 29 62 25 62 20C62 13 57 8 50 8Z"
        fill={color}
      />
      <circle cx="47" cy="19" r="1.5" fill="#FFFFFF" />
      <circle cx="53" cy="19" r="1.5" fill="#FFFFFF" />
      <path d="M48 23H52L50 25L48 23Z" fill="#FFFFFF" />

      {/* Left Lion Profile */}
      <path
        d="M36 17C31 18 26 23 26 30C26 36 29 40 33 43C31 46 31 51 33 55C35 58 39 59 43 58L41 52C38 52 36 49 36 46C37 44 38 43 38 40C35 38 34 35 34 31C34 26 37 22 41 20L36 17Z"
        fill={color}
      />

      {/* Right Lion Profile */}
      <path
        d="M64 17C69 18 74 23 74 30C74 36 71 40 67 43C69 46 69 51 67 55C65 58 61 59 57 58L59 52C62 52 64 49 64 46C63 44 62 43 62 40C65 38 66 35 66 31C66 26 63 22 59 20L64 17Z"
        fill={color}
      />

      {/* Lion Bodies & Paws Column */}
      <path
        d="M38 58H62V67H38V58Z"
        fill={color}
      />
      <rect x="42" y="60" width="16" height="5" rx="1" fill="#FFFFFF" opacity="0.3" />

      {/* Circular Abacus Base */}
      <rect x="20" y="68" width="60" height="15" rx="3" fill={color} />

      {/* Central Ashoka Chakra on Abacus */}
      <circle cx="50" cy="75.5" r="6" stroke="#FFFFFF" strokeWidth="1.2" fill={color} />
      <circle cx="50" cy="75.5" r="1.5" fill="#FFFFFF" />
      {/* 24 Spoke Representation */}
      <line x1="50" y1="69.5" x2="50" y2="81.5" stroke="#FFFFFF" strokeWidth="0.8" />
      <line x1="44" y1="75.5" x2="56" y2="75.5" stroke="#FFFFFF" strokeWidth="0.8" />
      <line x1="45.8" y1="71.3" x2="54.2" y2="79.7" stroke="#FFFFFF" strokeWidth="0.8" />
      <line x1="45.8" y1="79.7" x2="54.2" y2="71.3" stroke="#FFFFFF" strokeWidth="0.8" />

      {/* Galloping Horse (Left of Chakra) */}
      <path
        d="M28 73C26 73 24 74 23 76L27 78L29 76C30 75 30 73 28 73Z"
        fill="#FFFFFF"
        opacity="0.85"
      />

      {/* Bull (Right of Chakra) */}
      <path
        d="M72 73C74 73 76 74 77 76L73 78L71 76C70 75 70 73 72 73Z"
        fill="#FFFFFF"
        opacity="0.85"
      />

      {/* Lower Inverted Lotus Base Plate */}
      <path
        d="M16 84H84L81 92H19L16 84Z"
        fill={color}
      />
      <rect x="18" y="93" width="64" height="2" rx="1" fill={color} opacity="0.6" />

      {/* Satyameva Jayate (सत्यमेव जयते) in official Devanagari lettering style */}
      <text
        x="50"
        y="108"
        textAnchor="middle"
        fill={color}
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
      <text
        x="50"
        y="119"
        textAnchor="middle"
        fill="#475569"
        fontSize="5.5"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1.2"
      >
        SATYAMEVA JAYATE
      </text>
    </svg>
  );
};
