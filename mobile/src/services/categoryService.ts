export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string[];
  keywords: string[];
  subcategories?: string[];
}

class CategoryService {
  private categories: Category[] = [
    { id: 'dairy', name: 'Dairy', icon: 'bottle-soda', color: ['#E3F2FD', '#BBDEFB'], keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream'] },
    { id: 'bakery', name: 'Bakery', icon: 'bread-slice', color: ['#FFF3E0', '#FFE0B2'], keywords: ['bread', 'cake', 'pastry', 'cookie', 'muffin'] },
    { id: 'produce', name: 'Produce', icon: 'apple', color: ['#E8F5E8', '#C8E6C9'], keywords: ['fruit', 'vegetable', 'apple', 'banana', 'carrot', 'lettuce'] },
    { id: 'meat', name: 'Meat', icon: 'food-drumstick', color: ['#FFEBEE', '#FFCDD2'], keywords: ['chicken', 'beef', 'pork', 'fish', 'lamb', 'turkey'] },
    { id: 'frozen', name: 'Frozen', icon: 'snowflake', color: ['#E1F5FE', '#B3E5FC'], keywords: ['ice cream', 'frozen', 'pizza', 'vegetables', 'dinner'] },
    { id: 'pantry', name: 'Pantry', icon: 'package-variant', color: ['#F3E5F5', '#E1BEE7'], keywords: ['rice', 'pasta', 'cereal', 'canned', 'soup', 'sauce'] },
    { id: 'beverages', name: 'Beverages', icon: 'cup', color: ['#E0F2F1', '#B2DFDB'], keywords: ['juice', 'soda', 'water', 'coffee', 'tea', 'energy drink'] },
    { id: 'snacks', name: 'Snacks', icon: 'cookie', color: ['#FFF8E1', '#FFECB3'], keywords: ['chips', 'crackers', 'nuts', 'candy', 'chocolate', 'popcorn'] },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medical-bag', color: ['#FCE4EC', '#F8BBD9'], keywords: ['medicine', 'vitamin', 'bandage', 'shampoo', 'toothpaste'] },
    { id: 'electronics', name: 'Electronics', icon: 'cellphone', color: ['#E8EAF6', '#C5CAE9'], keywords: ['phone', 'laptop', 'headphones', 'charger', 'camera', 'tablet'] },
    { id: 'clothing', name: 'Clothing', icon: 'tshirt-crew', color: ['#F1F8E9', '#DCEDC8'], keywords: ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'hat'] },
    { id: 'books', name: 'Books', icon: 'book-open', color: ['#FFFDE7', '#FFF9C4'], keywords: ['novel', 'textbook', 'magazine', 'comic', 'dictionary'] },
    { id: 'toys', name: 'Toys', icon: 'toy-brick', color: ['#FFE0B2', '#FFCC80'], keywords: ['doll', 'car', 'puzzle', 'game', 'ball', 'blocks'] },
    { id: 'home', name: 'Home', icon: 'home', color: ['#E0F2F1', '#B2DFDB'], keywords: ['furniture', 'decor', 'lamp', 'candle', 'vase', 'mirror'] },
    { id: 'garden', name: 'Garden', icon: 'flower', color: ['#E8F5E8', '#C8E6C9'], keywords: ['plant', 'seed', 'pot', 'soil', 'fertilizer', 'tools'] },
    { id: 'sports', name: 'Sports', icon: 'soccer', color: ['#E3F2FD', '#BBDEFB'], keywords: ['ball', 'racket', 'shoes', 'equipment', 'gym', 'fitness'] },
    { id: 'beauty', name: 'Beauty', icon: 'face-woman', color: ['#FCE4EC', '#F8BBD9'], keywords: ['makeup', 'skincare', 'perfume', 'nail', 'hair', 'cosmetics'] },
    { id: 'automotive', name: 'Automotive', icon: 'car', color: ['#F3E5F5', '#E1BEE7'], keywords: ['oil', 'tire', 'battery', 'parts', 'accessories', 'tools'] },
    { id: 'office', name: 'Office', icon: 'briefcase', color: ['#E8EAF6', '#C5CAE9'], keywords: ['pen', 'paper', 'notebook', 'stapler', 'folder', 'supplies'] },
    { id: 'jewelry', name: 'Jewelry', icon: 'diamond', color: ['#FFF8E1', '#FFECB3'], keywords: ['ring', 'necklace', 'earring', 'watch', 'bracelet', 'pendant'] },
    { id: 'pets', name: 'Pets', icon: 'dog', color: ['#F1F8E9', '#DCEDC8'], keywords: ['food', 'toy', 'collar', 'leash', 'bed', 'treat'] },
    { id: 'baby', name: 'Baby', icon: 'baby-face', color: ['#FFE0B2', '#FFCC80'], keywords: ['diaper', 'formula', 'clothes', 'toys', 'stroller', 'bottle'] },
    { id: 'health', name: 'Health', icon: 'heart-pulse', color: ['#FFEBEE', '#FFCDD2'], keywords: ['vitamin', 'supplement', 'protein', 'fitness', 'wellness'] },
    { id: 'travel', name: 'Travel', icon: 'airplane', color: ['#E1F5FE', '#B3E5FC'], keywords: ['luggage', 'passport', 'guide', 'map', 'camera', 'souvenir'] },
    { id: 'music', name: 'Music', icon: 'music', color: ['#F3E5F5', '#E1BEE7'], keywords: ['instrument', 'headphones', 'speaker', 'cd', 'vinyl', 'sheet'] },
    { id: 'movies', name: 'Movies', icon: 'movie', color: ['#E8EAF6', '#C5CAE9'], keywords: ['dvd', 'bluray', 'streaming', 'popcorn', 'ticket', 'cinema'] },
    { id: 'games', name: 'Games', icon: 'gamepad-variant', color: ['#FFF3E0', '#FFE0B2'], keywords: ['console', 'controller', 'board', 'card', 'puzzle', 'arcade'] },
    { id: 'tools', name: 'Tools', icon: 'hammer-screwdriver', color: ['#F5F5F5', '#E0E0E0'], keywords: ['screwdriver', 'hammer', 'drill', 'saw', 'wrench', 'pliers'] },
  ];

