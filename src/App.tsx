import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryView from './pages/CategoryView';
import ToolDetail from './pages/ToolDetail';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Compare from './pages/Compare';
import Search from './pages/Search';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Advertise from './pages/Advertise';
import Affiliate from './pages/Affiliate';
import Sitemap from './pages/Sitemap';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-royal-dark overflow-x-hidden">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:name" element={<CategoryView />} />
          <Route path="/ai/:slug" element={<ToolDetail />} />
          <Route path="/ai-agent" element={<Agents />} />
          <Route path="/ai-agent/:slug" element={<AgentDetail />} />
          <Route path="/compare/:tools" element={<Compare />} />
          <Route path="/s/:term" element={<Search />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;