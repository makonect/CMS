export const websites = {
  leledumbo: {
    name: 'LeleDumbo',
    domain: 'leledumbo.com',
    description: 'Catfish News & Information',
    theme: {
      primaryColor: '#1e40af', // blue
      secondaryColor: '#000000', // black
      backgroundColor: '#ffffff' // white
    },
    categories: ['Breeding', 'Farming', 'Species', 'Health', 'Recipes', 'Equipment']
  },
  rumanabastala: {
    name: 'Rumana Bastala',
    domain: 'rumanabastala.com',
    description: 'Agricultural News & Tips',
    theme: {
      primaryColor: '#16a34a', // green
      secondaryColor: '#1e293b', // dark gray
      backgroundColor: '#f8fafc' // light gray
    },
    categories: ['Farming', 'Crops', 'Technology', 'Market', 'Sustainability', 'Innovation']
  }
};

export const getWebsiteConfig = (website) => {
  return websites[website] || websites.leledumbo;
};