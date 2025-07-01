import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/cosmos-db';

// /api/categories endpoint - gets unique categories from businesses collection
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('businesses');
    
    // Get unique categories from processed documents
    const categories = await collection.distinct('Category', {
      jina_scraped: true
    });
    
    // Sort categories alphabetically
    const sortedCategories = categories
      .filter((cat: string) => cat) // Remove null/undefined
      .sort((a: string, b: string) => a.localeCompare(b));
    
    // Return categories with count of providers in each
    const categoriesWithCount = await Promise.all(
      sortedCategories.map(async (category: string) => {
        const count = await collection.countDocuments({
          jina_scraped: true,
          Category: category
        });
        
        return {
          name: category,
          count: count,
          // Add icon mapping for common categories
          icon: getCategoryIcon(category)
        };
      })
    );

    // Set cache headers for 1 hour
    return NextResponse.json(categoriesWithCount, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in /api/categories:', error);
    
    // Check for specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 }
        );
      }
      if (error.message.includes('authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to map categories to icons
function getCategoryIcon(category: string): string {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('dental') || categoryLower.includes('dentist')) return '🦷';
  if (categoryLower.includes('eye') || categoryLower.includes('vision') || categoryLower.includes('ophthal')) return '👁️';
  if (categoryLower.includes('primary') || categoryLower.includes('family')) return '🏥';
  if (categoryLower.includes('mental') || categoryLower.includes('psych')) return '🧠';
  if (categoryLower.includes('urgent')) return '🚑';
  if (categoryLower.includes('pediatric') || categoryLower.includes('child')) return '👶';
  if (categoryLower.includes('women') || categoryLower.includes('obgyn')) return '👩‍⚕️';
  if (categoryLower.includes('pharmacy')) return '💊';
  if (categoryLower.includes('lab') || categoryLower.includes('diagnostic')) return '🔬';
  if (categoryLower.includes('physical therapy') || categoryLower.includes('rehab')) return '🏃';
  
  return '🏥'; // Default medical icon
} 