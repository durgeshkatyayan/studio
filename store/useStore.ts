import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InternalExperience {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface ExternalExperience {
  id: number;
  name: string;
  distance: string;
  rating: number;
}

export interface MapInteraction {
  roomId: string;
  roomName: string;
  details: string;
  position: { x: number; y: number; z: number };
}

interface StoreState {
  // Experiences data
  internalExperiences: InternalExperience[];
  externalExperiences: ExternalExperience[];
  
  // Selected experiences
  selectedInternalExperience: InternalExperience | null;
  selectedExternalExperience: ExternalExperience | null;
  
  // 3D Map interactions
  selectedRoom: MapInteraction | null;
  hoveredRoom: string | null;
  
  // Filters
  distanceFilter: string;
  ratingFilter: number;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  setExperiences: (internal: InternalExperience[], external: ExternalExperience[]) => void;
  setSelectedInternalExperience: (experience: InternalExperience | null) => void;
  setSelectedExternalExperience: (experience: ExternalExperience | null) => void;
  setSelectedRoom: (room: MapInteraction | null) => void;
  setHoveredRoom: (roomId: string | null) => void;
  setDistanceFilter: (filter: string) => void;
  setRatingFilter: (rating: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed getters
  getFilteredExternalExperiences: () => ExternalExperience[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      internalExperiences: [],
      externalExperiences: [],
      selectedInternalExperience: null,
      selectedExternalExperience: null,
      selectedRoom: null,
      hoveredRoom: null,
      distanceFilter: 'all',
      ratingFilter: 0,
      loading: false,
      error: null,
      
      // Actions
      setExperiences: (internal, external) => set({ 
        internalExperiences: internal, 
        externalExperiences: external 
      }),
      
      setSelectedInternalExperience: (experience) => set({ 
        selectedInternalExperience: experience 
      }),
      
      setSelectedExternalExperience: (experience) => set({ 
        selectedExternalExperience: experience 
      }),
      
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      
      setHoveredRoom: (roomId) => set({ hoveredRoom: roomId }),
      
      setDistanceFilter: (filter) => set({ distanceFilter: filter }),
      
      setRatingFilter: (rating) => set({ ratingFilter: rating }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Computed getters
      getFilteredExternalExperiences: () => {
        const { externalExperiences, distanceFilter, ratingFilter } = get();
        
        return externalExperiences.filter(exp => {
          // Distance filter
          if (distanceFilter !== 'all') {
            const distance = parseFloat(exp.distance);
            if (distanceFilter === 'near' && distance > 0.5) return false;
            if (distanceFilter === 'medium' && (distance <= 0.5 || distance > 1.0)) return false;
            if (distanceFilter === 'far' && distance <= 1.0) return false;
          }
          
          // Rating filter
          if (ratingFilter > 0 && exp.rating < ratingFilter) return false;
          
          return true;
        });
      }
    }),
    {
      name: 'travel-studio-storage',
      partialize: (state) => ({ 
        selectedInternalExperience: state.selectedInternalExperience,
        selectedExternalExperience: state.selectedExternalExperience,
        distanceFilter: state.distanceFilter,
        ratingFilter: state.ratingFilter
      }),
    }
  )
);