import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generatePrerenderRoutes() {
  try {
    console.log('🚀 Generating prerender routes...');
    
    const routes = [
      // Static routes
      '/',
      '/categories',
      '/ai-agent',
      '/about',
      '/contact',
      '/terms',
      '/privacy',
      '/advertise',
      '/affiliate',
      '/sitemap'
    ];

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name')
      .order('name');

    if (categories) {
      categories.forEach(category => {
        const slug = category.name.toLowerCase().replace(/\s+/g, '-');
        routes.push(`/category/${slug}`);
      });
      console.log(`✅ Added ${categories.length} category routes`);
    }

    // Fetch tools
    const { data: tools } = await supabase
      .from('tools')
      .select('name')
      .order('name')
      .limit(500); // Limit to prevent too many routes

    if (tools) {
      tools.forEach(tool => {
        const slug = tool.name.toLowerCase().replace(/\s+/g, '-');
        routes.push(`/ai/${slug}`);
      });
      console.log(`✅ Added ${tools.length} tool routes`);
    }

    // Fetch agents
    const { data: agents } = await supabase
      .from('agents')
      .select('name')
      .eq('status', 'active')
      .order('name');

    if (agents) {
      agents.forEach(agent => {
        const slug = agent.name.toLowerCase().replace(/\s+/g, '-');
        routes.push(`/ai-agent/${slug}`);
      });
      console.log(`✅ Added ${agents.length} agent routes`);
    }

    // Write routes to file
    const routesContent = `export const prerenderRoutes = ${JSON.stringify(routes, null, 2)};`;
    
    const outputPath = path.join(process.cwd(), 'src', 'prerender-routes.js');
    fs.writeFileSync(outputPath, routesContent);
    
    console.log(`🎉 Generated ${routes.length} total routes for prerendering`);
    console.log(`📝 Routes saved to: ${outputPath}`);
    
    return routes;
  } catch (error) {
    console.error('❌ Error generating prerender routes:', error);
    
    // Fallback to static routes only
    const fallbackRoutes = [
      '/',
      '/categories',
      '/ai-agent',
      '/about',
      '/contact',
      '/terms',
      '/privacy',
      '/advertise',
      '/affiliate',
      '/sitemap'
    ];
    
    const routesContent = `export const prerenderRoutes = ${JSON.stringify(fallbackRoutes, null, 2)};`;
    const outputPath = path.join(process.cwd(), 'src', 'prerender-routes.js');
    fs.writeFileSync(outputPath, routesContent);
    
    console.log(`⚠️  Using fallback routes (${fallbackRoutes.length} routes)`);
    return fallbackRoutes;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePrerenderRoutes();
}

export { generatePrerenderRoutes };