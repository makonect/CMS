import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;