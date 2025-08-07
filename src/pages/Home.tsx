import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sparkles, Search, Bot, ArrowRight, Filter, TrendingUp, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { testSupabaseConnection } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LazyImage } from '../components/LazyImage';

// Ultra-fast cache system
const dataCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for faster updates

interface Category {
  id: string;
  name: string;
  description: string;
  tool_count: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  created_at: string;
  view_count?: number;
  pricing?: {
    plan: string;
    price: string;
    features: string[];
  }[];
}

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  api_endpoint: string;
  pricing_type: string;
  status: string;
  image_url: string;
  is_available_24_7: boolean;
  user_count: number;
  has_fast_response: boolean;
  is_secure: boolean;
}

interface SearchResult {
  type: 'tool' | 'agent' | 'category';
  item: Tool | Agent | Category;
}

interface CategoryWithTools {
  id: string;
  name: string;
  description: string;
  tool_count: number;
  tools: Tool[];
}

function Home() {
  const navigate = useNavigate();
  const [categoriesWithTools, setCategoriesWithTools] = useState<CategoryWithTools[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'today' | 'new' | 'popular'>('new');
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch REAL data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Starting data fetch process...');
        
        // Test connection first
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error('❌ Connection test failed:', connectionTest.error);
          setError(`Connection failed: ${connectionTest.error}`);
          return;
        }
        
        console.log('✅ Connection verified, fetching data...');
        
        // Fetch categories and tools with better error handling
        const [categoriesResult, toolsResult] = await Promise.all([
          supabase
            .from('categories')
            .select('id, name, description, created_at')
            .order('name')
            .limit(30),
          
          supabase
            .from('tools')
            .select('id, name, description, url, category_id, image_url, created_at, features, useCases, pricing')
            .order('created_at', { ascending: false })
            .limit(200)
        ]);

        console.log('📊 Categories result:', categoriesResult);
        console.log('🔧 Tools result:', toolsResult);
        
        if (categoriesResult.error) {
          console.error('❌ Categories fetch error:', categoriesResult.error);
          setError(`Failed to load categories: ${categoriesResult.error.message}`);
          return;
        }
        
        if (toolsResult.error) {
          console.error('❌ Tools fetch error:', toolsResult.error);
          setError(`Failed to load tools: ${toolsResult.error.message}`);
          return;
        }
        
        const categories = categoriesResult.data || [];
        const tools = toolsResult.data || [];
        
        console.log('📊 Categories fetched:', categories.length);
        console.log('🔧 Tools fetched:', tools.length);
        
        if (categories.length === 0) {
          console.warn('⚠️ No categories found');
          setError('No categories found in your database. Please add some categories first.');
          return;
        }
        
        if (tools.length === 0) {
          console.warn('⚠️ No tools found');
          setError('No tools found in your database. Please add some tools first.');
          return;
        }

        // Group tools by category
        const toolsByCategory = tools.reduce((acc: Record<string, Tool[]>, tool: Tool) => {
          if (!acc[tool.category_id]) acc[tool.category_id] = [];
          acc[tool.category_id].push(tool);
          return acc;
        }, {});
        
        console.log('🗂️ Tools grouped by category:', Object.keys(toolsByCategory).length, 'categories have tools');
        
        // Process categories with their tools, ordered by tool count
        const processedCategories = categories
          .map((category: Category) => ({
            ...category,
            tool_count: toolsByCategory[category.id]?.length || 0,
            tools: (toolsByCategory[category.id] || []).slice(0, 12)
          }))
          .filter((category: CategoryWithTools) => category.tool_count > 0)
          .sort((a: CategoryWithTools, b: CategoryWithTools) => b.tool_count - a.tool_count);

        console.log('✅ Processed categories:', processedCategories.length);
        console.log('📋 Categories with tools:', processedCategories.map(c => `${c.name}: ${c.tool_count} tools`));
        
        setCategoriesWithTools(processedCategories);
        
        // Set filtered tools for featured section
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newTools = tools
          .filter((tool: Tool) => new Date(tool.created_at) >= weekAgo)
          .slice(0, 8);
        setFilteredTools(newTools);

        // Set empty agents array since you don't have agents yet
        setAgents([]);
        
        console.log('🎉 Data loading complete!');

      } catch (error) {
        console.error('❌ Failed to fetch data:', error);
        setError(`Network error: ${error?.message || 'Unable to connect to database'}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Optimized filter function with memoization
  const applyFilter = useCallback((filter: 'today' | 'new' | 'popular') => {
    if (categoriesWithTools.length === 0) return;
    
    const allTools = categoriesWithTools.flatMap(cat => cat.tools);
    const now = new Date();
    let filtered: Tool[] = [];

    switch (filter) {
      case 'today':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filtered = allTools.filter(tool => new Date(tool.created_at) >= yesterday);
        break;
      case 'new':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = allTools.filter(tool => new Date(tool.created_at) >= weekAgo);
        break;
      case 'popular':
        filtered = [...allTools].sort(() => Math.random() - 0.5);
        break;
    }

    setFilteredTools(filtered.slice(0, 8));
    setActiveFilter(filter);
  }, [categoriesWithTools]);

  // Memoized search results with debouncing
  const memoizedSearchResults = useMemo(() => {
    if (searchTerm.trim() === '') return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search in tools (limit for performance)
    categoriesWithTools.forEach(category => {
      category.tools.slice(0, 5).forEach(tool => {
        if (tool.name.toLowerCase().includes(term)) {
          results.push({ type: 'tool', item: tool });
        }
      });
    });

    // Search in agents
    agents.forEach(agent => {
      if (agent.name.toLowerCase().includes(term)) {
        results.push({ type: 'agent', item: agent });
      }
    });

    // Search in categories
    categoriesWithTools.forEach(category => {
      if (category.name.toLowerCase().includes(term)) {
        results.push({ type: 'category', item: category });
      }
    });

    return results.slice(0, 8); // Limit results for performance
  }, [searchTerm, categoriesWithTools, agents]);

  useEffect(() => {
    setSearchResults(memoizedSearchResults);
  }, [memoizedSearchResults]);

  const handleResultClick = useCallback((result: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');

    switch (result.type) {
      case 'tool':
        navigate(`/ai/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
      case 'agent':
        navigate(`/ai-agent/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
      case 'category':
        navigate(`/category/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
    }
  }, [navigate]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilterIcon = (filter: 'today' | 'new' | 'popular') => {
    switch (filter) {
      case 'today':
        return <Clock className="w-4 h-4" />;
      case 'new':
        return <Calendar className="w-4 h-4" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getFilterLabel = (filter: 'today' | 'new' | 'popular') => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'new':
        return 'New';
      case 'popular':
        return 'Popular';
    }
  };

  return (
    <main>
      {/* Hero Section with Search - Ultra Compact */}
      <header className="royal-gradient py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <section className="container mx-auto px-4 relative">
          <article className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Discover 2000+ AI Tools & Agents
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 leading-relaxed">
              Find the perfect AI tools for your needs - from content creation to data analysis
            </p>
            
            {/* Enhanced Search Bar */}
            <section className="max-w-2xl mx-auto mb-6">
              <nav id="search-container" className="relative" style={{ zIndex: 50 }}>
                <form className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search AI tools, agents, or categories..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full pl-12 pr-4 py-3 bg-royal-dark-card border border-royal-dark-lighter rounded-full text-white focus:outline-none focus:border-royal-gold text-base shadow-xl"
                  />
                </form>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <aside className="absolute left-0 right-0 mt-2 bg-royal-dark-card border border-royal-dark-lighter rounded-2xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto">
                    {(['tool', 'agent', 'category'] as const).map(type => {
                      const typeResults = searchResults.filter(r => r.type === type);
                      if (typeResults.length === 0) return null;

                      return (
                        <section key={type} className="border-b border-royal-dark-lighter last:border-0">
                          <header className="px-4 py-2 bg-royal-dark-lighter sticky top-0">
                            <h3 className="text-sm font-semibold text-gray-400">
                              {type.charAt(0).toUpperCase() + type.slice(1)}s
                            </h3>
                          </header>
                          {typeResults.map((result, index) => (
                            <button
                              key={`${result.type}-${index}`}
                              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-royal-dark/50 transition-colors text-left"
                              onClick={() => handleResultClick(result)}
                            >
                              {result.type === 'tool' && <Search className="w-5 h-5 text-royal-gold" />}
                              {result.type === 'agent' && <Bot className="w-5 h-5 text-royal-gold" />}
                              {result.type === 'category' && <Sparkles className="w-5 h-5 text-royal-gold" />}
                              <article>
                                <h4 className="text-white font-medium">{result.item.name}</h4>
                                <p className="text-sm text-gray-400 line-clamp-1">
                                  {result.item.description}
                                </p>
                              </article>
                            </button>
                          ))}
                        </section>
                      );
                    })}
                  </aside>
                )}
              </nav>
            </section>

            <nav className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link 
                to="/categories" 
                className="w-full sm:w-auto bg-royal-gold text-royal-dark px-4 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 text-center text-sm"
              >
                Explore All Tools
              </Link>
              <Link 
                to="/ai-agent" 
                className="w-full sm:w-auto border-2 border-royal-gold text-royal-gold px-4 py-2 rounded-full font-bold hover:bg-royal-gold hover:text-royal-dark transition-all text-center text-sm"
              >
                AI Agents
              </Link>
            </nav>

            {/* Filter Section */}
            <section className="flex items-center justify-center mb-4">
              <nav className="flex items-center space-x-2 bg-royal-dark-card rounded-full p-2 border border-royal-dark-lighter">
                <Filter className="w-4 h-4 text-gray-400 ml-2" />
                {(['today', 'new', 'popular'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => applyFilter(filter)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all text-sm ${
                      activeFilter === filter
                        ? 'bg-royal-gold text-royal-dark'
                        : 'text-gray-400 hover:text-white hover:bg-royal-dark'
                    }`}
                  >
                    {getFilterIcon(filter)}
                    <span className="font-medium">{getFilterLabel(filter)}</span>
                  </button>
                ))}
              </nav>
            </section>

            {/* Data Source Indicator */}
            {loading && (
              <div className="text-xs text-royal-gold mb-2">
                🚀 Loading real data...
              </div>
            )}
            {error && (
              <div className="text-xs text-red-400 mb-2">
                ⚠️ {error}
              </div>
            )}
          </article>
        </section>
      </header>

      {/* Featured Tools - Above the fold */}
      {filteredTools.length > 0 && (
        <section className="py-6 bg-royal-dark-lighter">
          <article className="container mx-auto px-4">
            <h2 className="text-2xl font-bold gradient-text mb-4 text-center">Featured Tools</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTools.slice(0, 8).map((tool, index) => (
                <li key={tool.id}>
                  <Link
                    to={`/ai/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-royal-dark-card rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300 border border-royal-dark-lighter hover:border-royal-gold"
                  >
                    <article className="aspect-square relative overflow-hidden">
                      <LazyImage
                        src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b'}
                        alt={tool.name}
                        width={400}
                        height={400}
                        priority={index < 4}
                        className="w-full h-full object-cover"
                      />
                      <aside className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <footer className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-bold text-white group-hover:text-royal-gold transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                          {tool.description}
                        </p>
                        {tool.pricing && tool.pricing.length > 0 && (
                          <aside className="mt-2">
                            <mark className="text-xs bg-royal-gold text-royal-dark px-2 py-1 rounded-full font-medium">
                              {tool.pricing[0].price}
                            </mark>
                          </aside>
                        )}
                      </footer>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {/* All Categories with Tools - Ordered by tool count */}
      <section className="py-16 bg-royal-dark">
        <article className="container mx-auto px-4">
          {/* Debug Information */}
          {loading && (
            <div className="text-center mb-8">
              <div className="text-royal-gold text-xl">🚀 Loading your data...</div>
            </div>
          )}
          
          {error && (
            <div className="text-center mb-8">
              <div className="text-red-400 text-lg">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-royal-gold text-royal-dark px-6 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && categoriesWithTools.length === 0 && (
            <div className="text-center mb-8">
              <div className="text-gray-400 text-lg">No categories found</div>
            </div>
          )}
          
          {categoriesWithTools.map((category, categoryIndex) => (
            <section key={category.id} className="mb-20">
              {/* Category Header */}
              <header className="flex items-center justify-between mb-8">
                <hgroup>
                  <Link
                    to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-3xl font-bold text-white hover:text-royal-gold transition-colors"
                  >
                    {category.name}
                  </Link>
                  <p className="text-gray-400 mt-2">
                    {category.description}
                  </p>
                  <p className="text-royal-gold text-sm font-medium mt-2">
                    {category.tool_count} tools available
                  </p>
                </hgroup>
                <Link
                  to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center text-royal-gold hover:text-royal-gold/80 font-medium bg-royal-dark-card px-4 py-2 rounded-lg border border-royal-dark-lighter hover:border-royal-gold transition-all"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </header>

              {/* Tools Grid - Exactly 12 tools in 4x3 grid */}
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.tools.slice(0, 12).map((tool, toolIndex) => (
                  <li key={tool.id}>
                    <Link
                      to={`/ai/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block bg-royal-dark-card rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300 border border-royal-dark-lighter hover:border-royal-gold"
                    >
                      <article>
                        {/* Tool Image */}
                        <figure className="aspect-square relative overflow-hidden">
                          <LazyImage
                            src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b'}
                            alt={tool.name}
                            width={400}
                            height={400}
                            priority={categoryIndex === 0 && toolIndex < 4}
                            className="w-full h-full object-cover"
                          />
                          <aside className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Tool Info Overlay */}
                          <footer className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-base font-bold text-white group-hover:text-royal-gold transition-colors mb-1">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                              {tool.description}
                            </p>
                            
                            {/* Pricing Badge */}
                            {tool.pricing && tool.pricing.length > 0 && (
                              <mark className="inline-block text-xs bg-royal-gold text-royal-dark px-2 py-1 rounded-full font-medium">
                                {tool.pricing[0].price}
                              </mark>
                            )}
                          </footer>
                        </figure>
                      </article>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-royal-dark">
        <article className="container mx-auto px-4">
          <header className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Stay Updated</h2>
            <p className="text-gray-400 mb-6">
              Get the latest AI tools and insights delivered to your inbox
            </p>
          </header>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full bg-royal-dark border border-royal-dark-lighter focus:outline-none focus:border-royal-gold"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-royal-gold text-royal-dark px-8 py-3 rounded-full font-bold hover:bg-opacity-90 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}

export default Home;