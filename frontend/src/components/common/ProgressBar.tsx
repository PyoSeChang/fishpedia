import React, { useState, useEffect } from 'react';

interface LevelUpdateResult {
  prevLevel: number;        // Level before increment
  prevProgress: number;     // Progress before increment (0~100, %)
  newLevel: number;         // Level after increment
  newProgress: number;      // Progress after increment (0~100, %)
  isLevelUp: boolean;       // Whether a level up occurred
  increment: number;        // Total progress increase (%)
}

interface ProgressBarProps {
  progress: number;
  level: number;
  levelUpdate?: LevelUpdateResult | null;
  showAnimation?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  level,
  levelUpdate,
  showAnimation = false
}) => {
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStage, setAnimationStage] = useState<'idle' | 'filling' | 'complete'>('idle');

  useEffect(() => {
    if (levelUpdate && showAnimation) {
      setIsAnimating(true);
      setAnimationStage('filling');
      
      // 초기값을 이전 값으로 설정
      setDisplayProgress(levelUpdate.prevProgress / 100);
      setDisplayLevel(levelUpdate.prevLevel);
      
      // 애니메이션 시작
      animateProgressIncrement();
      
    } else {
      // 일반적인 경우
      setDisplayProgress(progress);
      setDisplayLevel(level);
      setIsAnimating(false);
      setAnimationStage('idle');
    }
  }, [progress, level, levelUpdate, showAnimation]);

  const animateProgressIncrement = () => {
    if (!levelUpdate) return;
    
    let currentProgress = levelUpdate.prevProgress;
    let currentLevel = levelUpdate.prevLevel;
    let remainingIncrement = levelUpdate.increment;
    
    const animateStep = () => {
      if (remainingIncrement <= 0) {
        // 애니메이션 완료
        setAnimationStage('complete');
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationStage('idle');
        }, 1000);
        return;
      }
      
      // 현재 레벨에서 채울 수 있는 최대 진행도
      const maxProgressInCurrentLevel = 100 - currentProgress;
      const progressToFill = Math.min(remainingIncrement, maxProgressInCurrentLevel);
      
      // 진행도 업데이트
      currentProgress += progressToFill;
      remainingIncrement -= progressToFill;
      
      setDisplayProgress(currentProgress / 100);
      
      // 레벨업 체크
      if (currentProgress >= 100 && remainingIncrement > 0) {
        // 레벨업 발생
        setTimeout(() => {
          currentLevel += 1;
          currentProgress = 0;
          setDisplayLevel(currentLevel);
          setDisplayProgress(0);
          
          // 다음 단계 계속
          setTimeout(animateStep, 500);
        }, 500);
      } else {
        // 애니메이션 완료 또는 다음 단계
        if (remainingIncrement > 0) {
          setTimeout(animateStep, 100);
        } else {
          // 완료
          setTimeout(() => {
            setAnimationStage('complete');
            setTimeout(() => {
              setIsAnimating(false);
              setAnimationStage('idle');
            }, 1000);
          }, 500);
        }
      }
    };
    
    // 애니메이션 시작
    setTimeout(animateStep, 500);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          레벨 {displayLevel}
          {levelUpdate && showAnimation && levelUpdate.isLevelUp && isAnimating && (
            <span className="ml-2 text-xs text-green-600 font-bold animate-bounce">
              레벨업! 🎉
            </span>
          )}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(displayProgress * 100)}%
          {levelUpdate && showAnimation && (
            <span className="ml-1 text-xs text-blue-600 font-bold animate-pulse">
              (+{levelUpdate.increment}%)
            </span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        {/* 기본 진행도 바 */}
        <div 
          className={`h-3 rounded-full transition-all duration-500 relative ${
            isAnimating && levelUpdate?.isLevelUp 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-green-500' 
              : isAnimating
              ? 'bg-gradient-to-r from-green-500 to-cyan-500'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
          style={{ width: `${displayProgress * 100}%` }}
        >
          {/* 새로 증가한 부분 반짝임 효과 */}
          {levelUpdate && showAnimation && animationStage === 'filling' && (
            <div 
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-white to-transparent opacity-70 animate-pulse"
              style={{ 
                width: `${Math.min(30, displayProgress * 100)}%`
              }}
            ></div>
          )}
          
          {/* 레벨업 시 특별 효과 */}
          {levelUpdate && showAnimation && levelUpdate.isLevelUp && displayProgress >= 0.95 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-ping"></div>
          )}
        </div>
      </div>
      
      {/* 레벨업 축하 메시지 */}
      {levelUpdate && showAnimation && levelUpdate.isLevelUp && animationStage === 'complete' && (
        <div className="mt-2 text-center">
          <span className="text-sm text-green-600 font-bold animate-bounce">
            🎊 축하합니다! 레벨 {levelUpdate.newLevel}에 도달했습니다! 🎊
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;