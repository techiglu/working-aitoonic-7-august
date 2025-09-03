import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdminLogin } from '../components/AdminLogin';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Sparkles, 
  Bot, 
  LogOut 
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
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
  created_at: string;
  updated_at?: string;
  features: any[];
  useCases: any[];
  pricing: any[];
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
  created_at: string;
  updated_at?: string;
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'tools' | 'agents'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  
  // Tools state
  const [tools, setTools] = useState<Tool[]>([]);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    url: '',
    category_id: '',
    image_url: '',
    how_to_use: '',
    features: [{ title: '', description: '' }],
    pricing: [{ plan: '', price: '', features: '' }]
  });
  
  // Agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    capabilities: [''],
    api_endpoint: '',
    pricing_type: 'free',
    status: 'active',
    image_url: ''
  });

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchTools();
      fetchAgents();
    }
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to fetch tools');
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File, isEditing: boolean = false) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tools/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      if (isEditing && editingTool) {
        setEditingTool({ ...editingTool, image_url: imageUrl });
      } else {
        setNewTool({ ...newTool, image_url: imageUrl });
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Category CRUD operations
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);
      
      if (error) throw error;
      
      toast.success('Category created successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          description: editingCategory.description
        })
        .eq('id', editingCategory.id);
      
      if (error) throw error;
      
      toast.success('Category updated successfully');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
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
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Tool CRUD operations
  const handleCreateTool = async () => {
    if (!newTool.name.trim() || !newTool.category_id) {
      toast.error('Tool name and category are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('tools')
        .insert([{
          ...newTool,
          features: newTool.features.filter(f => f.title.trim()),
          pricing: newTool.pricing.filter(p => p.plan.trim())
        }]);
      
      if (error) throw error;
      
      toast.success('Tool created successfully');
      setNewTool({
        name: '',
        description: '',
        url: '',
        category_id: '',
        image_url: '',
        how_to_use: '',
        features: [{ title: '', description: '' }],
        pricing: [{ plan: '', price: '', features: '' }]
      });
      fetchTools();
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error('Failed to create tool');
    }
  };

  const handleUpdateTool = async () => {
    if (!editingTool) return;

    try {
      const { error } = await supabase
        .from('tools')
        .update({
          name: editingTool.name,
          description: editingTool.description,
          url: editingTool.url,
          category_id: editingTool.category_id,
          image_url: editingTool.image_url,
          how_to_use: editingTool.how_to_use,
          features: editingTool.features,
          pricing: editingTool.pricing
        })
        .eq('id', editingTool.id);
      
  const handleImageUpload = async (file: File, isEditing: boolean = false) => {
    try {
      setUploadingImage(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tools/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);
      if (error) throw error;
      if (error) {
        throw new Error(error.message);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      toast.success('Tool updated successfully');
      // Update appropriate state
      if (isEditing) {
        setEditingTool(prev => ({ ...prev, image_url: publicUrl }));
      } else {
        setNewTool(prev => ({ ...prev, image_url: publicUrl }));
      }
      setEditingTool(null);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
      fetchTools();
  const addFeature = (isEditing: boolean = false) => {
    const newFeature = { title: '', description: '' };
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature]
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
    }
  };
    } catch (error) {
  const removeFeature = (index: number, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        features: prev.features.filter((_: any, i: number) => i !== index)
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };
      console.error('Error updating tool:', error);
  const updateFeature = (index: number, field: 'title' | 'description', value: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        features: prev.features.map((feature: any, i: number) => 
          i === index ? { ...feature, [field]: value } : feature
        )
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        features: prev.features.map((feature, i) => 
          i === index ? { ...feature, [field]: value } : feature
        )
      }));
    }
  };
      toast.error('Failed to update tool');
  const addPricingPlan = (isEditing: boolean = false) => {
    const newPlan = { plan: '', price: '', features: '' };
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        pricing: [...(prev.pricing || []), newPlan]
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        pricing: [...prev.pricing, newPlan]
      }));
    }
  };
    }
  const removePricingPlan = (index: number, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_: any, i: number) => i !== index)
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index)
      }));
    }
  };
  };
  const updatePricingPlan = (index: number, field: 'plan' | 'price' | 'features', value: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingTool(prev => ({
        ...prev,
        pricing: prev.pricing.map((plan: any, i: number) => 
          i === index ? { ...plan, [field]: value } : plan
        )
      }));
    } else {
      setNewTool(prev => ({
        ...prev,
        pricing: prev.pricing.map((plan, i) => 
          i === index ? { ...plan, [field]: value } : plan
        )
      }));
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
      fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    }
  };

  // Agent CRUD operations
  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('agents')
        .insert([{
          ...newAgent,
          capabilities: newAgent.capabilities.filter(cap => cap.trim())
        }]);
      
      if (error) throw error;
      
      toast.success('Agent created successfully');
      setNewAgent({
        name: '',
        description: '',
        capabilities: [''],
        api_endpoint: '',
        pricing_type: 'free',
        status: 'active',
        image_url: ''
      });
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: editingAgent.name,
          description: editingAgent.description,
          capabilities: editingAgent.capabilities.filter(cap => cap.trim()),
          api_endpoint: editingAgent.api_endpoint,
          pricing_type: editingAgent.pricing_type,
          status: editingAgent.status,
          image_url: editingAgent.image_url
        })
        .eq('id', editingAgent.id);
      
      if (error) throw error;
      
      toast.success('Agent updated successfully');
      setEditingAgent(null);
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
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
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-royal-dark flex items-center justify-center">
        <div className="text-royal-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-royal-dark">
      {/* Header */}
      <header className="bg-royal-dark-card border-b border-royal-dark-lighter">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-royal-gold" />
              <h1 className="text-2xl font-bold gradient-text">Aitoonic Admin</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <nav className="flex space-x-1 mb-8 bg-royal-dark-card rounded-lg p-1">
          {[
            { key: 'categories', label: 'Categories' },
            { key: 'tools', label: 'Tools' },
            { key: 'agents', label: 'Agents' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-royal-gold text-royal-dark'
                  : 'text-gray-400 hover:text-white hover:bg-royal-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {/* Add New Category */}
            <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
              <h2 className="text-xl font-bold mb-4">Add New Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
              </div>
              <button
                onClick={handleCreateCategory}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Categories List */}
            <div className="bg-royal-dark-card rounded-xl border border-royal-dark-lighter overflow-hidden">
              <div className="p-6 border-b border-royal-dark-lighter">
                <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
              </div>
              <div className="divide-y divide-royal-dark-lighter">
                {categories.map((category) => (
                  <div key={category.id} className="p-6">
                    {editingCategory?.id === category.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                        <input
                          type="text"
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateCategory}
                            className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{category.name}</h3>
                          <p className="text-gray-400">{category.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 text-royal-gold hover:bg-royal-dark rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            {/* Add New Tool */}
            <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
              <h2 className="text-xl font-bold mb-4">Add New Tool</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Tool Name"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <select
                  value={newTool.category_id}
                  onChange={(e) => setNewTool({ ...newTool, category_id: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newTool.description}
                  onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <input
                  type="url"
                  placeholder="Tool URL"
                  value={newTool.url}
                  onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newTool.image_url}
                  onChange={(e) => setNewTool({ ...newTool, image_url: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold md:col-span-2"
                />
              </div>
              <button
                onClick={handleCreateTool}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tool</span>
              </button>
            </div>

            {/* Tools List */}
            <div className="bg-royal-dark-card rounded-xl border border-royal-dark-lighter overflow-hidden">
              <div className="p-6 border-b border-royal-dark-lighter">
                <h2 className="text-xl font-bold">Tools ({tools.length})</h2>
              </div>
              <div className="divide-y divide-royal-dark-lighter">
                {tools.map((tool) => (
                  <div key={tool.id} className="p-6">
                    {editingTool?.id === tool.id ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingTool.name}
                            onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          />
                          <select
                            value={editingTool.category_id}
                            onChange={(e) => setEditingTool({ ...editingTool, category_id: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          >
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <textarea
                          value={editingTool.description}
                          onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold resize"
                        />
                        
                        <input
                          type="url"
                          value={editingTool.url}
                          onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                        
                        {/* How to Use Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">How to Use</label>
                          <textarea
                            placeholder="Step-by-step instructions on how to use this tool..."
                            value={newTool.how_to_use}
                            onChange={(e) => setNewTool({ ...newTool, how_to_use: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold resize"
                          />
                        </div>

                        {/* Image Upload Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tool Image</label>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, false);
                                }}
                                className="hidden"
                                id="image-upload-new"
                              />
                              <label
                                htmlFor="image-upload-new"
                                className={`px-4 py-2 bg-royal-gold text-royal-dark rounded-lg font-bold cursor-pointer hover:bg-opacity-90 transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {uploadingImage ? 'Uploading...' : 'Upload from PC'}
                              </label>
                              <span className="text-gray-400">or</span>
                            </div>
                            <input
                              type="url"
                              placeholder="Image URL"
                              value={newTool.image_url}
                              onChange={(e) => setNewTool({ ...newTool, image_url: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                            {newTool.image_url && (
                              <img
                                src={newTool.image_url}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  console.log('Image failed to load:', newTool.image_url);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Features Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                          {newTool.features.map((feature, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Feature Title"
                                value={feature.title}
                                onChange={(e) => {
                                  const updated = [...newTool.features];
                                  updated[index] = { ...updated[index], title: e.target.value };
                                  setNewTool({ ...newTool, features: updated });
                                }}
                                className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="Feature Description"
                                  value={feature.description}
                                  onChange={(e) => {
                                    const updated = [...newTool.features];
                                    updated[index] = { ...updated[index], description: e.target.value };
                                    setNewTool({ ...newTool, features: updated });
                                  }}
                                  className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = newTool.features.filter((_, i) => i !== index);
                                    setNewTool({ ...newTool, features: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                                >
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setNewTool({ 
                              ...newTool, 
                              features: [...newTool.features, { title: '', description: '' }] 
                            })}
                            className="text-royal-gold hover:text-royal-gold/80 text-sm"
                          >
                            + Add Feature
                          </button>
                        </div>

                        {/* Pricing Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Plans</label>
                          {newTool.pricing.map((plan, index) => (
                            <div key={index} className="space-y-2 mb-4 p-4 bg-royal-dark rounded-lg border border-royal-dark-lighter">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">Plan {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = newTool.pricing.filter((_, i) => i !== index);
                                    setNewTool({ ...newTool, pricing: updated });
                                  }}
                                  className="p-1 text-red-500 hover:bg-royal-dark-lighter rounded"
                                >
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Plan name"
                                  value={plan.plan}
                                  onChange={(e) => {
                                    const updated = [...newTool.pricing];
                                    updated[index] = { ...updated[index], plan: e.target.value };
                                    setNewTool({ ...newTool, pricing: updated });
                                  }}
                                  className="px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <input
                                  type="text"
                                  placeholder="Price"
                                  value={plan.price}
                                  onChange={(e) => {
                                    const updated = [...newTool.pricing];
                                    updated[index] = { ...updated[index], price: e.target.value };
                                    setNewTool({ ...newTool, pricing: updated });
                                  }}
                                  className="px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                              </div>
                              <textarea
                                placeholder="Features (one per line)"
                                value={plan.features}
                                onChange={(e) => {
                                  const updated = [...newTool.pricing];
                                  updated[index] = { ...updated[index], features: e.target.value };
                                  setNewTool({ ...newTool, pricing: updated });
                                }}
                                rows={4}
                                className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold resize"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setNewTool({ 
                              ...newTool, 
                              pricing: [...newTool.pricing, { plan: '', price: '', features: '' }] 
                            })}
                            className="text-royal-gold hover:text-royal-gold/80 text-sm"
                          >
                            + Add Pricing Plan
                          </button>
                        </div>

                        <textarea
                          placeholder="How to Use"
                          value={editingTool.how_to_use || ''}
                          onChange={(e) => setEditingTool({ ...editingTool, how_to_use: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold resize"
                        />

                        {/* Image Upload for Editing */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tool Image</label>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, true);
                                }}
                                className="hidden"
                                id={`image-upload-edit-${editingTool.id}`}
                              />
                              <label
                                htmlFor={`image-upload-edit-${editingTool.id}`}
                                className={`px-4 py-2 bg-royal-gold text-royal-dark rounded-lg font-bold cursor-pointer hover:bg-opacity-90 transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {uploadingImage ? 'Uploading...' : 'Upload from PC'}
                              </label>
                              <span className="text-gray-400">or</span>
                            </div>
                            <input
                              type="url"
                              placeholder="Image URL"
                              value={editingTool.image_url}
                              onChange={(e) => setEditingTool({ ...editingTool, image_url: e.target.value })}
                              className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                            {editingTool.image_url && (
                              <img
                                src={editingTool.image_url}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </div>

                        {/* Features Section for Editing */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                          {(editingTool.features || []).map((feature: any, index: number) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Feature Title"
                                value={feature.title || ''}
                                onChange={(e) => {
                                  const updated = [...(editingTool.features || [])];
                                  updated[index] = { ...updated[index], title: e.target.value };
                                  setEditingTool({ ...editingTool, features: updated });
                                }}
                                className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="Feature Description"
                                  value={feature.description || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingTool.features || [])];
                                    updated[index] = { ...updated[index], description: e.target.value };
                                    setEditingTool({ ...editingTool, features: updated });
                                  }}
                                  className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <button
                                  onClick={() => {
                                    const updated = (editingTool.features || []).filter((_, i) => i !== index);
                                    setEditingTool({ ...editingTool, features: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => setEditingTool({ 
                              ...editingTool, 
                              features: [...(editingTool.features || []), { title: '', description: '' }] 
                            })}
                            className="text-royal-gold hover:text-royal-gold/80 text-sm"
                          >
                            + Add Feature
                          </button>
                        </div>

                        {/* Pricing Section for Editing */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Plans</label>
                          {(editingTool.pricing || []).map((plan: any, index: number) => (
                            <div key={index} className="space-y-2 mb-4 p-4 bg-royal-dark rounded-lg border border-royal-dark-lighter">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Plan Name"
                                  value={plan.plan || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingTool.pricing || [])];
                                    updated[index] = { ...updated[index], plan: e.target.value };
                                    setEditingTool({ ...editingTool, pricing: updated });
                                  }}
                                  className="px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <input
                                  type="text"
                                  placeholder="Price"
                                  value={plan.price || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingTool.pricing || [])];
                                    updated[index] = { ...updated[index], price: e.target.value };
                                    setEditingTool({ ...editingTool, pricing: updated });
                                  }}
                                  className="px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const updated = (editingTool.pricing || []).filter((_, i) => i !== index);
                                  setEditingTool({ ...editingTool, pricing: updated });
                                }}
                                className="text-red-500 hover:text-red-400 text-sm"
                              >
                                Remove Plan
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setEditingTool({ 
                              ...editingTool, 
                              pricing: [...(editingTool.pricing || []), { plan: '', price: '', features: [''] }] 
                            })}
                            className="text-royal-gold hover:text-royal-gold/80 text-sm"
                          >
                            + Add Pricing Plan
                          </button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateTool}
                            className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingTool(null)}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {tool.image_url && (
                            <img
                              src={tool.image_url}
                              alt={tool.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                            <p className="text-gray-400">{tool.description}</p>
                            <p className="text-sm text-royal-gold">
                              {categories.find(c => c.id === tool.category_id)?.name}
                            </p>
                            {tool.how_to_use && (
                              <p className="text-xs text-gray-500 mt-1">Has usage instructions</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingTool(tool)}
                            className="p-2 text-royal-gold hover:bg-royal-dark rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-8">
            {/* Add New Agent */}
            <div className="bg-royal-dark-card rounded-xl p-6 border border-royal-dark-lighter">
              <h2 className="text-xl font-bold mb-4">Add New Agent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Agent Name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <select
                  value={newAgent.pricing_type}
                  onChange={(e) => setNewAgent({ ...newAgent, pricing_type: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold md:col-span-2"
                />
                <input
                  type="url"
                  placeholder="API Endpoint"
                  value={newAgent.api_endpoint}
                  onChange={(e) => setNewAgent({ ...newAgent, api_endpoint: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newAgent.image_url}
                  onChange={(e) => setNewAgent({ ...newAgent, image_url: e.target.value })}
                  className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Capabilities</label>
                {newAgent.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Capability"
                      value={capability}
                      onChange={(e) => {
                        const updated = [...newAgent.capabilities];
                        updated[index] = e.target.value;
                        setNewAgent({ ...newAgent, capabilities: updated });
                      }}
                      className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    />
                    <button
                      onClick={() => {
                        const updated = newAgent.capabilities.filter((_, i) => i !== index);
                        setNewAgent({ ...newAgent, capabilities: updated });
                      }}
                      className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewAgent({ ...newAgent, capabilities: [...newAgent.capabilities, ''] })}
                  className="text-royal-gold hover:text-royal-gold/80 text-sm"
                >
                  + Add Capability
                </button>
              </div>
              <button
                onClick={handleCreateAgent}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
              >
                <Bot className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            </div>

            {/* Agents List */}
            <div className="bg-royal-dark-card rounded-xl border border-royal-dark-lighter overflow-hidden">
              <div className="p-6 border-b border-royal-dark-lighter">
                <h2 className="text-xl font-bold">Agents ({agents.length})</h2>
              </div>
              <div className="divide-y divide-royal-dark-lighter">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-6">
                    {editingAgent?.id === agent.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingAgent.name}
                            onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          />
                          <select
                            value={editingAgent.pricing_type}
                            onChange={(e) => setEditingAgent({ ...editingAgent, pricing_type: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          >
                            <option value="free">Free</option>
                            <option value="freemium">Freemium</option>
                            <option value="paid">Paid</option>
                          </select>
                          <input
                            type="text"
                            value={editingAgent.description}
                            onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold md:col-span-2"
                          />
                          <input
                            type="url"
                            value={editingAgent.api_endpoint}
                            onChange={(e) => setEditingAgent({ ...editingAgent, api_endpoint: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          />
                          <input
                            type="url"
                            value={editingAgent.image_url}
                            onChange={(e) => setEditingAgent({ ...editingAgent, image_url: e.target.value })}
                            className="px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateAgent}
                            className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingAgent(null)}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {agent.image_url && (
                            <img
                              src={agent.image_url}
                              alt={agent.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                            <p className="text-gray-400">{agent.description}</p>
                            <p className="text-sm text-royal-gold capitalize">{agent.pricing_type}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingAgent(agent)}
                            className="p-2 text-royal-gold hover:bg-royal-dark rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-2 text-red-500 hover:bg-royal-dark rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;