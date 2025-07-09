import React from 'react';
import FishCard from './FishCard';

interface FishCardGridProps {
  fishData: Array<{
    id: number;
    name: string;
    avgLength: number;
    stdDeviation: number;
    isCollected: boolean;
    highestScore: number;
    highestLength: number;
    collectDate: string | null;
  }>;
}

const FishCardGrid: React.FC<FishCardGridProps> = ({ fishData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {fishData.map((fish) => (
        <FishCard key={fish.id} fish={fish} />
      ))}
    </div>
  );
};

export default FishCardGrid; 