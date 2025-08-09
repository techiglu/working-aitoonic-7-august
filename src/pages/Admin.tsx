import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Tool {
  id?: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  favicon_url?: string;
  features: { title: string; description: string }[];
  useCases: { title: string; description: string }[];
  pricing: { plan: string; price: string; features: string[] }[];
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  rating?: number;
  featured?: boolean;
  image_alt?: string;
  how_to_use?: string;
  published_at?: string;
}

interface Category {
  id?: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
  slug?: string;
}

interface Agent {
  id?: string;
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

function Admin() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'tools' | 'categories' | 'agents'>('tools');
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchItems();
      fetchCategories();
    }
  }, [activeTab, session]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  }

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from(activeTab).select('*');
    if (data) setItems(data);
    setLoading(false);
  }

  function getEmptyItem() {
    switch (activeTab) {
      case 'tools':
        return {
          name: '',
          description: '',
          url: '',
          category_id: '',
          image_url: '',
          favicon_url: '',
          features: [],
          useCases: [],
          pricing: [],
          seo_title: '',
          seo_description: '',
          slug: '',
          rating: 0,
          featured: false,
          image_alt: '',
          how_to_use: '',
          published_at: ''
        };
      case 'categories':
        return {
          name: '',
          description: '',
          seo_title: '',
          seo_description: '',
          slug: ''
        };
      case 'agents':
        return {
          name: '',
          description: '',
          capabilities: [],
          api_endpoint: '',
          pricing_type: 'free',
          status: 'active',
          image_url: '',
          is_available_24_7: false,
          user_count: 0,
          has_fast_response: false,
          is_secure: false
        };
      default:
        return {};
    }
  }

  async function handleSave() {
    if (!editingItem) return;

    setLoading(true);
    try {
      if (editingItem.id) {
        const { error } = await supabase
          .from(activeTab)
          .update(editingItem)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Item updated successfully!');
      } else {
        const { error } = await supabase
          .from(activeTab)
          .insert([editingItem]);
        if (error) throw error;
        toast.success('Item created successfully!');
      }
      
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function addFeature() {
    if (activeTab === 'tools') {
      setEditingItem({
        ...editingItem,
        features: [...(editingItem.features || []), { title: '', description: '' }]
      });
    }
  }

  function removeFeature(index: number) {
    if (activeTab === 'tools') {
      const newFeatures = editingItem.features.filter((_: any, i: number) => i !== index);
      setEditingItem({ ...editingItem, features: newFeatures });
    }
  }

  function addUseCase() {
    if (activeTab === 'tools') {
      setEditingItem({
        ...editingItem,
        useCases: [...(editingItem.useCases || []), { title: '', description: '' }]
      });
    }
  }

  function removeUseCase(index: number) {
    if (activeTab === 'tools') {
      const newUseCases = editingItem.useCases.filter((_: any, i: number) => i !== index);
      setEditingItem({ ...editingItem, useCases: newUseCases });
    }
  }

  function addPricingPlan() {
    if (activeTab === 'tools') {
      setEditingItem({
        ...editingItem,
        pricing: [...(editingItem.pricing || []), { plan: '', price: '', features: [''] }]
      });
    }
  }

  function removePricingPlan(index: number) {
    if (activeTab === 'tools') {
      const newPricing = editingItem.pricing.filter((_: any, i: number) => i !== index);
      setEditingItem({ ...editingItem, pricing: newPricing });
    }
  }

  function addCapability() {
    if (activeTab === 'agents') {
      setEditingItem({
        ...editingItem,
        capabilities: [...(editingItem.capabilities || []), '']
      });
    }
  }

  function removeCapability(index: number) {
    if (activeTab === 'agents') {
      const newCapabilities = editingItem.capabilities.filter((_: any, i: number) => i !== index);
      setEditingItem({ ...editingItem, capabilities: newCapabilities });
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-royal-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-royal-dark py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold gradient-text mb-8">Admin Panel</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          {(['tools', 'categories', 'agents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-royal-gold text-royal-dark'
                  : 'bg-royal-dark-card text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Items List */}
          <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white capitalize">{activeTab}</h2>
              <button
                onClick={() => setEditingItem(getEmptyItem())}
                className="bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90"
              >
                Add New
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-royal-gold">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-royal-dark rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-royal-gold hover:text-royal-gold/80"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Form */}
          {editingItem && (
            <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingItem.id ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h2>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                  />
                </div>

                {/* Tool-specific fields */}
                {activeTab === 'tools' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                      <input
                        type="url"
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={editingItem.category_id || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={editingItem.image_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image Alt Text</label>
                      <input
                        type="text"
                        value={editingItem.image_alt || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image_alt: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
                      <input
                        type="url"
                        value={editingItem.favicon_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, favicon_url: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={editingItem.seo_title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seo_title: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                      <textarea
                        value={editingItem.seo_description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seo_description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                      <input
                        type="text"
                        value={editingItem.slug || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editingItem.rating || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Published At</label>
                      <input
                        type="datetime-local"
                        value={editingItem.published_at || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, published_at: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={editingItem.featured || false}
                        onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-300">Featured</label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">How to Use</label>
                      <textarea
                        value={editingItem.how_to_use || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, how_to_use: e.target.value })}
                        rows={4}
                        placeholder="Provide step-by-step instructions on how to use this tool..."
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Features</label>
                        <button
                          type="button"
                          onClick={addFeature}
                          className="text-royal-gold hover:text-royal-gold/80 text-sm"
                        >
                          Add Feature
                        </button>
                      </div>
                      {(editingItem.features || []).map((feature: any, index: number) => (
                        <div key={index} className="mb-4 p-4 bg-royal-dark rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Feature {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Feature title"
                            value={feature.title || ''}
                            onChange={(e) => {
                              const newFeatures = [...editingItem.features];
                              newFeatures[index] = { ...feature, title: e.target.value };
                              setEditingItem({ ...editingItem, features: newFeatures });
                            }}
                            className="w-full px-3 py-2 mb-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                          <textarea
                            placeholder="Feature description"
                            value={feature.description || ''}
                            onChange={(e) => {
                              const newFeatures = [...editingItem.features];
                              newFeatures[index] = { ...feature, description: e.target.value };
                              setEditingItem({ ...editingItem, features: newFeatures });
                            }}
                            rows={2}
                            className="w-full px-3 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Use Cases */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Use Cases</label>
                        <button
                          type="button"
                          onClick={addUseCase}
                          className="text-royal-gold hover:text-royal-gold/80 text-sm"
                        >
                          Add Use Case
                        </button>
                      </div>
                      {(editingItem.useCases || []).map((useCase: any, index: number) => (
                        <div key={index} className="mb-4 p-4 bg-royal-dark rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Use Case {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeUseCase(index)}
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Use case title"
                            value={useCase.title || ''}
                            onChange={(e) => {
                              const newUseCases = [...editingItem.useCases];
                              newUseCases[index] = { ...useCase, title: e.target.value };
                              setEditingItem({ ...editingItem, useCases: newUseCases });
                            }}
                            className="w-full px-3 py-2 mb-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                          <textarea
                            placeholder="Use case description"
                            value={useCase.description || ''}
                            onChange={(e) => {
                              const newUseCases = [...editingItem.useCases];
                              newUseCases[index] = { ...useCase, description: e.target.value };
                              setEditingItem({ ...editingItem, useCases: newUseCases });
                            }}
                            rows={2}
                            className="w-full px-3 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Pricing Plans</label>
                        <button
                          type="button"
                          onClick={addPricingPlan}
                          className="text-royal-gold hover:text-royal-gold/80 text-sm"
                        >
                          Add Plan
                        </button>
                      </div>
                      {(editingItem.pricing || []).map((plan: any, index: number) => (
                        <div key={index} className="mb-4 p-4 bg-royal-dark rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Plan {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removePricingPlan(index)}
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Plan name"
                            value={plan.plan || ''}
                            onChange={(e) => {
                              const newPricing = [...editingItem.pricing];
                              newPricing[index] = { ...plan, plan: e.target.value };
                              setEditingItem({ ...editingItem, pricing: newPricing });
                            }}
                            className="w-full px-3 py-2 mb-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                          <input
                            type="text"
                            placeholder="Price (e.g., $9.99/month)"
                            value={plan.price || ''}
                            onChange={(e) => {
                              const newPricing = [...editingItem.pricing];
                              newPricing[index] = { ...plan, price: e.target.value };
                              setEditingItem({ ...editingItem, pricing: newPricing });
                            }}
                            className="w-full px-3 py-2 mb-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                          <textarea
                            placeholder="Features (one per line)"
                            value={(plan.features || []).join('\n')}
                            onChange={(e) => {
                              const newPricing = [...editingItem.pricing];
                              newPricing[index] = { ...plan, features: e.target.value.split('\n').filter(f => f.trim()) };
                              setEditingItem({ ...editingItem, pricing: newPricing });
                            }}
                            rows={3}
                            className="w-full px-3 py-2 bg-royal-dark-lighter border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Category-specific fields */}
                {activeTab === 'categories' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={editingItem.seo_title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seo_title: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                      <textarea
                        value={editingItem.seo_description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seo_description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                      <input
                        type="text"
                        value={editingItem.slug || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>
                  </>
                )}

                {/* Agent-specific fields */}
                {activeTab === 'agents' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={editingItem.image_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">API Endpoint</label>
                      <input
                        type="url"
                        value={editingItem.api_endpoint || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, api_endpoint: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Type</label>
                      <select
                        value={editingItem.pricing_type || 'free'}
                        onChange={(e) => setEditingItem({ ...editingItem, pricing_type: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      >
                        <option value="free">Free</option>
                        <option value="freemium">Freemium</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={editingItem.status || 'active'}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">User Count</label>
                      <input
                        type="number"
                        value={editingItem.user_count || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, user_count: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="available_24_7"
                          checked={editingItem.is_available_24_7 || false}
                          onChange={(e) => setEditingItem({ ...editingItem, is_available_24_7: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="available_24_7" className="text-sm font-medium text-gray-300">Available 24/7</label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="fast_response"
                          checked={editingItem.has_fast_response || false}
                          onChange={(e) => setEditingItem({ ...editingItem, has_fast_response: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="fast_response" className="text-sm font-medium text-gray-300">Fast Response</label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="secure"
                          checked={editingItem.is_secure || false}
                          onChange={(e) => setEditingItem({ ...editingItem, is_secure: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="secure" className="text-sm font-medium text-gray-300">Secure</label>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Capabilities</label>
                        <button
                          type="button"
                          onClick={addCapability}
                          className="text-royal-gold hover:text-royal-gold/80 text-sm"
                        >
                          Add Capability
                        </button>
                      </div>
                      {(editingItem.capabilities || []).map((capability: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={capability}
                            onChange={(e) => {
                              const newCapabilities = [...editingItem.capabilities];
                              newCapabilities[index] = e.target.value;
                              setEditingItem({ ...editingItem, capabilities: newCapabilities });
                            }}
                            className="flex-1 px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded text-white focus:outline-none focus:border-royal-gold"
                          />
                          <button
                            type="button"
                            onClick={() => removeCapability(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-4 mt-6 pt-6 border-t border-royal-dark-lighter">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-3 border border-royal-dark-lighter text-gray-300 rounded-lg hover:text-white hover:border-royal-gold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;