  // Get all categories
  getAllCategories(): Category[] {
    return this.categories;
  }

  // Search categories by name or keywords
  searchCategories(query: string): Category[] {
    if (!query.trim()) {
      return this.categories;
    }

    const lowercaseQuery = query.toLowerCase();
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get category by ID
  getCategoryById(id: string): Category | null {
    return this.categories.find(category => category.id === id) || null;
  }

  // Get popular categories (most commonly used)
  getPopularCategories(): Category[] {
    const popularIds = ['produce', 'dairy', 'meat', 'pantry', 'beverages', 'snacks', 'pharmacy', 'electronics'];
    return popularIds.map(id => this.getCategoryById(id)).filter(Boolean) as Category[];
  }

  // Get categories by type (food, non-food, etc.)
  getCategoriesByType(type: 'food' | 'non-food' | 'all'): Category[] {
    const foodCategories = ['dairy', 'bakery', 'produce', 'meat', 'frozen', 'pantry', 'beverages', 'snacks'];
    
    switch (type) {
      case 'food':
        return this.categories.filter(category => foodCategories.includes(category.id));
      case 'non-food':
        return this.categories.filter(category => !foodCategories.includes(category.id));
      default:
        return this.categories;
    }
  }

  // Get suggested categories based on search query
  getSuggestedCategories(query: string, limit: number = 8): Category[] {
    const searchResults = this.searchCategories(query);
    
    // Sort by relevance (exact name match first, then keyword matches)
    const sortedResults = searchResults.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return 0;
    });

    return sortedResults.slice(0, limit);
  }
}

export const categoryService = new CategoryService();
