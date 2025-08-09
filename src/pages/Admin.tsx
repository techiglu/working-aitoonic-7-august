import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../components/AdminLogin';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  image_alt?: string;
  how_to_use?: string;
  content_type?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  rating?: number;
  featured?: boolean;
  published_at?: string;
  features?: Array<{ title: string; description: string }>;
  useCases?: Array<{ title: string; description: string }>;
  pricing?: Array<{ plan: string; price: string; features: string[] }>;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  seo_title?: string;
  seo_description?: string;
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
  seo_title?: string;
  seo_description?: string;
  is_available_24_7?: boolean;
  user_count?: number;
  has_fast_response?: boolean;
  is_secure?: boolean;
}

function Admin() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'tools' | 'categories' | 'agents'>('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Tool form state
  const [currentTool, setCurrentTool] = useState<Partial<Tool>>({
    name: '',
    description: '',
    url: '',
    category_id: '',
    image_url: '',
    image_alt: '',
    how_to_use: '',
    content_type: 'human_created',
    slug: '',
    seo_title: '',
    seo_description: '',
    rating: 4.5,
    featured: false,
    published_at: new Date().toISOString().split('T')[0],
    features: [],
    useCases: [],
    pricing: []
  });

  // Category form state
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    image_url: '',
    seo_title: '',
    seo_description: ''
  });

  // Agent form state
  const [currentAgent, setCurrentAgent] = useState<Partial<Agent>>({
    name: '',
    description: '',
    capabilities: [],
    api_endpoint: '',
    pricing_type: 'free',
    status: 'active',
    image_url: '',
    seo_title: '',
    seo_description: '',
    is_available_24_7: false,
    user_count: 0,
    has_fast_response: false,
    is_secure: false
  });

  // Image upload states
  const [selectedToolImageFile, setSelectedToolImageFile] = useState<File | null>(null);
  const [selectedAgentImageFile, setSelectedAgentImageFile] = useState<File | null>(null);
  const [uploadingToolImage, setUploadingToolImage] = useState(false);
  const [uploadingAgentImage, setUploadingAgentImage] = useState(false);
  const [showLogin, setShowLogin] = useState(!session);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tools') {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTools(data || []);
      } else if (activeTab === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, image_url, seo_title, seo_description')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } else if (activeTab === 'agents') {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAgents(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Image upload function
  const uploadImageToSupabase = async (file: File, type: 'tool' | 'agent'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle image file selection for tools
  const handleToolImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedToolImageFile(file);
    setUploadingToolImage(true);

    try {
      const imageUrl = await uploadImageToSupabase(file, 'tool');
      setCurrentTool(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingToolImage(false);
    }
  };

  // Handle image file selection for agents
  const handleAgentImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAgentImageFile(file);
    setUploadingAgentImage(true);

    try {
      const imageUrl = await uploadImageToSupabase(file, 'agent');
      setCurrentAgent(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAgentImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowLogin(true);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    fetchData(); // Refresh data after login
  };

  // Show login form if not authenticated
  if (!session || showLogin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const handleAddToolClick = () => {
    setCurrentTool({
      name: '',
      description: '',
      url: '',
      category_id: '',
      image_url: '',
      image_alt: '',
      how_to_use: '',
      content_type: 'human_created',
      slug: '',
      seo_title: '',
      seo_description: '',
      rating: 4.5,
      featured: false,
      published_at: new Date().toISOString().split('T')[0],
      features: [],
      useCases: [],
      pricing: []
    });
    setShowAddForm(true);
    setEditingItem(null);
  };

  const handleAddCategoryClick = () => {
    setCurrentCategory({
      name: '',
      description: '',
      image_url: '',
      seo_title: '',
      seo_description: ''
    });
    setShowAddForm(true);
    setEditingItem(null);
  };

  const handleAddAgentClick = () => {
    setCurrentAgent({
      name: '',
      description: '',
      capabilities: [],
      api_endpoint: '',
      pricing_type: 'free',
      status: 'active',
      image_url: '',
      seo_title: '',
      seo_description: '',
      is_available_24_7: false,
      user_count: 0,
      has_fast_response: false,
      is_secure: false
    });
    setShowAddForm(true);
    setEditingItem(null);
  };

  const handleEditTool = (tool: Tool) => {
    setCurrentTool(tool);
    setEditingItem(tool.id);
    setShowAddForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setEditingItem(category.id);
    setShowAddForm(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setEditingItem(agent.id);
    setShowAddForm(true);
  };

  const handleSaveTool = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('tools')
          .update(currentTool)
          .eq('id', editingItem);
        
        if (error) throw error;
        toast.success('Tool updated successfully');
      } else {
        const { error } = await supabase
          .from('tools')
          .insert([currentTool]);
        
        if (error) throw error;
        toast.success('Tool added successfully');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error('Failed to save tool');
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('categories')
          .update(currentCategory)
          .eq('id', editingItem);
        
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([currentCategory]);
        
        if (error) throw error;
        toast.success('Category added successfully');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleSaveAgent = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('agents')
          .update(currentAgent)
          .eq('id', editingItem);
        
        if (error) throw error;
        toast.success('Agent updated successfully');
      } else {
        const { error } = await supabase
          .from('agents')
          .insert([currentAgent]);
        
        if (error) throw error;
        toast.success('Agent added successfully');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Failed to save agent');
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Tool deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Agent deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const addFeature = () => {
    setCurrentTool(prev => ({
      ...prev,
      features: [...(prev.features || []), { title: '', description: '' }]
    }));
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    setCurrentTool(prev => ({
      ...prev,
      features: prev.features?.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    setCurrentTool(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  const addUseCase = () => {
    setCurrentTool(prev => ({
      ...prev,
      useCases: [...(prev.useCases || []), { title: '', description: '' }]
    }));
  };

  const updateUseCase = (index: number, field: 'title' | 'description', value: string) => {
    setCurrentTool(prev => ({
      ...prev,
      useCases: prev.useCases?.map((useCase, i) => 
        i === index ? { ...useCase, [field]: value } : useCase
      )
    }));
  };

  const removeUseCase = (index: number) => {
    setCurrentTool(prev => ({
      ...prev,
      useCases: prev.useCases?.filter((_, i) => i !== index)
    }));
  };

  const addPricingPlan = () => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: [...(prev.pricing || []), { plan: '', price: '', features: [''] }]
    }));
  };

  const updatePricingPlan = (index: number, field: 'plan' | 'price', value: string) => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: prev.pricing?.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }));
  };

  const addPricingFeature = (planIndex: number) => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: prev.pricing?.map((plan, i) => 
        i === planIndex ? { ...plan, features: [...plan.features, ''] } : plan
      )
    }));
  };

  const updatePricingFeature = (planIndex: number, featureIndex: number, value: string) => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: prev.pricing?.map((plan, i) => 
        i === planIndex ? {
          ...plan,
          features: plan.features.map((feature, j) => j === featureIndex ? value : feature)
        } : plan
      )
    }));
  };

  const removePricingFeature = (planIndex: number, featureIndex: number) => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: prev.pricing?.map((plan, i) => 
        i === planIndex ? {
          ...plan,
          features: plan.features.filter((_, j) => j !== featureIndex)
        } : plan
      )
    }));
  };

  const removePricingPlan = (index: number) => {
    setCurrentTool(prev => ({
      ...prev,
      pricing: prev.pricing?.filter((_, i) => i !== index)
    }));
  };

  const addCapability = () => {
    setCurrentAgent(prev => ({
      ...prev,
      capabilities: [...(prev.capabilities || []), '']
    }));
  };

  const updateCapability = (index: number, value: string) => {
    setCurrentAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities?.map((cap, i) => i === index ? value : cap)
    }));
  };

  const removeCapability = (index: number) => {
    setCurrentAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-royal-dark py-8">
      <Helmet>
        <title>Admin Panel | Aitoonic</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-royal-dark-card rounded-lg p-1">
            {(['tools', 'categories', 'agents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-royal-gold text-royal-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (activeTab === 'tools') handleAddToolClick();
                else if (activeTab === 'categories') handleAddCategoryClick();
                else if (activeTab === 'agents') handleAddAgentClick();
              }}
              className="inline-flex items-center bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="text-royal-gold">Loading...</div>
            </div>
          )}

          {/* Tools Table */}
          {activeTab === 'tools' && !loading && (
            <div className="bg-royal-dark-card rounded-xl overflow-hidden border border-royal-dark-lighter">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-royal-dark-lighter">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-royal-dark-lighter">
                    {tools.map((tool) => (
                      <tr key={tool.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={tool.image_url || 'https://via.placeholder.com/40'}
                              alt={tool.image_alt || tool.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{tool.name}</div>
                              <div className="text-sm text-gray-400 truncate max-w-xs">{tool.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {categories.find(c => c.id === tool.category_id)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {tool.rating || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tool.featured 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tool.featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditTool(tool)}
                            className="text-royal-gold hover:text-royal-gold/80 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Table */}
          {activeTab === 'categories' && !loading && (
            <div className="bg-royal-dark-card rounded-xl overflow-hidden border border-royal-dark-lighter">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-royal-dark-lighter">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-royal-dark-lighter">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{category.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">{category.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-royal-gold hover:text-royal-gold/80 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Agents Table */}
          {activeTab === 'agents' && !loading && (
            <div className="bg-royal-dark-card rounded-xl overflow-hidden border border-royal-dark-lighter">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-royal-dark-lighter">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pricing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-royal-dark-lighter">
                    {agents.map((agent) => (
                      <tr key={agent.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={agent.image_url || 'https://via.placeholder.com/40'}
                              alt={agent.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{agent.name}</div>
                              <div className="text-sm text-gray-400 truncate max-w-xs">{agent.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            agent.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {agent.pricing_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditAgent(agent)}
                            className="text-royal-gold hover:text-royal-gold/80 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-royal-dark-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
                    </h2>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Tool Form */}
                  {activeTab === 'tools' && (
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                            <input
                              type="text"
                              value={currentTool.name || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tool URL *</label>
                            <input
                              type="url"
                              value={currentTool.url || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="https://example.com"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                            <textarea
                              value={currentTool.description || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                            <select
                              value={currentTool.category_id || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, category_id: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Media */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tool Image</label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleToolImageFileChange}
                                className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              {uploadingToolImage && (
                                <div className="flex items-center text-royal-gold">
                                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </div>
                              )}
                              {currentTool.image_url && (
                                <img
                                  src={currentTool.image_url}
                                  alt="Preview"
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Image Alt Text</label>
                            <input
                              type="text"
                              value={currentTool.image_alt || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, image_alt: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="Descriptive alt text for the image"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SEO Settings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                            <input
                              type="text"
                              value={currentTool.seo_title || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, seo_title: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="SEO optimized title (max 60 chars)"
                              maxLength={60}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              {(currentTool.seo_title || '').length}/60 characters
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                            <input
                              type="text"
                              value={currentTool.slug || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, slug: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="url-friendly-slug"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                            <textarea
                              value={currentTool.seo_description || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, seo_description: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="SEO optimized description (max 160 chars)"
                              maxLength={160}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              {(currentTool.seo_description || '').length}/160 characters
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tool Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Tool Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={currentTool.rating || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Published Date</label>
                            <input
                              type="date"
                              value={currentTool.published_at || ''}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, published_at: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={currentTool.featured || false}
                              onChange={(e) => setCurrentTool(prev => ({ ...prev, featured: e.target.checked }))}
                              className="mr-2"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-300">Featured Tool</label>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="content_type"
                                value="human_created"
                                checked={currentTool.content_type === 'human_created'}
                                onChange={(e) => setCurrentTool(prev => ({ ...prev, content_type: e.target.value }))}
                                className="mr-2"
                              />
                              <span className="text-gray-300">Human Created</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="content_type"
                                value="ai_generated"
                                checked={currentTool.content_type === 'ai_generated'}
                                onChange={(e) => setCurrentTool(prev => ({ ...prev, content_type: e.target.value }))}
                                className="mr-2"
                              />
                              <span className="text-gray-300">AI Generated</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Usage Guide */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Usage Guide</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">How to Use This Tool</label>
                          <textarea
                            value={currentTool.how_to_use || ''}
                            onChange={(e) => setCurrentTool(prev => ({ ...prev, how_to_use: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Provide step-by-step instructions on how to use this tool..."
                          />
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                        <div className="space-y-4">
                          {currentTool.features?.map((feature, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-royal-dark rounded-lg">
                              <input
                                type="text"
                                placeholder="Feature title"
                                value={feature.title}
                                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                className="px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Feature description"
                                  value={feature.description}
                                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                  className="flex-1 px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <button
                                  onClick={() => removeFeature(index)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={addFeature}
                            className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Feature
                          </button>
                        </div>
                      </div>

                      {/* Use Cases */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Use Cases</h3>
                        <div className="space-y-4">
                          {currentTool.useCases?.map((useCase, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-royal-dark rounded-lg">
                              <input
                                type="text"
                                placeholder="Use case title"
                                value={useCase.title}
                                onChange={(e) => updateUseCase(index, 'title', e.target.value)}
                                className="px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Use case description"
                                  value={useCase.description}
                                  onChange={(e) => updateUseCase(index, 'description', e.target.value)}
                                  className="flex-1 px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <button
                                  onClick={() => removeUseCase(index)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={addUseCase}
                            className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Use Case
                          </button>
                        </div>
                      </div>

                      {/* Pricing Plans */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Pricing Plans</h3>
                        <div className="space-y-6">
                          {currentTool.pricing?.map((plan, planIndex) => (
                            <div key={planIndex} className="p-4 bg-royal-dark rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                  type="text"
                                  placeholder="Plan name"
                                  value={plan.plan}
                                  onChange={(e) => updatePricingPlan(planIndex, 'plan', e.target.value)}
                                  className="px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Price"
                                    value={plan.price}
                                    onChange={(e) => updatePricingPlan(planIndex, 'price', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                  />
                                  <button
                                    onClick={() => removePricingPlan(planIndex)}
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Features:</label>
                                {plan.features.map((feature, featureIndex) => (
                                  <div key={featureIndex} className="flex space-x-2">
                                    <input
                                      type="text"
                                      placeholder="Feature"
                                      value={feature}
                                      onChange={(e) => updatePricingFeature(planIndex, featureIndex, e.target.value)}
                                      className="flex-1 px-3 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                    />
                                    <button
                                      onClick={() => removePricingFeature(planIndex, featureIndex)}
                                      className="text-red-500 hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addPricingFeature(planIndex)}
                                  className="inline-flex items-center text-royal-gold hover:text-royal-gold/80 text-sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Feature
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={addPricingPlan}
                            className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Pricing Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Form */}
                  {activeTab === 'categories' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                          <input
                            type="text"
                            value={currentCategory.name || ''}
                            onChange={(e) => setCurrentCategory(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                          <input
                            type="url"
                            value={currentCategory.image_url || ''}
                            onChange={(e) => setCurrentCategory(prev => ({ ...prev, image_url: e.target.value }))}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                          <textarea
                            value={currentCategory.description || ''}
                            onChange={(e) => setCurrentCategory(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                          <input
                            type="text"
                            value={currentCategory.seo_title || ''}
                            onChange={(e) => setCurrentCategory(prev => ({ ...prev, seo_title: e.target.value }))}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="SEO optimized title (max 60 chars)"
                            maxLength={60}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                          <input
                            type="text"
                            value={currentCategory.seo_description || ''}
                            onChange={(e) => setCurrentCategory(prev => ({ ...prev, seo_description: e.target.value }))}
                            className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="SEO optimized description (max 160 chars)"
                            maxLength={160}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent Form */}
                  {activeTab === 'agents' && (
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                            <input
                              type="text"
                              value={currentAgent.name || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">API Endpoint</label>
                            <input
                              type="url"
                              value={currentAgent.api_endpoint || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, api_endpoint: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="https://api.example.com"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                            <textarea
                              value={currentAgent.description || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Type</label>
                            <select
                              value={currentAgent.pricing_type || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, pricing_type: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            >
                              <option value="free">Free</option>
                              <option value="freemium">Freemium</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                              value={currentAgent.status || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Media */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Media</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Agent Image</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAgentImageFileChange}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                            {uploadingAgentImage && (
                              <div className="flex items-center text-royal-gold">
                                <Upload className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </div>
                            )}
                            {currentAgent.image_url && (
                              <img
                                src={currentAgent.image_url}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SEO Settings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                            <input
                              type="text"
                              value={currentAgent.seo_title || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, seo_title: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="SEO optimized title (max 60 chars)"
                              maxLength={60}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                            <input
                              type="text"
                              value={currentAgent.seo_description || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, seo_description: e.target.value }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              placeholder="SEO optimized description (max 160 chars)"
                              maxLength={160}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Agent Statistics */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Agent Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">User Count</label>
                            <input
                              type="number"
                              value={currentAgent.user_count || ''}
                              onChange={(e) => setCurrentAgent(prev => ({ ...prev, user_count: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={currentAgent.is_available_24_7 || false}
                                onChange={(e) => setCurrentAgent(prev => ({ ...prev, is_available_24_7: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm font-medium text-gray-300">Available 24/7</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={currentAgent.has_fast_response || false}
                                onChange={(e) => setCurrentAgent(prev => ({ ...prev, has_fast_response: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm font-medium text-gray-300">Fast Response</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={currentAgent.is_secure || false}
                                onChange={(e) => setCurrentAgent(prev => ({ ...prev, is_secure: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm font-medium text-gray-300">Secure & Private</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Capabilities</h3>
                        <div className="space-y-2">
                          {currentAgent.capabilities?.map((capability, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Capability"
                                value={capability}
                                onChange={(e) => updateCapability(index, e.target.value)}
                                className="flex-1 px-3 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              <button
                                onClick={() => removeCapability(index)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addCapability}
                            className="inline-flex items-center text-royal-gold hover:text-royal-gold/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Capability
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-royal-dark-lighter">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 border border-royal-dark-lighter text-gray-300 rounded-lg hover:bg-royal-dark-lighter transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (activeTab === 'tools') handleSaveTool();
                        else if (activeTab === 'categories') handleSaveCategory();
                        else if (activeTab === 'agents') handleSaveAgent();
                      }}
                      className="inline-flex items-center px-6 py-2 bg-royal-gold text-royal-dark rounded-lg font-bold hover:bg-opacity-90 transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;