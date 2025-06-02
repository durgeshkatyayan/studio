import { InternalExperience } from '@/store/useStore';
import React, { useState } from 'react';
// import { InternalExperience } from '../store/useStore';

interface ExperienceCardProps {
  experience: InternalExperience;
  isSelected: boolean;
  onSelect: (experience: InternalExperience) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ 
  experience, 
  isSelected, 
  onSelect 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={`
        group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl 
        transition-all duration-300 transform hover:-translate-y-2
        ${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''}
      `}
      onClick={() => onSelect(experience)}
    >
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏨</div>
              <p className="text-sm">{experience.title}</p>
            </div>
          </div>
        ) : (
          <img
            src={experience.image}
            alt={experience.title}
            className={`
              w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {experience.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {experience.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            Internal Experience
          </span>
          <div className="flex items-center text-blue-600">
            <span className="text-sm font-medium">Explore</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;