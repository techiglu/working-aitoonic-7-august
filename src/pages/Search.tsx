import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ChevronRight, Bot, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: 'tool' | 'agent' | 'category';
  image_url?: string;
  category_name?: string;
}

function Search() {
  const { term } = useParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const decodedTerm = decodeURIComponent(term || '');

  useEffect(() => {
    async function fetchSearchResults() {
      setLoading(true);
      try {
        // Record search term
        if (decodedTerm.trim()) {
          await supabase.rpc('upsert_search_term', {
            search_term: decodedTerm.trim().toLowerCase()
          });
        }

        // Search in tools
        const { data: toolsData } = await supabase
          .from('tools')
          .select(`
            id,
            name,
            description,
            image_url,
            categories (
              name
            )
          `)
          .or(`name.ilike.%${decodedTerm}%,description.ilike.%${decodedTerm}%`);

        // Search in agents
        const { data: agentsData } = await supabase
          .from('agents')
          .select('id, name, description, image_url')
          .or(`name.ilike.%${decodedTerm}%,description.ilike.%${decodedTerm}%,capabilities.cs.{${decodedTerm}}`);

        // Search in categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, description')
          .or(`name.ilike.%${decodedTerm}%,description.ilike.%${decodedTerm}%`);

        const formattedResults: SearchResult[] = [
          ...(toolsData?.map(tool => ({
            ...tool,
            type: 'tool' as const,
            category_name: tool.categories?.name
          })) || []),
          ...(agentsData?.map(agent => ({
            ...agent,
            type: 'agent' as const
          })) || []),
          ...(categoriesData?.map(category => ({
            ...category,
            type: 'category' as const
          })) || [])
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (decodedTerm) {
      fetchSearchResults();
    }
  }, [decodedTerm]);

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'tool':
        return `/ai/${result.name.toLowerCase().replace(/\s+/g, '-')}`;
      case 'agent':
        return `/ai-agent/${result.name.toLowerCase().replace(/\s+/g, '-')}`;
      case 'category':
        return `/category/${result.name.toLowerCase().replace(/\s+/g, '-')}`;
    }
  };

  return (
    <>
      <SEO
        title={`Search results for "${decodedTerm}" | Aitoonic`}
        description={`Browse AI tools and agents matching "${decodedTerm}". Find the perfect AI solutions for your needs.`}
      />

      <main className="min-h-screen bg-royal-dark py-20">
        <article className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <mark className="text-gray-300">Search</mark>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <mark className="text-gray-300">{decodedTerm}</mark>
          </nav>

          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-6 gradient-text">
              Search Results for "{decodedTerm}"
            </h1>
            <p className="text-xl text-gray-300">
              Found {results.length} results matching your search
            </p>
          </header>

          {loading ? (
            <section className="flex items-center justify-center py-12">
              <p className="text-royal-gold text-xl">Loading...</p>
            </section>
          ) : results.length === 0 ? (
            <section className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-royal-gold mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
              <p className="text-gray-400 mb-8">
                Try searching with different keywords or browse our categories
              </p>
              <footer>
                <Link
                  to="/categories"
                  className="inline-flex items-center bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
                >
                  Browse Categories
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </footer>
            </section>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((result) => (
                <article
                  key={`${result.type}-${result.id}`}
                  className="bg-royal-dark-card rounded-xl overflow-hidden border border-royal-dark-lighter group hover:border-royal-gold transition-colors"
                >
                  {result.image_url && (
                    <figure className="aspect-video relative overflow-hidden">
                      <img
                        src={result.image_url}
                        alt={result.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </figure>
                  )}
                  <section className="p-6">
                    <header className="flex items-center space-x-3 mb-4">
                      {result.type === 'agent' && <Bot className="w-6 h-6 text-royal-gold" />}
                      {result.type === 'tool' && <SearchIcon className="w-6 h-6 text-royal-gold" />}
                      <hgroup>
                        <h2 className="text-xl font-bold text-white group-hover:text-royal-gold transition-colors">
                          {result.name}
                        </h2>
                        {result.category_name && (
                          <p className="text-sm text-gray-400">
                            {result.category_name}
                          </p>
                        )}
                      </hgroup>
                    </header>
                    <p className="text-gray-400 line-clamp-2">{result.description}</p>
                    <footer className="mt-4 flex items-center justify-between">
                      <mark className="text-sm text-royal-gold capitalize">{result.type}</mark>
                      <Link
                        to={getResultUrl(result)}
                        className="inline-flex items-center text-royal-gold group-hover:text-royal-gold/80"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </footer>
                  </section>
                </article>
              ))}
            </section>
          )}
    </>
  );
}

export default Search;