import React from 'react';
import BoardDetail from '../../components/board/BoardDetail';

const BoardDetailPage: React.FC = () => {
  return (
    <div className="w-full" style={{maxWidth: '1200px', margin: '0 auto'}}>
      <BoardDetail />
    </div>
  );
};

export default BoardDetailPage;