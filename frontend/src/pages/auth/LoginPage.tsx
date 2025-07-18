import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService, LoginRequest } from '../../services/userService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    loginId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const KAKAO_AUTH_URL =
      "https://kauth.kakao.com/oauth/authorize" +
      "?client_id=a7f21c96241b51f363002bbe85fd5630" +
      "&redirect_uri=http://localhost:3000/oauth/callback/kakao" +
      "&response_type=code";

  const NAVER_AUTH_URL =
      "https://nid.naver.com/oauth2.0/authorize" +
      "?response_type=code" +
      "&client_id=djkxODvesdxbkDC5bz0j" +
      "&redirect_uri=http://localhost:3000/oauth/callback/naver" +  // 리다이렉트 URI 맞게 설정!
      "&state=random_string"; // CSRF 방지용 랜덤 값, 필수!


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userService.login(formData);
      
      // JWT 토큰 및 사용자 정보 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('loginId', response.loginId);
      localStorage.setItem('userRole', response.role);
      
      // 홈페이지로 이동
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎣</div>
          <h2 className="text-3xl font-bold text-blue-600">Fishipedia</h2>
          <p className="mt-2 text-gray-600">낚시 커뮤니티에 로그인하세요</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="loginId"
                name="loginId"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                value={formData.loginId}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  로그인 상태 유지
                </label>
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                비밀번호 찾기
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-colors disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/auth/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <a
                href={KAKAO_AUTH_URL}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold"
                style={{
                  backgroundColor: '#FEE500',
                  color: '#3C1E1E',
                  border: '1px solid #F0E3D7',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
            >
              {/* 카카오톡 아이콘 (svg) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="24" fill="#FEE500"/>
                <path fill="#3C1E1E" d="M24 12C15.7157 12 9 17.1193 9 23.0226c0 4.0833 3.25956 7.6597 8.1137 9.4473-.3386 1.1617-1.2296 4.2334-1.4162 4.9576 0 0-.0277.2482.1306.3444.1583.0961.3702-.0194.3702-.0194.4883-.0682 5.6268-3.7462 6.2009-4.1517.8672.0857 1.7592.1321 2.6019.1321 8.2843 0 15-5.1193 15-11.0226C39 17.1193 32.2843 12 24 12Z"/>
              </svg>
              카카오톡으로 로그인
            </a>
            {/* 네이버 로그인 버튼 */}
            <a
                href={NAVER_AUTH_URL}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold"
                style={{
                  backgroundColor: '#03C75A',
                  color: '#fff',
                  border: '1px solid #03C75A',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
            >
              {/* 네이버 아이콘 (svg) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="12" fill="#03C75A"/>
                <path fill="#fff" d="M33.82 33.06h-5.32l-6.77-9.85v9.85h-4.29V15h5.24l6.85 10.03V15h4.29v18.06z"/>
              </svg>
              네이버로 로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 