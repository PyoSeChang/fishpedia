import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishService, Fish, FishRequest } from '../../services/fishService';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avgLength: '',
    stdDeviation: '',
    rarityScore: ''
  });

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'ADMIN') {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }
    setIsAdmin(true);
    loadFishList();
  }, [navigate]);

  const loadFishList = async () => {
    try {
      const data = await fishService.getAllFish();
      setFishList(data);
    } catch (error) {
      console.error('물고기 목록 로드 실패:', error);
    }
  };

  const handleAddFish = () => {
    setEditingFish(null);
    setFormData({ name: '', avgLength: '', stdDeviation: '', rarityScore: '' });
    setShowModal(true);
  };

  const handleEditFish = (fish: Fish) => {
    setEditingFish(fish);
    setFormData({
      name: fish.name,
      avgLength: fish.avgLength.toString(),
      stdDeviation: fish.stdDeviation.toString(),
      rarityScore: fish.rarityScore.toString()
    });
    setShowModal(true);
  };

  const handleDeleteFish = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await fishService.deleteFish(id);
        setFishList(fishList.filter(fish => fish.id !== id));
      } catch (error) {
        console.error('물고기 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleFishingForecast = async () => {
    try {
      const response = await fetch('/api/spots/fishing-forecast');
      const data = await response.text();
      alert('낚시 예보 데이터: ' + data);
    } catch (error) {
      console.error('낚시 예보 조회 실패:', error);
      alert('낚시 예보 조회에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fishData = {
      name: formData.name,
      avgLength: parseFloat(formData.avgLength),
      stdDeviation: parseFloat(formData.stdDeviation),
      rarityScore: parseInt(formData.rarityScore)
    };

    try {
      if (editingFish) {
        // 수정 API 연동
        const updatedFish = await fishService.updateFish(editingFish.id, fishData);
        setFishList(fishList.map(fish => 
          fish.id === editingFish.id ? updatedFish : fish
        ));
      } else {
        // 추가 API 연동
        const newFish = await fishService.createFish(fishData);
        setFishList([...fishList, newFish]);
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('물고기 저장 실패:', error);
      alert(error.response?.data?.error || '저장에 실패했습니다.');
    }
  };

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">⚙️ 관리자 페이지</h1>
        <p className="text-gray-600 text-lg">물고기 정보를 관리하세요</p>
      </div>

      {/* 관리자 기능 버튼 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600">관리자 기능</h2>
          <div className="space-x-2">
            <button 
              onClick={handleAddFish}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ 물고기 추가
            </button>
            <button 
              onClick={handleFishingForecast}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🎣 낚시 예보 조회
            </button>
          </div>
        </div>
      </div>

      {/* 물고기 목록 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">물고기 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 길이</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">표준편차</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">희귀도</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody>
              {fishList.map((fish) => (
                <tr key={fish.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fish.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fish.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fish.avgLength}cm</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fish.stdDeviation}cm</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fish.rarityScore}점</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFish(fish)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteFish(fish.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              {editingFish ? '물고기 수정' : '물고기 추가'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">평균 길이 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.avgLength}
                  onChange={(e) => setFormData({...formData, avgLength: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">표준편차 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.stdDeviation}
                  onChange={(e) => setFormData({...formData, stdDeviation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">희귀도 점수</label>
                <input
                  type="number"
                  value={formData.rarityScore}
                  onChange={(e) => setFormData({...formData, rarityScore: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFish ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 