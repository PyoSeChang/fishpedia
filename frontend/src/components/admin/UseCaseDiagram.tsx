import React, { useState, useRef } from 'react';

interface UseCaseNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'actor' | 'usecase' | 'system' | 'section';
  category?: string;
}

interface UseCaseConnection {
  from: string;
  to: string;
  type: 'association' | 'include' | 'extend';
}

interface Section {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  actions: string[];
}

const UseCaseDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const exportToImage = async () => {
    if (!diagramRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: diagramRef.current.scrollWidth,
        windowHeight: diagramRef.current.scrollHeight,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          return element.tagName === 'BUTTON';
        }
      });
      
      const link = document.createElement('a');
      link.download = 'fishiphedia-usecase-diagram.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('이미지 내보내기 실패:', error);
      alert('이미지 내보내기에 실패했습니다.');
    }
  };

  const sections: Section[] = [
    { 
      id: 'auth_section', 
      name: '인증 & 사용자 관리', 
      x: 150, 
      y: 50, 
      width: 300, 
      height: 200, 
      color: 'bg-blue-50 border-blue-200',
      actions: ['회원가입', '로그인', '소셜 로그인', '프로필 관리']
    },
    { 
      id: 'log_section', 
      name: '낚시 일지', 
      x: 480, 
      y: 280, 
      width: 300, 
      height: 160, 
      color: 'bg-yellow-50 border-yellow-200',
      actions: ['낚시 일지 작성', '낚시 일지 조회', '일지 검증']
    },
    { 
      id: 'fish_section', 
      name: '물고기 분류', 
      x: 150, 
      y: 280, 
      width: 300, 
      height: 200, 
      color: 'bg-green-50 border-green-200',
      actions: ['AI 물고기 분류', '물고기 정보 조회']
    },
    { 
      id: 'community_section', 
      name: '커뮤니티 & 랭킹', 
      x: 820, 
      y: 280, 
      width: 300, 
      height: 160, 
      color: 'bg-purple-50 border-purple-200',
      actions: ['게시글 작성', '게시글 조회', '댓글 작성', '랭킹 조회', '컬렉션 조회']
    },
    { 
      id: 'spots_section', 
      name: '낚시터 정보', 
      x: 150, 
      y: 520, 
      width: 300, 
      height: 220, 
      color: 'bg-cyan-50 border-cyan-200',
      actions: ['낚시터 검색', '세부 카테고리 검색', '바다낚시 지수 조회', '낚시터 정보 조회']
    },
    { 
      id: 'admin_section', 
      name: '관리자 기능', 
      x: 1160, 
      y: 50, 
      width: 300, 
      height: 220, 
      color: 'bg-red-50 border-red-200',
      actions: ['사용자 관리', '시스템 모니터링', '데이터 마이그레이션', 'API 관리', '물고기 정보 관리', '분류 통계 관리']
    }
  ];

  const actors: UseCaseNode[] = [
    { id: 'user', name: '일반 사용자', x: 30, y: 280, type: 'actor' },
    { id: 'admin', name: '관리자', x: 1040, y: 100, type: 'actor' }
  ];

  const connections: UseCaseConnection[] = [
    { from: 'fish_section', to: 'log_section', type: 'extend' },
    { from: 'log_section', to: 'community_section', type: 'extend' }
  ];

  const getActorColor = (type: string) => {
    switch (type) {
      case 'actor': return 'bg-indigo-100 border-indigo-400 text-indigo-900';
      case 'system': return 'bg-orange-100 border-orange-400 text-orange-900';
      default: return 'bg-gray-100 border-gray-400 text-gray-900';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Fishiphedia UseCase Diagram</h2>
          <p className="text-gray-600">시스템의 주요 기능과 액터 간의 관계를 시각화</p>
        </div>
        <button
          onClick={exportToImage}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          이미지로 내보내기
        </button>
      </div>

      {/* 범례 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">범례</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-100 border border-indigo-400 rounded"></div>
            <span>액터</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-400 rounded"></div>
            <span>시스템</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gray-400"></div>
            <span>연관 관계</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-600" style={{background: 'repeating-linear-gradient(to right, #059669 0px, #059669 5px, transparent 5px, transparent 10px)'}}></div>
            <span>포함 관계</span>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-3 text-xs">
          <span className="px-2 py-1 bg-blue-100 border border-blue-300 text-blue-800 rounded">인증</span>
          <span className="px-2 py-1 bg-green-100 border border-green-300 text-green-800 rounded">물고기</span>
          <span className="px-2 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">일지</span>
          <span className="px-2 py-1 bg-purple-100 border border-purple-300 text-purple-800 rounded">커뮤니티</span>
          <span className="px-2 py-1 bg-pink-100 border border-pink-300 text-pink-800 rounded">랭킹</span>
          <span className="px-2 py-1 bg-cyan-100 border border-cyan-300 text-cyan-800 rounded">낚시터</span>
          <span className="px-2 py-1 bg-red-100 border border-red-300 text-red-800 rounded">관리자</span>
        </div>
      </div>

      {/* 다이어그램 */}
      <div 
        ref={diagramRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden" 
        style={{ height: '800px', width: '1500px' }}
      >
        
        {/* 액터들 */}
        {actors.map((actor) => (
          <div
            key={actor.id}
            className={`absolute cursor-pointer transition-all duration-200 w-18 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${getActorColor(actor.type)} ${
              selectedNode === actor.id ? 'ring-2 ring-blue-400 ring-offset-2 scale-105' : 'hover:scale-105'
            }`}
            style={{ 
              left: `${actor.x}px`, 
              top: `${actor.y}px`,
              transform: selectedNode === actor.id ? 'scale(1.05)' : 'scale(1)'
            }}
            onClick={() => setSelectedNode(selectedNode === actor.id ? null : actor.id)}
            title={actor.name}
          >
            <span className="text-center leading-tight px-1">{actor.name}</span>
          </div>
        ))}

        {/* 섹션들과 내부 액션들 */}
        {sections.map((section) => (
          <div
            key={section.id}
            className={`absolute border-2 border-dashed rounded-lg ${section.color} p-4 flex flex-col`}
            style={{
              left: `${section.x}px`,
              top: `${section.y}px`,
              width: `${section.width * 0.8}px`
            }}
          >
            <div className="text-sm font-semibold text-gray-700 text-center mb-3 -mt-1">
              {section.name}
            </div>
            <div className="flex flex-col gap-2 justify-start items-center pt-2 pb-4">
              {section.actions.map((action, index) => (
                <span
                  key={`${section.id}_action_${index}`}
                  className="px-3 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors text-center"
                  onClick={() => setSelectedNode(`${section.id}_${action}`)}
                  title={action}
                  style={{ 
                    width: '140px', 
                    height: '28px', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    verticalAlign: 'middle'
                  }}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* 연결선들 */}
        {connections.map((connection, index) => {
          const fromSection = sections.find(s => s.id === connection.from);
          const toSection = sections.find(s => s.id === connection.to);
          
          if (!fromSection || !toSection) return null;
          
          const fromX = fromSection.x + (fromSection.width * 0.8);
          const fromY = fromSection.y + fromSection.height / 2;
          const toX = toSection.x;
          const toY = toSection.y + toSection.height / 2;
          
          return (
            <svg
              key={`connection-${index}`}
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }}
            >
              <defs>
                <marker
                  id={`arrowhead-${index}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#059669"
                  />
                </marker>
              </defs>
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray={connection.type === 'extend' ? '5,5' : '0'}
                markerEnd={`url(#arrowhead-${index})`}
              />
            </svg>
          );
        })}
      </div>

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">
            {selectedNode === 'user' && '일반 사용자'}
            {selectedNode === 'admin' && '관리자'}
            {selectedNode.includes('auth_section') && '인증 관련 기능'}
            {selectedNode.includes('log_section') && '낚시 일지 관련 기능'}
            {selectedNode.includes('fish_section') && '물고기 분류 관련 기능'}
            {selectedNode.includes('community_section') && '커뮤니티 관련 기능'}
            {selectedNode.includes('ranking_section') && '랭킹 관련 기능'}
            {selectedNode.includes('spots_section') && '낚시터 정보 관련 기능'}
            {selectedNode.includes('admin_section') && '관리자 전용 기능'}
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            {selectedNode === 'user' && '낚시 애호가들이 시스템의 주요 기능을 이용합니다.'}
            {selectedNode === 'admin' && '시스템 관리자로서 물고기 정보와 사용자를 관리합니다.'}
            {selectedNode.includes('auth_section') && '사용자 인증 및 계정 관리 기능입니다.'}
            {selectedNode.includes('log_section') && '낚시 일지 작성 및 관리 기능입니다.'}
            {selectedNode.includes('fish_section') && 'AI 기반 물고기 분류 및 정보 관리 기능입니다.'}
            {selectedNode.includes('community_section') && '사용자 간 소통을 위한 커뮤니티 기능입니다.'}
            {selectedNode.includes('ranking_section') && '사용자 랭킹 및 컬렉션 조회 기능입니다.'}
            {selectedNode.includes('spots_section') && '낚시터 정보 검색 및 조회 기능입니다.'}
            {selectedNode.includes('admin_section') && '관리자가 사용하는 시스템 관리 기능입니다.'}
          </p>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-bold text-blue-600">{actors.length}</div>
          <div className="text-blue-600">액터</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="font-bold text-green-600">{sections.reduce((total, section) => total + section.actions.length, 0)}</div>
          <div className="text-green-600">기능</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="font-bold text-purple-600">{sections.length}</div>
          <div className="text-purple-600">섹션</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="font-bold text-orange-600">7</div>
          <div className="text-orange-600">카테고리</div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDiagram;