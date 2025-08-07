import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Bot, ExternalLink, ChevronRight, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { generateToolSchema } from '../utils/schema';

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  favicon_url?: string;
  rating: number;
  seo_title?: string;
  seo_description?: string;
  features?: {
    title: string;
    description: string;
  }[];
  useCases?: {
    title: string;
    description: string;
  }[];
  pricing?: {
    plan: string;
    price: string;
    features: string[];
  }[];
}

interface Category {
  id: string;
  name: string;
}

function ToolDetail() {
  const { slug } = useParams();
  const [tool, setTool] = useState<Tool | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [similarTools, setSimilarTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: toolData } = await supabase
          .from('tools')
          .select('*, categories!inner(*)')
          .ilike('name', slug?.replace(/-/g, ' ') || '')
          .single();
      
        if (toolData) {
          setTool(toolData);
          setCategory(toolData.categories);

          // Fetch similar tools from the same category
          const { data: similarToolsData } = await supabase
            .from('tools')
            .select('*')
            .eq('category_id', toolData.category_id)
            .neq('id', toolData.id)
            .limit(4);

          if (similarToolsData) {
            setSimilarTools(similarToolsData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-royal-dark flex items-center justify-center">
        <div className="text-royal-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Tool Not Found</h1>
            <p className="text-gray-400 mb-8">The tool you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/categories"
              className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {tool && (
        <SEO
          title={tool.seo_title || tool.name}  // Set title based on seo_title or tool.name
          description={tool.seo_description || tool.description}  // Set description based on seo_description or tool.description
          image={tool.image_url}
          type="product"
          schema={generateToolSchema(tool)}
        />
      )}

      <main className="min-h-screen bg-royal-dark py-20">
        <article className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            {category && (
              <>
                <Link
                  to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-400 hover:text-white"
                >
                  {category.name}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </>
            )}
            <mark className="text-gray-300">{tool.name}</mark>
          </nav>

          {/* Tool Details */}
          <section className="max-w-4xl mx-auto bg-royal-dark-card rounded-2xl overflow-hidden border border-royal-dark-lighter">
            <figure className="aspect-[16/9] relative">
              <LazyImage
                src={tool.image_url || 'https://i.imgur.com/ZXqf6Kx.png'}
                alt={tool.name}
                width={1200}
                height={675}
                priority={true}
                className="w-full h-full object-cover"
              />
              <aside className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </figure>

            <article className="p-4 sm:p-8">
              {/* Tool Name and Rating */}
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <hgroup className="flex-1">
                  <section className="flex items-center space-x-4 mb-4">
                    {tool.favicon_url ? (
                      <img 
                        src={tool.favicon_url} 
                        alt={`${tool.name} logo`}
                        className="w-12 h-12 rounded-lg object-contain bg-white p-2"
                      />
                    ) : (
                      <Bot className="w-12 h-12 text-royal-gold" />
                    )}
                    <hgroup>
                      <h1 className="text-3xl font-bold gradient-text">{tool.name}</h1>
                      <aside className="flex flex-wrap items-center gap-4 mt-2">
                        {tool.rating && (
                          <section className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className="w-5 h-5 text-royal-gold" 
                                fill={i < Math.floor(tool.rating) ? "currentColor" : "none"}
                              />
                            ))}
                            <mark className="ml-2 text-gray-300">({tool.rating})</mark>
                          </section>
                        )}
                        {category && (
                          <Link
                            to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-royal-gold hover:text-royal-gold/80 transition-colors"
                          >
                            {category.name}
                          </Link>
                        )}
                      </aside>
                    </hgroup>
                  </section>
                  <p className="text-gray-300 text-lg">{tool.description}</p>
                </hgroup>
                {tool.pricing && tool.pricing.length > 0 && (
                  <aside className="flex items-center space-x-2 bg-royal-dark rounded-full px-4 py-2">
                    <DollarSign className="w-5 h-5 text-royal-gold" />
                    <mark className="text-royal-gold font-medium">
                      {tool.pricing[0].price}
                    </mark>
                  </aside>
                )}
              </header>

              {/* Action Buttons */}
              <nav className="flex flex-wrap gap-4">
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
                  >
                    Try Tool Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
                {similarTools.length > 0 && (
                  <Link
                    to={`/compare/${tool.name.toLowerCase().replace(/\s+/g, '-')}-vs-${similarTools[0].name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center border-2 border-royal-gold text-royal-gold px-6 py-3 rounded-lg font-bold hover:bg-royal-gold hover:text-royal-dark transition-all"
                  >
                    Compare with {similarTools[0].name}
                  </Link>
                )}
              </nav>
            </article>
          </section>

          {/* Features and Use Cases */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <article className="lg:col-span-2 space-y-8">
              {/* Features */}
              {tool.features && tool.features.length > 0 && (
                <section className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                  <ul className="grid md:grid-cols-2 gap-6">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <article>
                          <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                          <p className="text-gray-400">{feature.description}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Use Cases */}
              {tool.useCases && tool.useCases.length > 0 && (
                <section className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
                  <ul className="grid md:grid-cols-2 gap-6">
                    {tool.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <article>
                          <h3 className="font-semibold text-white mb-1">{useCase.title}</h3>
                          <p className="text-gray-400">{useCase.description}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          </section>
        </article>
      </main>
    </>
  );
}

export default ToolDetail;