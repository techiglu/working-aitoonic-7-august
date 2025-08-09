import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Bot, Search, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Feature {
  title: string;
  description: string;
}

interface UseCase {
  title: string;
  description: string;
}

interface PricingPlan {
  plan: string;
  price: string;
  features: string[];
}

interface EditingItem {
  id?: string;
  name?: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  image_alt?: string;
  how_to_use?: string;
  published_at?: string;
  rating?: number;
  featured?: boolean;
  slug?: string;
  icon?: string;
  features?: Feature[];
  useCases?: UseCase[];
  pricing?: PricingPlan[];
  type?: 'tool' | 'category' | 'agent';
  image_url?: string;
  url?: string;
  category_id?: string;
  capabilities?: string[];
  api_endpoint?: string;
  pricing_type?: string;
  status?: string;
  is_available_24_7?: boolean;
  user_count?: number;
  has_fast_response?: boolean;
  is_secure?: boolean;
  contentType?: string;
  // Blog post fields
  title?: string;
  content?: string;
  excerpt?: string;
  author_id?: string;
  cover_image?: string;
  [key: string]: any;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'categories' | 'agents' | 'blog_posts'>('tools');
  const [items, setItems] = useState<EditingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EditingItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<EditingItem[]>([]);

  useEffect(() => {
    fetchItems();
    if (activeTab === 'tools') {
      fetchCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    // Filter items based on search term
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from(activeTab);
    
    if (activeTab === 'tools') {
      query = query.select(`
        id, name, description, url, category_id, image_url, favicon_url,
        rating, seo_title, seo_description, image_alt, how_to_use,
        published_at, featured, slug, features, useCases, pricing, created_at
      `);
    } else if (activeTab === 'categories') {
      query = query.select(`
        id, name, description, seo_title, seo_description, slug,
        icon, image_url, created_at
      `);
    } else if (activeTab === 'agents') {
      query = query.select('*');
    } else if (activeTab === 'blog_posts') {
      query = query.select(`
        id, title, content, excerpt, author_id, published_at,
        slug, cover_image, created_at
      `);
    }
    
    const { data: items } = await query.order('created_at', { ascending: false });
    
    setItems(items || []);
    setFilteredItems(items || []);
    setLoading(false);
  };

  const validateForm = (item: EditingItem): string | null => {
    if (!item.name?.trim()) return 'Name is required';
    if (activeTab !== 'blog_posts' && !item.description?.trim()) return 'Description is required';
    
    if (activeTab === 'blog_posts') {
      if (!item.title?.trim()) return 'Title is required';
      if (!item.content?.trim()) return 'Content is required';
      if (!item.slug?.trim()) return 'Slug is required';
    }
    
    if (activeTab === 'tools') {
      if (!item.url?.trim()) return 'Tool URL is required';
      if (!item.category_id) return 'Category is required';
    }
    
    return null;
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Validate form
    const validationError = validateForm(editingItem);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      // Prepare base data
      let dataToSave: any = {
        name: editingItem.name?.trim(),
        description: editingItem.description?.trim(),
        seo_title: editingItem.seo_title?.trim() || null,
        seo_description: editingItem.seo_description?.trim() || null,
        image_url: editingItem.image_url?.trim() || null,
      };

      // Add specific fields based on type
      if (activeTab === 'tools') {
        dataToSave = {
          ...dataToSave,
          url: editingItem.url?.trim(),
          category_id: editingItem.category_id,
          features: editingItem.features || [],
          useCases: editingItem.useCases || [],
          pricing: editingItem.pricing || []
        };
      } else if (activeTab === 'agents') {
        dataToSave = {
          ...dataToSave,
          capabilities: editingItem.capabilities?.filter(cap => cap.trim()) || [],
          api_endpoint: editingItem.api_endpoint?.trim() || null,
          pricing_type: editingItem.pricing_type || 'free',
          status: editingItem.status || 'active',
          is_available_24_7: editingItem.is_available_24_7 || false,
          user_count: editingItem.user_count || 0,
          has_fast_response: editingItem.has_fast_response || false,
          is_secure: editingItem.is_secure || false
        };
      }

      let result;
      if (editingItem.id) {
        // Update existing item
        result = await supabase
          .from(activeTab)
          .update(dataToSave)
          .eq('id', editingItem.id)
          .select();
      } else {
        // Insert new item
        result = await supabase
          .from(activeTab)
          .insert([dataToSave])
          .select();
      }

      if (result.error) {
        console.error('Error saving:', result.error);
        toast.error('Error saving item: ' + result.error.message);
        return;
      }

      toast.success(`${activeTab.slice(0, -1)} saved successfully!`);
      fetchItems();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error saving item');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (!editingItem) return;
    const features = editingItem.features || [];
    setEditingItem({
      ...editingItem,
      features: [...features, { title: '', description: '' }]
    });
  };

  const removeFeature = (index: number) => {
    if (!editingItem?.features) return;
    const features = [...editingItem.features];
    features.splice(index, 1);
    setEditingItem({ ...editingItem, features });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    if (!editingItem?.features) return;
    const features = [...editingItem.features];
    features[index] = { ...features[index], [field]: value };
    setEditingItem({ ...editingItem, features });
  };

  const addUseCase = () => {
    if (!editingItem) return;
    const useCases = editingItem.useCases || [];
    setEditingItem({
      ...editingItem,
      useCases: [...useCases, { title: '', description: '' }]
    });
  };

  const removeUseCase = (index: number) => {
    if (!editingItem?.useCases) return;
    const useCases = [...editingItem.useCases];
    useCases.splice(index, 1);
    setEditingItem({ ...editingItem, useCases });
  };

  const updateUseCase = (index: number, field: keyof UseCase, value: string) => {
    if (!editingItem?.useCases) return;
    const useCases = [...editingItem.useCases];
    useCases[index] = { ...useCases[index], [field]: value };
    setEditingItem({ ...editingItem, useCases });
  };

  const addPricingPlan = () => {
    if (!editingItem) return;
    const pricing = editingItem.pricing || [];
    setEditingItem({
      ...editingItem,
      pricing: [...pricing, { plan: '', price: '', features: [] }]
    });
  };

  const removePricingPlan = (index: number) => {
    if (!editingItem?.pricing) return;
    const pricing = [...editingItem.pricing];
    pricing.splice(index, 1);
    setEditingItem({ ...editingItem, pricing });
  };

  const updatePricingPlan = (index: number, field: keyof PricingPlan, value: any) => {
    if (!editingItem?.pricing) return;
    const pricing = [...editingItem.pricing];
    pricing[index] = { ...pricing[index], [field]: value };
    setEditingItem({ ...editingItem, pricing });
  };

  const addCapability = () => {
    if (!editingItem) return;
    const capabilities = editingItem.capabilities || [];
    setEditingItem({
      ...editingItem,
      capabilities: [...capabilities, '']
    });
  };

  const removeCapability = (index: number) => {
    if (!editingItem?.capabilities) return;
    const capabilities = [...editingItem.capabilities];
    capabilities.splice(index, 1);
    setEditingItem({ ...editingItem, capabilities });
  };

  const updateCapability = (index: number, value: string) => {
    if (!editingItem?.capabilities) return;
    const capabilities = [...editingItem.capabilities];
    capabilities[index] = value;
    setEditingItem({ ...editingItem, capabilities });
  };

  return (
    <main className="min-h-screen bg-royal-dark py-12">
      <article className="container mx-auto px-4">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'tools' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Tools</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'categories' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'agents' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Agents</span>
            </button>
            <button
              onClick={() => setActiveTab('blog_posts')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'blog_posts' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>📝</span>
              <span>Blog Posts</span>
            </button>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Items List */}
          <aside className="md:col-span-1 bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Items</h2>
              <button
                onClick={() => setEditingItem({ type: activeTab.slice(0, -1) as any })}
                className="p-2 text-royal-gold hover:bg-royal-dark rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </header>

            {/* Search Input */}
            <section className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold text-sm"
              />
            </section>

            {loading ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <button
                    onClick={() => setEditingItem(item)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      editingItem?.id === item.id
                        ? 'bg-royal-gold/10 border border-royal-gold'
                        : 'bg-royal-dark hover:bg-royal-dark-lighter'
                    }`}
                  >
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    </button>
                  </li>
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    {searchTerm ? 'No items found matching your search' : 'No items found'}
                  </p>
                )}
              </ul>
            )}
          </aside>

          {/* Edit Form */}
          <section className="md:col-span-2">
            {editingItem && (
              <article className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
                <header className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingItem.id ? 'Edit Item' : 'New Item'}
                  </h2>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
                  </button>
                </header>

                {/* How to Use Section */}
                <section className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter mb-6">
                  <h3 className="text-lg font-semibold mb-4">How to Use Admin Panel</h3>
                  <article className="space-y-4 text-sm text-gray-300">
                    <section>
                      <h4 className="font-medium text-white mb-2">Quick Start Guide:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Click the "+" button to add new tools, categories, or agents</li>
                        <li>Fill in all required fields (marked with "*")</li>
                        <li>Add SEO title and description for better search rankings</li>
                        <li>Use high-quality images (1200x630px recommended)</li>
                        <li>Save and publish your content</li>
                      </ul>
                    </section>
                    <section>
                      <h4 className="font-medium text-white mb-2">Adding New Items:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Click the "+" button next to "Items" to create new tools, categories, or agents</li>
                        <li>Fill in all required fields marked with "*"</li>
                        <li>Add SEO title and description for better search rankings</li>
                        <li>Use high-quality images (preferably 1200x630px for tools)</li>
                      </ul>
                    </section>
                    <section>
                      <h4 className="font-medium text-white mb-2">Managing Content:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Use the search bar to quickly find specific items</li>
                        <li>Click on any item in the list to edit it</li>
                        <li>For tools: Add features, use cases, and pricing information</li>
                        <li>For agents: Configure capabilities and availability settings</li>
                      </ul>
                    </section>
                    <section>
                      <h4 className="font-medium text-white mb-2">Best Practices:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Keep descriptions concise but informative (150-200 characters)</li>
                        <li>Use consistent naming conventions</li>
                        <li>Add pricing information to help users make decisions</li>
                        <li>Regularly update tool information to keep it current</li>
                      </ul>
                    </section>
                    <section>
                      <h4 className="font-medium text-white mb-2">Content Guidelines:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Write clear, descriptive titles and descriptions</li>
                        <li>Add accurate pricing information when available</li>
                        <li>Include relevant features and use cases</li>
                        <li>Use proper categorization for better discoverability</li>
                        <li>Ensure all links are working and up-to-date</li>
                      </ul>
                    </section>
                  </article>
                </section>

                <form className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic Info */}
                  <fieldset>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <section className="space-y-4">
                      {activeTab !== 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editingItem.name || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            required
                          />
                        </section>
                      )}
                      
                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={editingItem.title || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            required
                          />
                        </section>
                      )}

                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Slug *
                          </label>
                          <input
                            type="text"
                            value={editingItem.slug || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="url-friendly-slug"
                            required
                          />
                        </section>
                      )}

                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Excerpt
                          </label>
                          <textarea
                            value={editingItem.excerpt || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Brief description for the blog post"
                          />
                        </section>
                      )}

                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Content *
                          </label>
                          <textarea
                            value={editingItem.content || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                            rows={10}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Write your blog post content here..."
                            required
                          />
                        </section>
                      )}

                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cover Image URL
                          </label>
                          <input
                            type="text"
                            value={editingItem.cover_image || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, cover_image: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="https://example.com/cover-image.jpg"
                          />
                        </section>
                      )}

                      {activeTab === 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Author ID
                          </label>
                          <input
                            type="text"
                            value={editingItem.author_id || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, author_id: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Author UUID"
                          />
                        </section>
                      )}

                      {activeTab !== 'blog_posts' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description {activeTab !== 'blog_posts' ? '*' : ''}
                          </label>
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            required={activeTab !== 'blog_posts'}
                        SEO Title
                        </section>
                      )}

                        value={editingItem.seo_title || ''}
                        onChange={(e) => setEditingItem({...editingItem, seo_title: e.target.value})}
                          Image URL
                        placeholder="SEO optimized title (max 60 chars)"
                        maxLength={60}
                        <input
                          type="text"
                          value={editingItem.image_url || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          placeholder="https://example.com/image.jpg"
                        />
                      </section>

                      {activeTab === 'tools' && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Image Alt Text
                          </label>
                          <input
                            type="text"
                            value={editingItem.image_alt || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, image_alt: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        SEO Description
                          />
                      <textarea
                        value={editingItem.seo_description || ''}
                        onChange={(e) => setEditingItem({...editingItem, seo_description: e.target.value})}
                        <section>
                        placeholder="SEO optimized description (max 160 chars)"
                        maxLength={160}
                        rows={2}
                            Icon
                          </label>
                          <input
                            type="text"
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editingItem.slug || ''}
                      onChange={(e) => setEditingItem({...editingItem, slug: e.target.value})}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="url-friendly-name"
                      pattern="[a-z0-9-]+"
                    />
                  </div>
                            value={editingItem.icon || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Lucide icon name (e.g., 'sparkles') or icon URL"
                          />
                        </section>
                      )}

                      {(activeTab === 'tools' || activeTab === 'categories') && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={editingItem.slug || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="url-friendly-slug"
                          />
                        </section>
                      )}

                      {(activeTab === 'tools' || activeTab === 'blog_posts') && (
                        <section>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Published At
                          </label>
                          <input
                            type="datetime-local"
                            value={editingItem.published_at ? new Date(editingItem.published_at).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditingItem({ ...editingItem, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          />
                        </section>
                      )}

                      {activeTab === 'tools' && (
                        <section className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Rating (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={editingItem.rating || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) || null })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editingItem.featured || false}
                                onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-gray-300">Featured Tool</span>
                            </label>
                          </div>
                        </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={editingItem.image_alt || ''}
                        onChange={(e) => setEditingItem({...editingItem, image_alt: e.target.value})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        placeholder="Descriptive alt text for the image"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={editingItem.slug || ''}
                        onChange={(e) => setEditingItem({...editingItem, slug: e.target.value})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        placeholder="url-friendly-name"
                        pattern="[a-z0-9-]+"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editingItem.rating || ''}
                        onChange={(e) => setEditingItem({...editingItem, rating: parseFloat(e.target.value) || null})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Published Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editingItem.published_at ? new Date(editingItem.published_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditingItem({...editingItem, published_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={editingItem.featured || false}
                          onChange={(e) => setEditingItem({...editingItem, featured: e.target.checked})}
                          className="w-4 h-4 text-royal-gold bg-royal-dark border-royal-dark-lighter rounded focus:ring-royal-gold focus:ring-2"
                        />
                        <span>Featured Tool</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={editingItem.seo_title || ''}
                        onChange={(e) => setEditingItem({...editingItem, seo_title: e.target.value})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        placeholder="SEO optimized title (max 60 chars)"
                        maxLength={60}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        value={editingItem.seo_description || ''}
                        onChange={(e) => setEditingItem({...editingItem, seo_description: e.target.value})}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        placeholder="SEO optimized description (max 160 chars)"
                        maxLength={160}
                        rows={2}
                      />
                    </div>
                  </div>
                      )}
                    </section>
                  </fieldset>

                  {/* How to Use Section (Tools Only) */}
                  {activeTab === 'tools' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      <h3 className="text-lg font-semibold mb-4">How to Use This Tool</h3>
                      <section>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Usage Instructions
                        </label>
                        <textarea
                          value={editingItem.how_to_use || ''}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How to Use This Tool
                    </label>
                    <textarea
                      value={editingItem.how_to_use || ''}
                      onChange={(e) => setEditingItem({...editingItem, how_to_use: e.target.value})}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      rows={6}
                      placeholder="Step-by-step instructions on how to use this tool..."
                    />
                  </div>

                          onChange={(e) => setEditingItem({ ...editingItem, how_to_use: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          placeholder="Provide step-by-step instructions on how to use this tool..."
                        />
                      </section>
                    </fieldset>
                  )}

                  {/* Content Type Selection */}
                  {activeTab !== 'blog_posts' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      {/* Content Type Selection */}
                      <fieldset>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Content Type
                        </label>
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="contentType"
                              value="human"
                              checked={editingItem.contentType === 'human' || !editingItem.contentType}
                              onChange={(e) => setEditingItem({ ...editingItem, contentType: e.target.value })}
                              className="text-royal-gold"
                            />
                            <span className="text-gray-300">Human Created</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="contentType"
                              value="ai"
                              checked={editingItem.contentType === 'ai'}
                              onChange={(e) => setEditingItem({ ...editingItem, contentType: e.target.value })}
                              className="text-royal-gold"
                            />
                            <span className="text-gray-300">AI Generated</span>
                          </label>
                        </div>
                      </fieldset>
                    </fieldset>
                  )}

                      {/* Tool-specific fields */}
                      {activeTab === 'tools' && (
                        <>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tool URL *
                            </label>
                            <input
                              type="text"
                              value={editingItem.url || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="https://example.com"
                              required
                            />
                          </section>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Category *
                            </label>
                            <select
                              value={editingItem.category_id || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </section>
                        </>
                      )}

                      {/* Agent-specific fields */}
                      {activeTab === 'agents' && (
                        <>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              API Endpoint
                            </label>
                            <input
                              type="text"
                              value={editingItem.api_endpoint || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, api_endpoint: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="https://api.example.com"
                            />
                          </section>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Pricing Type
                            </label>
                            <select
                              value={editingItem.pricing_type || 'free'}
                              onChange={(e) => setEditingItem({ ...editingItem, pricing_type: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            >
                              <option value="free">Free</option>
                              <option value="freemium">Freemium</option>
                              <option value="paid">Paid</option>
                            </select>
                          </section>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Status
                            </label>
                            <select
                              value={editingItem.status || 'active'}
                              onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </section>
                          <section>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              User Count
                            </label>
                            <input
                              type="number"
                              value={editingItem.user_count || 0}
                              onChange={(e) => setEditingItem({ ...editingItem, user_count: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </section>
                          <fieldset className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editingItem.is_available_24_7 || false}
                                onChange={(e) => setEditingItem({ ...editingItem, is_available_24_7: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-gray-300">24/7 Available</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editingItem.has_fast_response || false}
                                onChange={(e) => setEditingItem({ ...editingItem, has_fast_response: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-gray-300">Fast Response</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editingItem.is_secure || false}
                                onChange={(e) => setEditingItem({ ...editingItem, is_secure: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-gray-300">Secure</span>
                            </label>
                          </fieldset>
                        </>
                      )}
                    </section>
                  </fieldset>

                  {/* SEO Settings */}
                  <fieldset className="border-t border-royal-dark-lighter pt-6">
                    <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                    <section className="space-y-4">
                      <section>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SEO Title
                          <mark className="text-xs text-gray-400 ml-2">(60 characters max)</mark>
                        </label>
                        <input
                          type="text"
                          value={editingItem.seo_title || ''}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 60);
                            setEditingItem({ ...editingItem, seo_title: value });
                          }}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          placeholder="Enter SEO title"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {(editingItem.seo_title?.length || 0)}/60 characters
                        </p>
                      </section>

                      <section>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SEO Description
                          <mark className="text-xs text-gray-400 ml-2">(160 characters max)</mark>
                        </label>
                        <textarea
                          value={editingItem.seo_description || ''}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 160);
                            setEditingItem({ ...editingItem, seo_description: value });
                          }}
                          rows={3}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          placeholder="Enter SEO description"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {(editingItem.seo_description?.length || 0)}/160 characters
                        </p>
                      </section>
                    </section>
                  </fieldset>

                  {/* Capabilities (for agents) */}
                  {activeTab === 'agents' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      <header className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Capabilities</h3>
                        <button
                          onClick={addCapability}
                          className="text-royal-gold hover:text-royal-gold/80"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </header>
                      <section className="space-y-4">
                        {editingItem.capabilities?.map((capability, index) => (
                          <section key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={capability}
                              onChange={(e) => updateCapability(index, e.target.value)}
                              placeholder="Enter capability"
                              className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                            <button
                              onClick={() => removeCapability(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </section>
                        ))}
                      </section>
                    </fieldset>
                  )}

                  {/* Features (for tools) */}
                  {activeTab === 'tools' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      <header className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Features</h3>
                        <button
                          onClick={addFeature}
                          className="text-royal-gold hover:text-royal-gold/80"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </header>
                      <section className="space-y-4">
                        {editingItem.features?.map((feature, index) => (
                          <article key={index} className="bg-royal-dark p-4 rounded-lg">
                            <header className="flex justify-between items-start mb-2">
                              <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                placeholder="Feature title"
                                className="flex-1 px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold mr-4"
                              />
                              <button
                                onClick={() => removeFeature(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </header>
                            <textarea
                              value={feature.description}
                              onChange={(e) => updateFeature(index, 'description', e.target.value)}
                              placeholder="Feature description"
                              rows={2}
                              className="w-full px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </article>
                        ))}
                      </section>
                    </fieldset>
                  )}

                  {/* Use Cases (for tools) */}
                  {activeTab === 'tools' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      <header className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Use Cases</h3>
                        <button
                          onClick={addUseCase}
                          className="text-royal-gold hover:text-royal-gold/80"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </header>
                      <section className="space-y-4">
                        {editingItem.useCases?.map((useCase, index) => (
                          <article key={index} className="bg-royal-dark p-4 rounded-lg">
                            <header className="flex justify-between items-start mb-2">
                              <input
                                type="text"
                                value={useCase.title}
                                onChange={(e) => updateUseCase(index, 'title', e.target.value)}
                                placeholder="Use case title"
                                className="flex-1 px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold mr-4"
                              />
                              <button
                                onClick={() => removeUseCase(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </header>
                            <textarea
                              value={useCase.description}
                              onChange={(e) => updateUseCase(index, 'description', e.target.value)}
                              placeholder="Use case description"
                              rows={2}
                              className="w-full px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </article>
                        ))}
                      </section>
                    </fieldset>
                  )}

                  {/* Pricing (for tools) */}
                  {activeTab === 'tools' && (
                    <fieldset className="border-t border-royal-dark-lighter pt-6">
                      <header className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Pricing Plans</h3>
                        <button
                          onClick={addPricingPlan}
                          className="text-royal-gold hover:text-royal-gold/80"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </header>
                      <section className="space-y-4">
                        {editingItem.pricing?.map((plan, index) => (
                          <article key={index} className="bg-royal-dark p-4 rounded-lg">
                            <header className="flex justify-between items-start mb-4">
                              <section className="flex-1 grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  value={plan.plan}
                                  onChange={(e) => updatePricingPlan(index, 'plan', e.target.value)}
                                  placeholder="Plan name"
                                  className="px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <input
                                  type="text"
                                  value={plan.price}
                                  onChange={(e) => updatePricingPlan(index, 'price', e.target.value)}
                                  placeholder="Price"
                                  className="px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                              </section>
                              <button
                                onClick={() => removePricingPlan(index)}
                                className="ml-4 text-gray-400 hover:text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </header>
                            <textarea
                              value={plan.features.join('\n')}
                              onChange={(e) => updatePricingPlan(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                              placeholder="Features (one per line)"
                              rows={3}
                              className="w-full px-4 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </article>
                        ))}
                      </section>
                    </fieldset>
                  )}
                </form>
              </article>
            )}
          </section>
        </section>
      </article>
    </main>
  );
};

export default Admin;