import { Plus, Edit, Trash2, Save, X, Sparkles, Upload, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../components/AdminLogin';
import toast from 'react-hot-toast';
import { Plus as PlusIcon, Edit as EditIcon, Trash2, Save, X, Sparkles, Bot, LogOut } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at?: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  rating?: number;
  seo_title?: string;
  seo_description?: string;
  features?: any[];
  useCases?: any[];
  pricing?: any[];
  image_alt?: string;
  how_to_use?: string;
  content_type?: string;
  slug?: string;
  published_at?: string;
  featured?: boolean;
  created_at: string;
  updated_at?: string;
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
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at?: string;
}

function Admin() {
  const { session } = useAuth();
  const [showLogin, setShowLogin] = useState(!session);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'tools' | 'agents'>('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showToolForm, setShowToolForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    seo_title: '',
    seo_description: ''
  });

  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    url: '',
    category_id: '',
    image_file: null as File | null,
    seo_title: '',
    seo_description: '',
    image_alt: '',
    how_to_use: '',
    content_type: 'human_created',
    featured: false,
    features: [{ title: '', description: '' }],
    pricing: [{ plan: '', price: '', features: '' }]
  });

  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    capabilities: '',
    api_endpoint: '',
    pricing_type: 'free',
    status: 'active',
    image_url: '',
    is_available_24_7: false,
    user_count: 0,
    has_fast_response: false,
    is_secure: false,
    seo_title: '',
    seo_description: ''
  });

  const fetchData = useCallback(async () => {
    if (!session) return;

    try {
      const [categoriesRes, toolsRes, agentsRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: false }),
        supabase.from('tools').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('*').order('created_at', { ascending: false })
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (toolsRes.data) setTools(toolsRes.data);
      if (agentsRes.data) setAgents(agentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setShowLogin(false);
      fetchData();
    } else {
      setShowLogin(true);
    }
  }, [session, fetchData]);

  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogin(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      seo_title: '',
      seo_description: ''
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetToolForm = () => {
    setToolForm({
      name: '',
      description: '',
      url: '',
      category_id: '',
      image_file: null,
      seo_title: '',
      seo_description: '',
      image_alt: '',
      how_to_use: '',
      content_type: 'human_created',
      featured: false,
      features: [{ title: '', description: '' }],
      pricing: [{ plan: '', price: '', features: '' }]
    });
    setEditingTool(null);
    setShowToolForm(false);
  };

  const resetAgentForm = () => {
    setAgentForm({
      name: '',
      description: '',
      capabilities: '',
      api_endpoint: '',
      pricing_type: 'free',
      status: 'active',
      image_url: '',
      is_available_24_7: false,
      user_count: 0,
      has_fast_response: false,
      is_secure: false,
      seo_title: '',
      seo_description: ''
    });
    setEditingAgent(null);
    setShowAgentForm(false);
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        seo_title: categoryForm.seo_title.trim() || null,
        seo_description: categoryForm.seo_description.trim() || null
      };

      if (!categoryData.name || !categoryData.description) {
        toast.error('Name and description are required');
        return;
      }

      let result;
      if (editingCategory) {
        result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('categories')
          .insert([categoryData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Category save error:', result.error);
        toast.error(`Failed to save category: ${result.error.message}`);
        return;
      }

      toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      resetCategoryForm();
      fetchData();
    } catch (error) {
      console.error('Category save error:', error);
      toast.error('Failed to save category');
    }
  };

  const handleSaveTool = async () => {
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1676277791608-ac54783d753b';
      
      // Handle image upload (placeholder for now - would need actual upload logic)
      if (toolForm.image_file) {
        // In a real implementation, you would upload to Supabase Storage or another service
        console.log('Image file selected:', toolForm.image_file.name);
        // For now, use a default image
      }

      const toolData = {
        name: toolForm.name.trim(),
        description: toolForm.description.trim(),
        url: toolForm.url.trim(),
        category_id: toolForm.category_id,
        image_url: imageUrl,
        seo_title: toolForm.seo_title.trim() || null,
        seo_description: toolForm.seo_description.trim() || null,
        image_alt: toolForm.image_alt.trim() || toolForm.name.trim(),
        how_to_use: toolForm.how_to_use.trim() || null,
        content_type: toolForm.content_type,
        featured: toolForm.featured,
        slug: toolForm.name.toLowerCase().replace(/\s+/g, '-'),
        published_at: new Date().toISOString(),
        features: toolForm.features.filter(f => f.title.trim() && f.description.trim()),
        useCases: [
          {
            title: "Business Automation",
            description: "Streamline business processes and workflows"
          },
          {
            title: "Productivity Enhancement",
            description: "Boost productivity and efficiency"
          }
        ],
        pricing: toolForm.pricing
          .filter(p => p.plan.trim() && p.price.trim())
          .map(p => ({
            ...p,
            features: p.features.split('\n').filter(f => f.trim())
          }))
      };

      if (!toolData.name || !toolData.description || !toolData.category_id) {
        toast.error('Name, description, and category are required');
        return;
      }

      let result;
      if (editingTool) {
        result = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', editingTool.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('tools')
          .insert([toolData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Tool save error:', result.error);
        toast.error(`Failed to save tool: ${result.error.message}`);
        return;
      }

      toast.success(`Tool ${editingTool ? 'updated' : 'created'} successfully!`);
      resetToolForm();
      fetchData();
    } catch (error) {
      console.error('Tool save error:', error);
      toast.error('Failed to save tool');
    }
  };

  const handleSaveAgent = async () => {
    try {
      const agentData = {
        name: agentForm.name.trim(),
        description: agentForm.description.trim(),
        capabilities: agentForm.capabilities.split(',').map(c => c.trim()).filter(c => c),
        api_endpoint: agentForm.api_endpoint.trim() || null,
        pricing_type: agentForm.pricing_type,
        status: agentForm.status,
        image_url: agentForm.image_url.trim() || 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        is_available_24_7: agentForm.is_available_24_7,
        user_count: agentForm.user_count || 0,
        has_fast_response: agentForm.has_fast_response,
        is_secure: agentForm.is_secure,
        seo_title: agentForm.seo_title.trim() || null,
        seo_description: agentForm.seo_description.trim() || null
      };

      if (!agentData.name || !agentData.description) {
        toast.error('Name and description are required');
        return;
      }

      let result;
      if (editingAgent) {
        result = await supabase
          .from('agents')
          .update(agentData)
          .eq('id', editingAgent.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('agents')
          .insert([agentData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Agent save error:', result.error);
        toast.error(`Failed to save agent: ${result.error.message}`);
        return;
      }

      toast.success(`Agent ${editingAgent ? 'updated' : 'created'} successfully!`);
      resetAgentForm();
      fetchData();
    } catch (error) {
      console.error('Agent save error:', error);
      toast.error('Failed to save agent');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Failed to delete category: ${error.message}`);
        return;
      }

      toast.success('Category deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Failed to delete tool: ${error.message}`);
        return;
      }

      toast.success('Tool deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete tool');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Failed to delete agent: ${error.message}`);
        return;
      }

      toast.success('Agent deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || ''
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditTool = (tool: Tool) => {
    setToolForm({
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category_id: tool.category_id,
      image_file: null,
      seo_title: tool.seo_title || '',
      seo_description: tool.seo_description || '',
      image_alt: tool.image_alt || '',
      how_to_use: tool.how_to_use || '',
      content_type: tool.content_type || 'human_created',
      featured: tool.featured || false,
      features: tool.features || [{ title: '', description: '' }],
      pricing: tool.pricing?.map(p => ({
        plan: p.plan,
        price: p.price,
        features: p.features.join('\n')
      })) || [{ plan: '', price: '', features: '' }]
    });
    setEditingTool(tool);
    setShowToolForm(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setAgentForm({
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities.join(', '),
      api_endpoint: agent.api_endpoint || '',
      pricing_type: agent.pricing_type,
      status: agent.status,
      image_url: agent.image_url,
      is_available_24_7: agent.is_available_24_7,
      user_count: agent.user_count,
      has_fast_response: agent.has_fast_response,
      is_secure: agent.is_secure,
      seo_title: agent.seo_title || '',
      seo_description: agent.seo_description || ''
    });
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  if (showLogin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-royal-dark py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-royal-gold" />
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter mb-8">
          <h2 className="text-lg font-bold text-royal-gold mb-4">Demo Admin Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2 font-mono text-white">admin@aitoonic.com</span>
            </div>
            <div>
              <span className="text-gray-400">Password:</span>
              <span className="ml-2 font-mono text-white">admin123</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-royal-dark-card rounded-lg p-1 border border-royal-dark-lighter">
          {[
            { key: 'categories', label: 'Categories', icon: Sparkles },
            { key: 'tools', label: 'Tools', icon: Bot },
            { key: 'agents', label: 'Agents', icon: Bot }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === key
                  ? 'bg-royal-gold text-royal-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Categories</h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex items-center space-x-1 text-royal-gold hover:text-royal-gold/80"
                    >
                      <EditIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex items-center space-x-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tools</h2>
              <button
                onClick={() => setShowToolForm(true)}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tool</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter"
                >
                  <img
                    src={tool.image_url}
                    alt={tool.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{tool.description}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTool(tool)}
                      className="flex items-center space-x-1 text-royal-gold hover:text-royal-gold/80"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTool(tool.id)}
                      className="flex items-center space-x-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Agents</h2>
              <button
                onClick={() => setShowAgentForm(true)}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter"
                >
                  <img
                    src={agent.image_url}
                    alt={agent.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{agent.description}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAgent(agent)}
                      className="flex items-center space-x-1 text-royal-gold hover:text-royal-gold/80"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="flex items-center space-x-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-royal-dark-card rounded-xl p-6 w-full max-w-2xl border border-royal-dark-lighter max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={categoryForm.seo_title}
                    onChange={(e) => setCategoryForm({ ...categoryForm, seo_title: e.target.value })}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={categoryForm.seo_description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, seo_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    placeholder="SEO meta description"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={resetCategoryForm}
                  className="flex-1 border border-royal-dark-lighter text-gray-300 px-4 py-2 rounded-lg hover:bg-royal-dark-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tool Form Modal */}
        {showToolForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-royal-dark-card rounded-xl p-6 w-full max-w-4xl border border-royal-dark-lighter max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingTool ? 'Edit Tool' : 'Add Tool'}
                </h3>
                <button
                  onClick={resetToolForm}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={toolForm.name}
                      onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Enter tool name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={toolForm.description}
                      onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Enter tool description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={toolForm.url}
                      onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={toolForm.category_id}
                      onChange={(e) => setToolForm({ ...toolForm, category_id: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setToolForm({ ...toolForm, image_file: e.target.files?.[0] || null })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    />
                    {toolForm.image_file && (
                      <p className="text-sm text-gray-400 mt-1">
                        Selected: {toolForm.image_file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={toolForm.seo_title}
                      onChange={(e) => setToolForm({ ...toolForm, seo_title: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={toolForm.seo_description}
                      onChange={(e) => setToolForm({ ...toolForm, seo_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="SEO meta description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={toolForm.image_alt}
                      onChange={(e) => setToolForm({ ...toolForm, image_alt: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Descriptive alt text for image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How to Use
                    </label>
                    <textarea
                      value={toolForm.how_to_use}
                      onChange={(e) => setToolForm({ ...toolForm, how_to_use: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Instructions on how to use this tool"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={toolForm.featured}
                        onChange={(e) => setToolForm({ ...toolForm, featured: e.target.checked })}
                        className="rounded border-royal-dark-lighter"
                      />
                      <span className="text-gray-300">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Features</h4>
                  <button
                    type="button"
                    onClick={() => setToolForm({
                      ...toolForm,
                      features: [...toolForm.features, { title: '', description: '' }]
                    })}
                    className="flex items-center space-x-1 text-royal-gold hover:text-royal-gold/80"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {toolForm.features.map((feature, index) => (
                    <div key={index} className="bg-royal-dark rounded-lg p-4 border border-royal-dark-lighter">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-400">Feature {index + 1}</span>
                        {toolForm.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setToolForm({
                              ...toolForm,
                              features: toolForm.features.filter((_, i) => i !== index)
                            })}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Feature title"
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...toolForm.features];
                            newFeatures[index].title = e.target.value;
                            setToolForm({ ...toolForm, features: newFeatures });
                          }}
                          className="w-full px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                        <textarea
                          placeholder="Feature description"
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...toolForm.features];
                            newFeatures[index].description = e.target.value;
                            setToolForm({ ...toolForm, features: newFeatures });
                          }}
                          rows={2}
                          className="w-full px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Plans Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Pricing Plans</h4>
                  <button
                    type="button"
                    onClick={() => setToolForm({
                      ...toolForm,
                      pricing: [...toolForm.pricing, { plan: '', price: '', features: '' }]
                    })}
                    className="flex items-center space-x-1 text-royal-gold hover:text-royal-gold/80"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Plan</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {toolForm.pricing.map((plan, index) => (
                    <div key={index} className="bg-royal-dark rounded-lg p-4 border border-royal-dark-lighter">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-400">Plan {index + 1}</span>
                        {toolForm.pricing.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setToolForm({
                              ...toolForm,
                              pricing: toolForm.pricing.filter((_, i) => i !== index)
                            })}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Plan name"
                          value={plan.plan}
                          onChange={(e) => {
                            const newPricing = [...toolForm.pricing];
                            newPricing[index].plan = e.target.value;
                            setToolForm({ ...toolForm, pricing: newPricing });
                          }}
                          className="w-full px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                        <input
                          type="text"
                          placeholder="Price"
                          value={plan.price}
                          onChange={(e) => {
                            const newPricing = [...toolForm.pricing];
                            newPricing[index].price = e.target.value;
                            setToolForm({ ...toolForm, pricing: newPricing });
                          }}
                          className="w-full px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                      </div>
                      <textarea
                        placeholder="Features (one per line)"
                        value={plan.features}
                        onChange={(e) => {
                          const newPricing = [...toolForm.pricing];
                          newPricing[index].features = e.target.value;
                          setToolForm({ ...toolForm, pricing: newPricing });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={resetToolForm}
                  className="flex-1 border border-royal-dark-lighter text-gray-300 px-4 py-2 rounded-lg hover:bg-royal-dark-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTool}
                  className="flex-1 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Form Modal */}
        {showAgentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-royal-dark-card rounded-xl p-6 w-full max-w-4xl border border-royal-dark-lighter max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingAgent ? 'Edit Agent' : 'Add Agent'}
                </h3>
                <button
                  onClick={resetAgentForm}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={agentForm.name}
                      onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Enter agent name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={agentForm.description}
                      onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Enter agent description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Capabilities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={agentForm.capabilities}
                      onChange={(e) => setAgentForm({ ...agentForm, capabilities: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="e.g., Text Generation, Data Analysis, Code Review"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      API Endpoint
                    </label>
                    <input
                      type="url"
                      value={agentForm.api_endpoint}
                      onChange={(e) => setAgentForm({ ...agentForm, api_endpoint: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="https://api.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={agentForm.image_url}
                      onChange={(e) => setAgentForm({ ...agentForm, image_url: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pricing Type
                    </label>
                    <select
                      value={agentForm.pricing_type}
                      onChange={(e) => setAgentForm({ ...agentForm, pricing_type: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    >
                      <option value="free">Free</option>
                      <option value="freemium">Freemium</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={agentForm.status}
                      onChange={(e) => setAgentForm({ ...agentForm, status: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Count
                    </label>
                    <input
                      type="number"
                      value={agentForm.user_count}
                      onChange={(e) => setAgentForm({ ...agentForm, user_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="Number of users"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={agentForm.seo_title}
                      onChange={(e) => setAgentForm({ ...agentForm, seo_title: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={agentForm.seo_description}
                      onChange={(e) => setAgentForm({ ...agentForm, seo_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      placeholder="SEO meta description"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Features
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'is_available_24_7', label: '24/7 Available' },
                        { key: 'has_fast_response', label: 'Fast Response' },
                        { key: 'is_secure', label: 'Secure & Private' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={agentForm[key as keyof typeof agentForm] as boolean}
                            onChange={(e) => setAgentForm({ ...agentForm, [key]: e.target.checked })}
                            className="rounded border-royal-dark-lighter"
                          />
                          <span className="text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={resetAgentForm}
                  className="flex-1 border border-royal-dark-lighter text-gray-300 px-4 py-2 rounded-lg hover:bg-royal-dark-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAgent}
                  className="flex-1 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Admin;