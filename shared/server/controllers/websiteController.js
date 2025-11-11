import Website from '../models/Website.js';

// Initialize default websites if they don't exist
const initializeDefaultWebsites = async () => {
  try {
    const defaultWebsites = [
      {
        name: 'LeleDumbo',
        domain: 'leledumbo.com',
        description: 'Platform untuk budidaya lele dan ikan air tawar lainnya',
        logo: '',
        theme: {
          primaryColor: '#1e40af',
          secondaryColor: '#dc2626',
          backgroundColor: '#ffffff'
        },
        contactEmail: 'info@leledumbo.com'
      },
      {
        name: 'Rumana Bastala',
        domain: 'rumanabastala.com',
        description: 'Platform untuk pertanian organik dan budidaya tanaman',
        logo: '',
        theme: {
          primaryColor: '#16a34a',
          secondaryColor: '#ca8a04',
          backgroundColor: '#ffffff'
        },
        contactEmail: 'info@rumanabastala.com'
      }
    ];

    for (const websiteData of defaultWebsites) {
      const existingWebsite = await Website.findOne({ 
        $or: [
          { name: websiteData.name },
          { domain: websiteData.domain }
        ]
      });

      if (!existingWebsite) {
        await Website.create(websiteData);
        console.log(`Created default website: ${websiteData.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing default websites:', error);
  }
};

// Call this on server start
initializeDefaultWebsites();

export const getWebsites = async (req, res) => {
  try {
    const websites = await Website.find().sort({ name: 1 });
    res.json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch websites'
    });
  }
};

export const updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const website = await Website.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website not found'
      });
    }

    res.json({
      success: true,
      website
    });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update website'
    });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No logo file uploaded'
      });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const website = await Website.findByIdAndUpdate(
      id,
      { logo: logoUrl },
      { new: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        error: 'Website not found'
      });
    }

    res.json({
      success: true,
      logoUrl,
      website
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload logo'
    });
  }
};

// Create new website
export const createWebsite = async (req, res) => {
  try {
    const { name, domain, description, contactEmail } = req.body;

    // Check if website with same name or domain already exists
    const existingWebsite = await Website.findOne({
      $or: [
        { name: name },
        { domain: domain }
      ]
    });

    if (existingWebsite) {
      return res.status(400).json({
        success: false,
        error: 'Website with this name or domain already exists'
      });
    }

    const website = new Website({
      name,
      domain,
      description,
      contactEmail,
      theme: {
        primaryColor: '#1e40af',
        secondaryColor: '#000000',
        backgroundColor: '#ffffff'
      }
    });

    await website.save();

    res.status(201).json({
      success: true,
      website
    });
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create website'
    });
  }
};