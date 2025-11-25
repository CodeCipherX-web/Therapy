// Resources tracking and management
const RESOURCES_STORAGE_KEY = 'tranquilmind_resources';

// Resource categories
const RESOURCE_CATEGORIES = {
  RECOMMENDED: 'recommended',
  POPULAR: 'popular',
  LATEST: 'latest',
  MOST_VIEWED: 'most_viewed'
};

// Comprehensive resource database
const RESOURCES_DB = {
  articles: [
    {
      id: 'who-mental-health',
      title: 'WHO: Mental Health Overview',
      url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
      category: 'Understanding Mental Health',
      description: 'Comprehensive overview of global mental health from the World Health Organization',
      isRecommended: true,
      addedDate: '2024-01-15',
      viewCount: 0
    },
    {
      id: 'nimh-topics',
      title: 'NIMH: Mental Health Topics',
      url: 'https://www.nimh.nih.gov/health/topics',
      category: 'Understanding Mental Health',
      description: 'National Institute of Mental Health resource hub',
      isRecommended: true,
      addedDate: '2024-01-15',
      viewCount: 0
    },
    {
      id: 'mha-conditions',
      title: 'Mental Health America: Conditions',
      url: 'https://www.mhanational.org/conditions',
      category: 'Understanding Mental Health',
      description: 'Information about various mental health conditions',
      isRecommended: false,
      addedDate: '2024-01-20',
      viewCount: 0
    },
    {
      id: 'building-mental-health',
      title: 'Building Better Mental Health',
      url: 'https://www.helpguide.org/articles/mental-health/building-better-mental-health.htm',
      category: 'Self-Care & Coping',
      description: 'Practical guide to improving your mental wellbeing',
      isRecommended: true,
      addedDate: '2024-01-18',
      viewCount: 0
    },
    {
      id: 'mind-tips',
      title: 'Mind: Tips for Everyday Living',
      url: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/',
      category: 'Self-Care & Coping',
      description: 'Daily tips for managing mental health',
      isRecommended: true,
      addedDate: '2024-01-22',
      viewCount: 0
    },
    {
      id: 'psychology-today-stress',
      title: 'Psychology Today: Stress Management',
      url: 'https://www.psychologytoday.com/us/basics/stress',
      category: 'Self-Care & Coping',
      description: 'Expert advice on managing stress',
      isRecommended: false,
      addedDate: '2024-02-01',
      viewCount: 0
    },
    {
      id: 'understanding-anxiety',
      title: 'Understanding Anxiety',
      url: 'https://www.anxiety.org/what-is-anxiety',
      category: 'Anxiety & Depression',
      description: 'Comprehensive guide to understanding anxiety disorders',
      isRecommended: true,
      addedDate: '2024-01-25',
      viewCount: 0
    },
    {
      id: 'nimh-depression',
      title: 'NIMH: Depression Information',
      url: 'https://www.nimh.nih.gov/health/publications/depression',
      category: 'Anxiety & Depression',
      description: 'Official depression information and resources',
      isRecommended: true,
      addedDate: '2024-01-25',
      viewCount: 0
    },
    {
      id: 'adaa-anxiety',
      title: 'ADAA: Anxiety Resources',
      url: 'https://adaa.org/understanding-anxiety',
      category: 'Anxiety & Depression',
      description: 'Anxiety and Depression Association of America resources',
      isRecommended: false,
      addedDate: '2024-02-05',
      viewCount: 0
    }
  ],
  videos: [
    {
      id: 'ted-depression',
      title: 'TED-Ed: What is Depression?',
      url: 'https://www.youtube.com/watch?v=3QIfkeA6HBY',
      category: 'Mental Health Basics',
      description: 'Educational video explaining depression',
      isRecommended: true,
      addedDate: '2024-01-16',
      viewCount: 0
    },
    {
      id: 'understanding-mental-health-vid',
      title: 'Understanding Mental Health',
      url: 'https://www.youtube.com/watch?v=Z47hWx2S3zA',
      category: 'Mental Health Basics',
      description: 'Introduction to mental health concepts',
      isRecommended: false,
      addedDate: '2024-01-28',
      viewCount: 0
    },
    {
      id: 'mental-health-awareness',
      title: 'Mental Health Awareness',
      url: 'https://www.youtube.com/watch?v=4kC8v2nEDhM',
      category: 'Mental Health Basics',
      description: 'Raising awareness about mental health',
      isRecommended: false,
      addedDate: '2024-02-10',
      viewCount: 0
    },
    {
      id: 'headspace-meditation',
      title: 'Headspace: Meditation Guide',
      url: 'https://www.youtube.com/watch?v=U9YKY7fdwyg',
      category: 'Meditation & Mindfulness',
      description: 'Learn meditation techniques',
      isRecommended: true,
      addedDate: '2024-01-19',
      viewCount: 0
    },
    {
      id: 'mindfulness-beginners',
      title: 'Mindfulness for Beginners',
      url: 'https://www.youtube.com/watch?v=6p_yaNFSYao',
      category: 'Meditation & Mindfulness',
      description: 'Introduction to mindfulness practice',
      isRecommended: true,
      addedDate: '2024-01-24',
      viewCount: 0
    },
    {
      id: 'breathing-exercises',
      title: 'Breathing Exercises',
      url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
      category: 'Meditation & Mindfulness',
      description: 'Guided breathing exercises for relaxation',
      isRecommended: true,
      addedDate: '2024-01-30',
      viewCount: 0
    },
    {
      id: 'coping-stress',
      title: 'Coping with Stress',
      url: 'https://www.youtube.com/watch?v=1nB8hs4kwX8',
      category: 'Coping Strategies',
      description: 'Effective strategies for managing stress',
      isRecommended: true,
      addedDate: '2024-01-17',
      viewCount: 0
    },
    {
      id: 'managing-anxiety-vid',
      title: 'Managing Anxiety',
      url: 'https://www.youtube.com/watch?v=vo4pMVb0R6M',
      category: 'Coping Strategies',
      description: 'Techniques for anxiety management',
      isRecommended: true,
      addedDate: '2024-01-21',
      viewCount: 0
    },
    {
      id: 'self-care-techniques',
      title: 'Self-Care Techniques',
      url: 'https://www.youtube.com/watch?v=WwPAur7UFHg',
      category: 'Coping Strategies',
      description: 'Practical self-care methods',
      isRecommended: false,
      addedDate: '2024-02-08',
      viewCount: 0
    }
  ],
  apps: [
    {
      id: 'headspace-app',
      title: 'Headspace (Meditation)',
      url: 'https://www.headspace.com/',
      category: 'Apps & Tools',
      description: 'Meditation and mindfulness app',
      isRecommended: true,
      addedDate: '2024-01-14',
      viewCount: 0
    },
    {
      id: 'calm-app',
      title: 'Calm (Sleep & Meditation)',
      url: 'https://www.calm.com/',
      category: 'Apps & Tools',
      description: 'Sleep stories and meditation app',
      isRecommended: true,
      addedDate: '2024-01-14',
      viewCount: 0
    },
    {
      id: 'mood-meter',
      title: 'Mood Meter (Emotion Tracking)',
      url: 'https://www.moodmeterapp.com/',
      category: 'Apps & Tools',
      description: 'Track and understand your emotions',
      isRecommended: false,
      addedDate: '2024-01-26',
      viewCount: 0
    }
  ],
  communities: [
    {
      id: 'support-groups-central',
      title: 'Support Groups Central',
      url: 'https://www.supportgroupscentral.com/',
      category: 'Support Communities',
      description: 'Find support groups near you',
      isRecommended: false,
      addedDate: '2024-01-23',
      viewCount: 0
    },
    {
      id: '7cups',
      title: '7 Cups (Free Listening)',
      url: 'https://www.7cups.com/',
      category: 'Support Communities',
      description: 'Free emotional support from trained listeners',
      isRecommended: true,
      addedDate: '2024-01-16',
      viewCount: 0
    },
    {
      id: 'reddit-mentalhealth',
      title: 'r/MentalHealth Community',
      url: 'https://www.reddit.com/r/mentalhealth/',
      category: 'Support Communities',
      description: 'Reddit community for mental health support',
      isRecommended: true,
      addedDate: '2024-01-27',
      viewCount: 0
    }
  ],
  research: [
    {
      id: 'nimh-main',
      title: 'National Institute of Mental Health',
      url: 'https://www.nimh.nih.gov/',
      category: 'Research & Education',
      description: 'Leading research institution for mental health',
      isRecommended: true,
      addedDate: '2024-01-15',
      viewCount: 0
    },
    {
      id: 'apa-topics',
      title: 'American Psychological Association',
      url: 'https://www.apa.org/topics',
      category: 'Research & Education',
      description: 'APA resources on mental health topics',
      isRecommended: true,
      addedDate: '2024-01-18',
      viewCount: 0
    },
    {
      id: 'who-mental-health-main',
      title: 'WHO Mental Health',
      url: 'https://www.who.int/health-topics/mental-health',
      category: 'Research & Education',
      description: 'World Health Organization mental health resources',
      isRecommended: true,
      addedDate: '2024-01-15',
      viewCount: 0
    }
  ]
};

