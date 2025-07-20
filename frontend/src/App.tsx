import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import FishCollectionPage from './pages/fish/FishCollectionPage';
import FishLogsPage from './pages/fish/FishLogsPage';
import FishLogWritePage from './pages/fish/FishLogWritePage';
import CommunityPage from './pages/community/CommunityPage';
import PostDetailPage from './pages/community/PostDetailPage';
import PostWritePage from './pages/community/PostWritePage';
import BoardDetailPage from './pages/board/BoardDetailPage';
import BoardWritePage from './pages/board/BoardWritePage';
import BoardEditPage from './pages/board/BoardEditPage';
import FishingSpotsPage from './pages/spots/FishingSpotsPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';
import AdminPage from './pages/auth/AdminPage';
import './App.css';
import KakaoCallbackPage from "./pages/auth/KakaoCallbackPage";
import NaverCallbackPage from "./pages/auth/NaverCallbackPage";

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="fish">
              <Route path="collection" element={<FishCollectionPage />} />
              <Route path="logs">
                <Route index element={<FishLogsPage />} />
                <Route path="write" element={<FishLogWritePage />} />
              </Route>
            </Route>
            <Route path="spots" element={<FishingSpotsPage />} />
            <Route path="community">
              <Route index element={<CommunityPage />} />
              <Route path=":id" element={<BoardDetailPage />} />
              <Route path="write" element={<BoardWritePage />} />
              <Route path="edit/:id" element={<BoardEditPage />} />
              <Route path="post/:id" element={<PostDetailPage />} />
              <Route path="post/write" element={<PostWritePage />} />
            </Route>
            {/* Redirect old board routes to community */}
            <Route path="board">
              <Route index element={<CommunityPage />} />
              <Route path=":id" element={<BoardDetailPage />} />
              <Route path="write" element={<BoardWritePage />} />
              <Route path="edit/:id" element={<BoardEditPage />} />
            </Route>
            {/* Redirect old ranking route to community */}
            <Route path="ranking" element={<CommunityPage />} />
            <Route path="profile">
              <Route index element={<ProfilePage />} />
              <Route path="edit" element={<ProfileEditPage />} />
            </Route>
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="/auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />
          <Route path="/oauth/callback/naver" element={<NaverCallbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
