import React from 'react';

interface FishCardListProps {
  fishData: Array<{
    id: number;
    name: string;
    avgLength: number;
    stdDeviation: number;
  }>;
}

const FishCardList: React.FC<FishCardListProps> = ({ fishData }) => {
  return (
    <div className="space-y-4">
      {fishData.map((fish) => (
        <div key={fish.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🐟</div>
              <div>
                <h3 className="font-semibold text-lg text-blue-600">{fish.name}</h3>
                <p className="text-gray-600">
                  평균 길이: {fish.avgLength}cm | 표준편차: {fish.stdDeviation}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                수정
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FishCardList; 