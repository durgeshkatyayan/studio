"use client"
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
// import { useStore } from '../store/useStore';
import ExperienceCard from '../components/ExperienceCard';
// import ExternalExperienceList from '../components/ExternalExperienceList';
import RoomTooltip from '../components/RoomTooltip';
// import LoadingSpinner from '../components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import ExternalExperienceList from '../components/ExternalList';

// Dynamic import for 3D component to avoid SSR issues
const HotelMap3D = dynamic(() => import('../components/HotelMap3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      {/* <LoadingSpinner text="Loading 3D Hotel Map..." /> */}
    </div>
  )
});

export default function ExplorePage() {
  const {
    internalExperiences,
    loading,
    error,
    selectedInternalExperience,
    setSelectedInternalExperience,
    setExperiences,
    setLoading,
    setError
  } = useStore();

  const [apiCache, setApiCache] = useState<any>(null);

  // Fetch experiences data
  useEffect(() => {
    const fetchExperiences = async () => {
      // Check cache first
      if (apiCache) {
        setExperiences(apiCache.internalExperiences, apiCache.externalExperiences);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://192.168.31.176:3001/api/experiences');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch experiences');
        }

        const { internalExperiences, externalExperiences } = result.data;
        
        // Cache the result
        setApiCache(result.data);
        setExperiences(internalExperiences, externalExperiences);
        
      } catch (err) {
        console.error('Failed to fetch experiences:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [setExperiences, setLoading, setError, apiCache]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            {/* <LoadingSpinner size="lg" text="Loading Travel Studio Experience..." /> */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Experiences</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Explore Hotel Experiences - Travel Studio</title>
        <meta name="description" content="Discover amazing internal and external experiences at our hotel with interactive 3D map" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🏨 Travel Studio
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover exceptional experiences at our hotel and explore nearby attractions with our interactive 3D map
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* 3D Hotel Map Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Interactive Hotel Map
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our hotel in 3D! Click on different rooms to learn more about our internal experiences.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <HotelMap3D className="w-full h-96" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Internal Experiences */}
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Internal Experiences
                </h2>
                <p className="text-gray-600">
                  Discover world-class amenities and services within our hotel
                </p>
              </div>

              {internalExperiences.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🏨</div>
                  <p>No internal experiences available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {internalExperiences.map((experience) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      isSelected={selectedInternalExperience?.id === experience.id}
                      onSelect={(exp) =>
                        setSelectedInternalExperience(
                          selectedInternalExperience?.id === exp.id ? null : exp
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {/* External Experiences */}
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  External Experiences
                </h2>
                <p className="text-gray-600">
                  Explore nearby dining and attractions around our hotel
                </p>
              </div>

              <ExternalExperienceList />
            </section>
          </div>

          {/* Selected Experience Summary */}
          {(selectedInternalExperience || useStore.getState().selectedExternalExperience) && (
            <section className="mt-12">
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Your Selected Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedInternalExperience && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-blue-800 mb-2">Internal Experience</h4>
                      <p className="text-gray-700">{selectedInternalExperience.title}</p>
                    </div>
                  )}
                  {useStore.getState().selectedExternalExperience && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-blue-800 mb-2">External Experience</h4>
                      <p className="text-gray-700">{useStore.getState().selectedExternalExperience?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Travel Studio</h3>
              <p className="text-gray-400 mb-4">
                Creating extraordinary travel experiences with cutting-edge technology
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <span>Built with Next.js, Three.js & Zustand</span>
                <span>•</span>
                <span>Deployed on Vercel</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Room Tooltip Modal */}
        <RoomTooltip />
      </div>
    </>
  );
}