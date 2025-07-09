import React, { useState, useRef, useEffect } from 'react';
import { FISH_TYPES, FishType, getRarityLevel, RARITY_COLORS } from '../../types/FishType';

interface FishSelectorProps {
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  showAllOption?: boolean; // '전체' 옵션 표시 여부
}

const FishSelector: React.FC<FishSelectorProps> = ({
  value,
  onChange,
  placeholder = "물고기를 선택하세요",
  disabled = false,
  className = "",
  required = false,
  showAllOption = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색어에 따른 필터링
  const filteredFish = FISH_TYPES.filter(fish =>
    fish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택된 물고기 정보
  const selectedFish = value ? FISH_TYPES.find(fish => fish.id === value) : null;

  const handleSelect = (fish: FishType | null) => {
    onChange(fish ? fish.id : '');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const rarityLevel = selectedFish ? getRarityLevel(selectedFish.rarityScore) : 'common';
  const rarityColor = RARITY_COLORS[rarityLevel];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 선택된 물고기 표시 */}
      <div
        onClick={handleToggle}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${required && !value ? 'border-red-500' : ''}
        `}
      >
        {selectedFish ? (
          <div className="flex items-center space-x-3">
            {/* 물고기 아이콘 */}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <img
                src={selectedFish.iconPath}
                alt={selectedFish.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '🐟';
                }}
              />
            </div>
            
            {/* 물고기 정보 */}
            <div className="flex-1 text-left">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{selectedFish.name}</span>
                <span 
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: rarityColor }}
                >
                  {rarityLevel}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                평균 {selectedFish.avgLength}cm
              </div>
            </div>
            
            {/* 화살표 아이콘 */}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{placeholder}</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* 검색 입력 */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="물고기 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* 물고기 목록 */}
          <div className="max-h-48 overflow-y-auto">
            {/* '전체' 옵션 */}
            {showAllOption && (
              <div
                onClick={() => handleSelect(null)}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🌊</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">전체</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      all
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    모든 물고기
                  </div>
                </div>
              </div>
            )}
            
            {filteredFish.length > 0 ? (
              filteredFish.map((fish) => {
                const fishRarityLevel = getRarityLevel(fish.rarityScore);
                const fishRarityColor = RARITY_COLORS[fishRarityLevel];
                
                return (
                  <div
                    key={fish.id}
                    onClick={() => handleSelect(fish)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {/* 물고기 아이콘 */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <img
                        src={fish.iconPath}
                        alt={fish.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '🐟';
                        }}
                      />
                    </div>
                    
                    {/* 물고기 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{fish.name}</span>
                        <span 
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: fishRarityColor }}
                        >
                          {fishRarityLevel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        평균 {fish.avgLength}cm • {fish.habitat}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FishSelector; 