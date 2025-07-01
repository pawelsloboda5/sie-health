// Utility functions for working with collection names

/**
 * Transform a collection name from snake_case or kebab-case to human-readable format
 * Examples:
 * - dental_clinics -> Dental clinics
 * - community-health-centers -> Community health centers
 * - std_testing_and_treatment -> STD testing and treatment
 * - business-dmv-details -> Business DMV details
 */
export function collectionNameToHumanReadable(collectionName: string): string {
  // Handle special acronyms
  const acronymMap: Record<string, string> = {
    'std': 'STD',
    'dmv': 'DMV',
    'obgyn': 'OBGYN',
  };

  // Replace both hyphens and underscores with spaces
  const words = collectionName.replace(/[-_]/g, ' ').split(' ');

  return words
    .map((word, index) => {
      // Check if it's a known acronym
      const lowerWord = word.toLowerCase();
      if (acronymMap[lowerWord]) {
        return acronymMap[lowerWord];
      }
      
      // Capitalize first letter of first word, rest lowercase
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      
      return word.toLowerCase();
    })
    .join(' ');
}

/**
 * Get all categories from collection names
 * Filters out system collections and transforms to human-readable format
 */
export function getCategories(collectionNames: string[]): string[] {
  return collectionNames
    .filter(name => !name.startsWith('system.'))
    .map(collectionNameToHumanReadable)
    .sort();
}

/**
 * Implementation for the actual Cosmos DB categories query
 */
export async function getCategoriesFromDatabase(db: any): Promise<string[]> {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c: any) => c.name);
  return getCategories(collectionNames);
} 