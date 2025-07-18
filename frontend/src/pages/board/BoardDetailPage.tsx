import React from 'react';
import BoardDetail from '../../components/board/BoardDetail';

const BoardDetailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-6">
        <BoardDetail />
      </div>
    </div>
  );
};

export default BoardDetailPage;