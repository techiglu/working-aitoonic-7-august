import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryWithCount {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image_url?: string;
  tool_count: number;
}

function Categories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          description,
          icon,
          image_url,
          tools (count)
        `);

      if (categoriesData) {
        const categoriesWithCount = categoriesData.map(category => ({
          ...category,
          tool_count: category.tools[0].count
        }));
        setCategories(categoriesWithCount);
      }
    }

    fetchCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Tool Categories | Aitoonic.com</title>
        <meta 
          name="description" 
          content="Browse our comprehensive collection of AI tools by category. Find the perfect tools for your needs."
        />
      </Helmet>

      <main className="min-h-screen bg-royal-dark py-20">
        <article className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <mark className="text-gray-300">Categories</mark>
          </nav>

          {/* Hero Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Browse AI Tools by Category
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover specialized AI tools across different categories to enhance your workflow
            </p>
          </header>

          {/* Categories Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <article
                key={category.id}
                className="bg-royal-dark-card rounded-2xl p-8 border border-royal-dark-lighter hover:border-royal-gold group transition-all"
              >
                <header className="flex items-center space-x-4 mb-4">
                  <figure className="p-3 bg-royal-dark rounded-xl overflow-hidden">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : category.icon ? (
                      <img 
                        src={category.icon} 
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Sparkles className="w-8 h-8 text-royal-gold" />
                    )}
                  </figure>
                  <hgroup>
                    <h2 className="text-2xl font-bold text-white group-hover:text-royal-gold transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-gray-400">
                      {category.tool_count} {category.tool_count === 1 ? 'Tool' : 'Tools'}
                    </p>
                  </hgroup>
                </header>
                <p className="text-gray-300 mb-6">
                  {category.description}
                </p>
                <footer>
                  <Link
                    to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-royal-gold group-hover:text-royal-gold/80 font-medium"
                  >
                    Browse Tools
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </footer>
              </article>
            ))}
          </section>
        </article>
      </main>
    </>
  );
}

export default Categories;