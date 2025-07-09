import React from 'react';

const PostWritePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">✍️ 게시글 작성</h1>
        <p className="text-gray-600 text-lg">
          새로운 게시글을 작성하세요
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-6xl mb-4">✍️</div>
        <h2 className="text-2xl font-bold text-blue-600 mb-4">게시글 작성</h2>
        <p className="text-gray-600">
          아직 구현되지 않은 기능입니다. 곧 업데이트될 예정입니다!
        </p>
      </div>
    </div>
  );
};

export default PostWritePage; 