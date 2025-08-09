import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Bot, ExternalLink, ChevronRight, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { generateToolSchema } from '../utils/schema';
import { LazyImage } from '../components/LazyImage';

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
          .select(`
            id,
            name,
            description,
            url,
            category_id,
            image_url,
            favicon_url,
            rating,
            seo_title,
            seo_description,
            slug,
            image_alt,
            how_to_use,
            published_at,
            featured,
            features,
            useCases,
            pricing,
            categories!inner(id, name)
          `)
          .eq('slug', slug)
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
        />
      )}
      
      <main className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap pb-2">
              <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <Link to="/categories" className="text-gray-400 hover:text-white">Tools</Link>
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
            </div>
          </nav>

          {/* Tool Details */}
          <article className="max-w-4xl mx-auto bg-royal-dark-card rounded-2xl overflow-hidden border border-royal-dark-lighter">
            <figure className="aspect-[16/9] relative">
              <LazyImage
                src={tool.image_url || 'https://i.imgur.com/ZXqf6Kx.png'}
                alt={tool.image_alt || tool.name}
                width={1200}
                height={675}
                priority={true}
                className="w-full h-full object-cover"
              />
              <aside className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </figure>

            <section className="p-4 sm:p-8">
              {/* Tool Name and Rating */}
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <header className="flex items-center space-x-4 mb-4">
                    {tool.favicon_url ? (
                      <img 
                        src={tool.favicon_url} 
                        alt={`${tool.name} logo`}
                        className="w-12 h-12 rounded-lg object-contain bg-white p-2"
                      />
                    ) : (
                      <Bot className="w-12 h-12 text-royal-gold" />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold gradient-text">{tool.name}</h1>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {tool.rating && tool.rating > 0 && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className="w-5 h-5 text-royal-gold" 
                                fill={i < Math.floor(tool.rating) ? "currentColor" : "none"}
                              />
                            ))}
                            <mark className="ml-2 text-gray-300">({tool.rating})</mark>
                          </div>
                        )}
                        {tool.featured && (
                          <mark className="bg-royal-gold text-royal-dark px-3 py-1 rounded-full text-sm font-medium">
                            Featured
                          </mark>
                        )}
                        {tool.published_at && (
                          <span className="text-gray-400 text-sm">
                            Published: {new Date(tool.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {category && (
                          <Link
                            to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-royal-gold hover:text-royal-gold/80 transition-colors"
                          >
                            {category.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </header>
                  <p className="text-gray-300 text-lg">{tool.description}</p>
                </div>
                {tool.pricing && tool.pricing.length > 0 && (
                  <aside className="flex items-center space-x-2 bg-royal-dark rounded-full px-4 py-2">
                    <DollarSign className="w-5 h-5 text-royal-gold" />
                    <mark className="text-royal-gold font-medium">
                      {tool.pricing[0].price}
                    </mark>
                  </aside>
                )}
              </header>
              
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
            </section>
          </article>

          {/* Features and Use Cases */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Features */}
              {tool.features && tool.features.length > 0 && (
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                  <ul className="grid md:grid-cols-2 gap-6">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                          <p className="text-gray-400">{feature.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              )}

              {/* How to Use */}
              {tool.how_to_use && tool.how_to_use.trim() && (
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">How to Use This Tool</h2>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: tool.how_to_use.replace(/\n/g, '<br>') }} />
                  </div>
                </article>
              )}
              {/* Use Cases */}
              {tool.useCases && tool.useCases.length > 0 && (
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
                  <ul className="grid md:grid-cols-2 gap-6">
                    {tool.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{useCase.title}</h3>
                          <p className="text-gray-400">{useCase.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </div>

            {/* Pricing Plans */}
            {tool.pricing && tool.pricing.length > 0 && (
              <aside className="lg:col-span-1">
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter sticky top-8">
                  <h2 className="text-2xl font-bold mb-6">Pricing Plans</h2>
                  <ul className="space-y-6">
                    {tool.pricing.map((plan, index) => (
                      <li
                        key={index}
                        className={`bg-royal-dark rounded-lg p-6 border ${
                          index === 1 ? 'border-royal-gold' : 'border-royal-dark-lighter'
                        }`}
                      >
                        <header className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">{plan.plan}</h3>
                          <mark className="text-royal-gold font-bold text-xl">{plan.price}</mark>
                        </header>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start text-gray-300">
                              <span className="w-2 h-2 bg-royal-gold rounded-full mt-2 mr-3 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {index === 1 && (
                          <footer className="mt-4">
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all"
                            >
                              Get Started
                            </a>
                          </footer>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </aside>
            )}
          </section>

          {/* Similar Tools */}
          {similarTools.length > 0 && (
            <section className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter mt-8">
              <h2 className="text-2xl font-bold mb-8">Similar Tools in {category?.name}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarTools.map((similarTool) => (
                  <li key={similarTool.id}>
                    <Link
                      to={`/ai/${similarTool.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group block"
                    >
                      <figure className="aspect-video rounded-lg overflow-hidden mb-4">
                        <LazyImage
                          src={similarTool.image_url || 'https://i.imgur.com/ZXqf6Kx.png'}
                          alt={similarTool.image_alt || similarTool.name}
                          width={300}
                          height={169}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </figure>
                      <article>
                        <h3 className="font-semibold text-white group-hover:text-royal-gold transition-colors mb-2">
                          {similarTool.name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {similarTool.description}
                        </p>
                        {similarTool.rating && similarTool.rating > 0 && (
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className="w-3 h-3 text-royal-gold" 
                                fill={i < Math.floor(similarTool.rating) ? "currentColor" : "none"}
                              />
                            ))}
                            <span className="ml-1 text-xs text-gray-400">({similarTool.rating})</span>
                          </div>
                        )}
                      </article>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default ToolDetail;