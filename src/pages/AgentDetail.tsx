import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Bot, Globe, Zap, Check, ExternalLink, ChevronRight, Clock, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { generateAgentSchema } from '../utils/schema';
import { LazyImage } from '../components/LazyImage';

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

function AgentDetail() {
  const { slug } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [similarAgents, setSimilarAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('*')
          .ilike('name', slug?.replace(/-/g, ' ') || '')
          .single();
        
        if (agentError) {
          console.error('Error fetching agent:', agentError);
          return;
        }

        if (agentData) {
          setAgent(agentData);

          const { data: similarAgentsData } = await supabase
            .from('agents')
            .select('*')
            .neq('id', agentData.id)
            .eq('status', 'active')
            .limit(3);
          
          if (similarAgentsData) {
            setSimilarAgents(similarAgentsData);
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Agent Not Found</h1>
            <p className="text-gray-400 mb-8">The agent you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/ai-agent"
              className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Back to AI Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {agent && (
        <SEO
          title={`${agent.name} - Aitoonic.com`}
          description={agent.description}
          image={agent.image_url || 'https://aitoonic.com/og-image.jpg'}
          type="product"
          schema={generateAgentSchema(agent)}
        />
      )}

      <main className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <Link to="/ai-agent" className="text-gray-400 hover:text-white">AI Agents</Link>
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <mark className="text-gray-300">{agent.name}</mark>
          </nav>

          {/* Hero Section */}
          <article className="bg-royal-dark-card rounded-2xl overflow-hidden border border-royal-dark-lighter mb-12">
            <figure className="aspect-video">
              <LazyImage
                src={agent.image_url || 'https://i.imgur.com/NXyUxX7.png'}
                alt={agent.name}
                width={1200}
                height={675}
                priority={true}
                className="w-full h-full object-cover"
              />
            </figure>
            
            <section className="p-4 sm:p-8">
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <header className="flex items-center space-x-4 mb-4">
                    <Bot className="w-12 h-12 text-royal-gold" />
                    <div>
                      <h1 className="text-3xl font-bold gradient-text">{agent.name}</h1>
                      <aside className="flex items-center mt-2">
                        <Star className="w-5 h-5 text-royal-gold" fill="currentColor" />
                        <Star className="w-5 h-5 text-royal-gold" fill="currentColor" />
                        <Star className="w-5 h-5 text-royal-gold" fill="currentColor" />
                        <Star className="w-5 h-5 text-royal-gold" fill="currentColor" />
                        <Star className="w-5 h-5 text-royal-gold" fill="currentColor" />
                        <mark className="ml-2 text-gray-300">(50+ reviews)</mark>
                      </aside>
                    </div>
                  </header>
                  <p className="text-gray-300 text-lg">{agent.description}</p>
                </div>
                {agent.pricing_type && (
                  <mark className="text-sm font-medium px-4 py-2 rounded-full bg-royal-dark text-royal-gold">
                    {agent.pricing_type}
                  </mark>
                )}
              </header>

              <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {agent.is_available_24_7 && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Clock className="w-5 h-5 text-royal-gold flex-shrink-0" />
                    <p>24/7 Available</p>
                  </div>
                )}
                {agent.user_count > 0 && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Users className="w-5 h-5 text-royal-gold flex-shrink-0" />
                    <p>{agent.user_count.toLocaleString()}+ users</p>
                  </div>
                )}
                {agent.has_fast_response && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Zap className="w-5 h-5 text-royal-gold flex-shrink-0" />
                    <p>Fast Response</p>
                  </div>
                )}
                {agent.is_secure && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Shield className="w-5 h-5 text-royal-gold flex-shrink-0" />
                    <p>Secure & Private</p>
                  </div>
                )}
              </aside>

              {agent.api_endpoint && (
                <nav className="flex space-x-4">
                  <a
                    href={agent.api_endpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
                  >
                    Try Agent Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </nav>
              )}
            </section>
          </article>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <section className="lg:col-span-3">
              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter mb-12">
                  <h2 className="text-2xl font-bold mb-6">Capabilities</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {agent.capabilities.map((capability, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-royal-gold mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-white mb-1">{capability}</h3>
                          <p className="text-gray-400 text-sm">
                            Detailed explanation of how {agent.name} handles {capability.toLowerCase()}.
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              )}

              {/* Similar Agents */}
              {similarAgents.length > 0 && (
                <article className="bg-royal-dark-card rounded-2xl p-4 sm:p-8 border border-royal-dark-lighter">
                  <h2 className="text-2xl font-bold mb-6">Similar Agents</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {similarAgents.map((similarAgent) => (
                      <li key={similarAgent.id}>
                        <Link
                        to={`/ai-agent/${similarAgent.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group"
                      >
                        <figure className="aspect-video rounded-lg overflow-hidden mb-3">
                          <LazyImage
                            src={similarAgent.image_url || 'https://i.imgur.com/NXyUxX7.png'}
                            alt={similarAgent.name}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                        </figure>
                        <h3 className="font-semibold text-white group-hover:text-royal-gold transition-colors">
                          {similarAgent.name}
                        </h3>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default AgentDetail;