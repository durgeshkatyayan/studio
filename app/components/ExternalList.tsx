import React from 'react';
import { ExternalExperience, useStore } from '@/store/useStore';

const ExternalExperienceList: React.FC = () => {
  const {
    getFilteredExternalExperiences,
    selectedExternalExperience,
    setSelectedExternalExperience,
    distanceFilter,
    ratingFilter,
    setDistanceFilter,
    setRatingFilter,
  } = useStore();

  const filteredExperiences = getFilteredExternalExperiences();

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="range"
          min="0"
          max="100"
          value={distanceFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistanceFilter((e.target.value))}

        />
        <span>Distance: {distanceFilter} km</span>

        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value))}
        />
        <span>Rating: {ratingFilter.toFixed(1)}</span>
      </div>

      <ul className="space-y-4">
        {filteredExperiences.map((experience: ExternalExperience) => (
          <li
            key={experience.id}
            className={`p-4 border rounded cursor-pointer ${
              selectedExternalExperience?.id === experience.id ? 'bg-blue-100' : ''
            }`}
            onClick={() => setSelectedExternalExperience(experience)}
          >
            <h3 className="text-lg font-semibold">{experience.name}</h3>
            <div className="flex items-center">{renderStars(experience.rating)}</div>
            <p className="text-sm text-gray-600">Distance: {experience.distance} km</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExternalExperienceList;
