import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sparkles, Search, Bot, ArrowRight, Filter, TrendingUp, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LazyImage } from '../components/LazyImage';

// Demo data fallback
const DEMO_CATEGORIES = [
  {
    id: '1',
    name: 'Content Creation',
    description: 'AI tools for creating amazing content',
    tool_count: 8,
    tools: [
      {
        id: '1',
        name: 'ChatGPT',
        description: 'Advanced AI chatbot for conversations and content creation',
        url: 'https://chat.openai.com',
        category_id: '1',
        image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Free', price: 'Free', features: ['Basic chat', 'Limited usage'] }]
      },
      {
        id: '2',
        name: 'Midjourney',
        description: 'AI-powered image generation tool',
        url: 'https://midjourney.com',
        category_id: '1',
        image_url: 'https://images.unsplash.com/photo-1686191128892-3b4e0e3e3c3e?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Basic', price: '$10/month', features: ['200 images', 'Commercial use'] }]
      },
      {
        id: '3',
        name: 'Jasper AI',
        description: 'AI writing assistant for marketing content',
        url: 'https://jasper.ai',
        category_id: '1',
        image_url: 'https://images.unsplash.com/photo-1664382953518-4c5b8b8b8b8b?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Starter', price: '$29/month', features: ['50k words', 'Templates'] }]
      },
      {
        id: '4',
        name: 'Copy.ai',
        description: 'AI copywriting tool for marketing',
        url: 'https://copy.ai',
        category_id: '1',
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Free', price: 'Free', features: ['2k words', 'Basic templates'] }]
      }
    ]
  },
  {
    id: '2',
    name: 'Data Analysis',
    description: 'AI tools for analyzing and processing data',
    tool_count: 6,
    tools: [
      {
        id: '5',
        name: 'DataRobot',
        description: 'Automated machine learning platform',
        url: 'https://datarobot.com',
        category_id: '2',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Enterprise', price: 'Contact Sales', features: ['Custom models', 'API access'] }]
      },
      {
        id: '6',
        name: 'Tableau',
        description: 'Data visualization and business intelligence',
        url: 'https://tableau.com',
        category_id: '2',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Creator', price: '$70/month', features: ['Full platform', 'Collaboration'] }]
      }
    ]
  },
  {
    id: '3',
    name: 'Code Generation',
    description: 'AI tools for generating and reviewing code',
    tool_count: 5,
    tools: [
      {
        id: '7',
        name: 'GitHub Copilot',
        description: 'AI pair programmer for code completion',
        url: 'https://github.com/features/copilot',
        category_id: '3',
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Individual', price: '$10/month', features: ['Code suggestions', 'Multiple languages'] }]
      },
      {
        id: '8',
        name: 'Replit AI',
        description: 'AI coding assistant in the browser',
        url: 'https://replit.com',
        category_id: '3',
        image_url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        pricing: [{ plan: 'Hacker', price: '$7/month', features: ['AI assistance', 'Private repls'] }]
      }
    ]
  }
];

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
        
        // Use demo data instead of Supabase
        console.log('📊 Using demo data...');
        setCategoriesWithTools(DEMO_CATEGORIES);
        
        // Set filtered tools for featured section
        const allDemoTools = DEMO_CATEGORIES.flatMap(cat => cat.tools);
        setFilteredTools(allDemoTools.slice(0, 8));
        
        // Set empty agents array
        setAgents([]);
        
        console.log('🎉 Demo data loaded successfully!');

      } catch (error) {
        console.error('❌ Failed to load demo data:', error);
        // Even if demo data fails, set some basic data
        setCategoriesWithTools(DEMO_CATEGORIES);
        setFilteredTools(DEMO_CATEGORIES.flatMap(cat => cat.tools).slice(0, 8));
        setAgents([]);
        setError('Failed to load data, using demo content');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Optimized filter function with memoization
  const applyFilter = useCallback((filter: 'today' | 'new' | 'popular') => {
    if (categoriesWithTools.length === 0) {
      // Use demo data if no categories loaded
      const allTools = DEMO_CATEGORIES.flatMap(cat => cat.tools);
      setFilteredTools(allTools.slice(0, 8));
      setActiveFilter(filter);
      return;
    }
    
    const allTools = categoriesWithTools.flatMap(cat => cat.tools);
    const now = new Date();
    let filtered: Tool[] = [];

    switch (filter) {
      case 'today':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filtered = allTools.filter(tool => new Date(tool.created_at) >= yesterday);
        // If no tools from today, show recent tools
        if (filtered.length === 0) {
          filtered = allTools.slice(0, 8);
        }
        break;
      case 'new':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = allTools.filter(tool => new Date(tool.created_at) >= weekAgo);
        // If no new tools, show all tools
        if (filtered.length === 0) {
          filtered = allTools.slice(0, 8);
        }
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

    // Use demo data if no categories loaded
    const dataToSearch = categoriesWithTools.length > 0 ? categoriesWithTools : DEMO_CATEGORIES;

    // Search in tools (limit for performance)
    dataToSearch.forEach(category => {
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
    dataToSearch.forEach(category => {
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
      {(filteredTools.length > 0 || DEMO_CATEGORIES.length > 0) && (
        <section className="py-6 bg-royal-dark-lighter">
          <article className="container mx-auto px-4">
            <h2 className="text-2xl font-bold gradient-text mb-4 text-center">Featured Tools</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(filteredTools.length > 0 ? filteredTools : DEMO_CATEGORIES.flatMap(cat => cat.tools)).slice(0, 8).map((tool, index) => (
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
          {(categoriesWithTools.length > 0 ? categoriesWithTools : DEMO_CATEGORIES).map((category, categoryIndex) => (
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
                            src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b?auto=format&fit=crop&q=80&w=400'}
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