import React from 'react';
import BoardForm from '../../components/board/BoardForm';

const BoardWritePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-6">
        <BoardForm />
      </div>
    </div>
  );
};

export default BoardWritePage;