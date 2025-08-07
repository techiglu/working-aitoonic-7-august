import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sparkles, Search, Bot, ArrowRight, Filter, TrendingUp, Calendar, Clock, BookOpen, Users, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LazyImage } from '../components/LazyImage';

// Fallback data in case Supabase is not available
const FALLBACK_CATEGORIES = [
  {
    id: '1',
    name: 'Text Generation',
    description: 'AI tools for generating and manipulating text content',
    tool_count: 15,
    tools: [
      {
        id: '1',
        name: 'GPT Writer',
        description: 'Advanced AI writing assistant for content creation',
        url: 'https://example.com',
        category_id: '1',
        image_url: 'https://images.unsplash.com/photo-1676277791608-ac54783d753b?auto=format&fit=crop&q=80&w=400',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Free', price: 'Free', features: ['Basic features'] }]
      }
    ]
  }
];

const FALLBACK_AGENTS = [
  {
    id: '1',
    name: 'ContentGenius',
    description: 'Advanced AI agent for content creation and optimization',
    capabilities: ['Content Generation', 'SEO Optimization'],
    api_endpoint: 'https://example.com',
    pricing_type: 'freemium',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400',
    is_available_24_7: true,
    user_count: 5000,
    has_fast_response: true,
    is_secure: true
  }
];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimized data fetching with timeout and error handling
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Check if Supabase is available
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        // Try to fetch data from Supabase with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 3000)
        );

        try {
          const dataPromise = Promise.all([
            supabase
              .from('categories')
              .select('id, name, description')
              .order('name')
              .limit(10),
            
            supabase
              .from('tools')
              .select('id, name, description, url, category_id, image_url, created_at, pricing')
              .order('created_at', { ascending: false })
              .limit(100),
            
            supabase
              .from('agents')
              .select('*')
              .eq('status', 'active')
              .limit(3)
          ]);

          const [categoriesResult, toolsResult, agentsResult] = await Promise.race([
            dataPromise,
            timeoutPromise
          ]) as any;

          // Process categories data
          if (categoriesResult.data && toolsResult.data) {
            const toolsByCategory = toolsResult.data.reduce((acc: Record<string, Tool[]>, tool: Tool) => {
              if (!acc[tool.category_id]) acc[tool.category_id] = [];
              acc[tool.category_id].push(tool);
              return acc;
            }, {});

            const processedCategories = categoriesResult.data
              .map((category: Category) => ({
                ...category,
                tool_count: toolsByCategory[category.id]?.length || 0,
                tools: (toolsByCategory[category.id] || []).slice(0, 12)
              }))
              .filter((category: CategoryWithTools) => category.tool_count > 0)
              .sort((a: CategoryWithTools, b: CategoryWithTools) => b.tool_count - a.tool_count);

            setCategoriesWithTools(processedCategories);
            
            // Set filtered tools for "new" filter by default
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const newTools = toolsResult.data
              .filter((tool: Tool) => new Date(tool.created_at) >= weekAgo)
              .slice(0, 8);
            setFilteredTools(newTools);
          }

          if (agentsResult.data) {
            setAgents(agentsResult.data);
          }
        } catch (fetchError) {
          console.warn('Supabase fetch failed, using fallback data:', fetchError);
          throw fetchError;
        }

      } catch (error) {
        console.warn('Using fallback data due to error:', error);
        
        // Use fallback data instead of showing error
        setCategoriesWithTools(FALLBACK_CATEGORIES);
        setFilteredTools(FALLBACK_CATEGORIES[0].tools);
        setAgents(FALLBACK_AGENTS);
        setError(null); // Don't show error, just use fallback data
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Optimized filter function
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

  // Memoized search results
  const memoizedSearchResults = useMemo(() => {
    if (searchTerm.trim() === '') return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search in tools
    categoriesWithTools.forEach(category => {
      category.tools.forEach(tool => {
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

    return results.slice(0, 10);
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-royal-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state briefly, then show content even if still loading
  if (loading && categoriesWithTools.length === 0) {
    return (
      <div className="min-h-screen bg-royal-dark flex items-center justify-center">
        <div className="text-royal-gold text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main>
      {/* Hero Section with Search - Compact */}
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

            {/* Filter Section - Above the fold */}
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
          </article>
        </section>
      </header>

      {/* Featured Tools - Above the fold */}
      {filteredTools.length > 0 && (
        <section className="py-6 bg-royal-dark-lighter">
          <article className="container mx-auto px-4">
            <h2 className="text-2xl font-bold gradient-text mb-4 text-center">Featured Tools</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTools.slice(0, 8).map((tool) => (
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

      {/* First Category - Above the fold */}
      {categoriesWithTools.length > 0 && (
        <section className="py-6 bg-royal-dark">
          <article className="container mx-auto px-4">
            <section className="mb-8">
              <header className="flex items-center justify-between mb-4">
                <hgroup>
                  <h3 className="text-2xl font-bold text-white">{categoriesWithTools[0].name}</h3>
                  <p className="text-royal-gold text-sm font-medium">
                    {categoriesWithTools[0].tool_count} tools available
                  </p>
                </hgroup>
                <Link
                  to={`/category/${categoriesWithTools[0].name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center text-royal-gold hover:text-royal-gold/80 font-medium"
                >
                  View All
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </header>

              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoriesWithTools[0].tools.map((tool) => (
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
                        className="w-full h-full object-cover"
                      />
                      <aside className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <footer className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-sm font-bold text-white group-hover:text-royal-gold transition-colors">
                          {tool.name}
                        </h4>
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
            </section>
          </article>
        </section>
      )}

      {/* How to Use Section */}
      <section className="py-12 bg-royal-dark-card">
        <article className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">How to Use Aitoonic</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Get started with our AI tools directory in just a few simple steps
            </p>
          </header>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <li className="text-center">
              <figure className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-royal-dark" />
              </figure>
              <h3 className="text-xl font-bold text-white mb-4">1. Search & Discover</h3>
              <p className="text-gray-400">
                Use our powerful search to find AI tools by name, category, or functionality. Browse through 2000+ curated tools.
              </p>
            </li>

            <li className="text-center">
              <figure className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-royal-dark" />
              </figure>
              <h3 className="text-xl font-bold text-white mb-4">2. Compare & Learn</h3>
              <p className="text-gray-400">
                Read detailed reviews, compare features, pricing, and see what other users are saying about each tool.
              </p>
            </li>

            <li className="text-center">
              <figure className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-royal-dark" />
              </figure>
              <h3 className="text-xl font-bold text-white mb-4">3. Try & Implement</h3>
              <p className="text-gray-400">
                Click through to try the tools directly, access free trials, and integrate the best AI solutions into your workflow.
              </p>
            </li>
          </ol>

          <footer className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center bg-royal-gold text-royal-dark px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </footer>
        </article>
      </section>

      {/* Remaining Categories */}
      {categoriesWithTools.length > 1 && (
        <section className="py-8 bg-royal-dark">
          <article className="container mx-auto px-4">
            <header className="text-center mb-12">
              <h2 className="text-3xl font-bold gradient-text mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Explore our comprehensive collection of AI tools organized by category
              </p>
            </header>

            {categoriesWithTools.slice(1).map((category) => (
              <section key={category.id} className="mb-12">
                <header className="flex items-center justify-between mb-6">
                  <hgroup>
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                    <p className="text-royal-gold text-sm font-medium">
                      {category.tool_count} tools available
                    </p>
                  </hgroup>
                  <Link
                    to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center text-royal-gold hover:text-royal-gold/80 font-medium"
                  >
                    View All
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </header>

                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.tools.map((tool) => (
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
                          className="w-full h-full object-cover"
                          className="w-full h-full object-cover"
                        />
                        <aside className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <footer className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-sm font-bold text-white group-hover:text-royal-gold transition-colors">
                            {tool.name}
                          </h4>
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
              </section>
            ))}
          </article>
        </section>
      )}

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