// Initialize resources data
function initResources() {
  const stored = localStorage.getItem(RESOURCES_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge stored view counts with current resources
      Object.keys(RESOURCES_DB).forEach(type => {
        RESOURCES_DB[type].forEach(resource => {
          const storedResource = parsed[type]?.find(r => r.id === resource.id);
          if (storedResource) {
            resource.viewCount = storedResource.viewCount || 0;
          }
        });
      });
    } catch (e) {
      console.error('Error loading resources:', e);
    }
  }
  saveResources();
}

// Save resources to localStorage
function saveResources() {
  try {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(RESOURCES_DB));
  } catch (e) {
    console.error('Error saving resources:', e);
  }
}

// Track resource view
function trackResourceView(type, resourceId) {
  const resource = RESOURCES_DB[type]?.find(r => r.id === resourceId);
  if (resource) {
    resource.viewCount = (resource.viewCount || 0) + 1;
    saveResources();
  }
}

// Get recommended resources
function getRecommendedResources() {
  const all = getAllResources();
  return all.filter(r => r.isRecommended);
}

// Get popular resources (by view count, top 10)
function getPopularResources() {
  const all = getAllResources();
  return [...all]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10);
}

// Get latest resources (by added date, most recent first)
function getLatestResources() {
  const all = getAllResources();
  return [...all]
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    .slice(0, 10);
}

// Get most viewed resources
function getMostViewedResources() {
  const all = getAllResources();
  return [...all]
    .filter(r => (r.viewCount || 0) > 0)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10);
}

// Get all resources as a flat array
function getAllResources() {
  return [
    ...RESOURCES_DB.articles.map(r => ({ ...r, type: 'article' })),
    ...RESOURCES_DB.videos.map(r => ({ ...r, type: 'video' })),
    ...RESOURCES_DB.apps.map(r => ({ ...r, type: 'app' })),
    ...RESOURCES_DB.communities.map(r => ({ ...r, type: 'community' })),
    ...RESOURCES_DB.research.map(r => ({ ...r, type: 'research' }))
  ];
}

// Get icon for resource type
function getResourceIcon(type) {
  const icons = {
    article: 'fa-book',
    video: 'fa-video',
    app: 'fa-mobile-alt',
    community: 'fa-users',
    research: 'fa-graduation-cap'
  };
  return icons[type] || 'fa-link';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize on load
if (typeof window !== 'undefined') {
  initResources();
}


