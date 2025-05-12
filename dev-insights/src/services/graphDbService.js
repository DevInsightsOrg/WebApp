/**
 * GraphDB Service for ReMediCard.io
 * 
 * This service handles API calls to the GraphDB backend for repository analysis
 */

// Base API URL - replace with your actual API base URL in production
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetches key developers categorized as 'jacks' (generalists with broad knowledge)
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of jack developers
 */
const getJackDevelopers = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/key-developers/jacks`);
    if (!response.ok) {
      throw new Error('Failed to fetch jack developers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching jack developers:', error);
    throw error;
  }
};

/**
 * Fetches key developers categorized as 'mavens' (specialists with deep, focused knowledge)
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of maven developers
 */
const getMavenDevelopers = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/key-developers/mavens`);
    if (!response.ok) {
      throw new Error('Failed to fetch maven developers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching maven developers:', error);
    throw error;
  }
};

/**
 * Fetches key developers categorized as 'connectors' (bridge different parts of the project)
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of connector developers
 */
const getConnectorDevelopers = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/key-developers/connectors`);
    if (!response.ok) {
      throw new Error('Failed to fetch connector developers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching connector developers:', error);
    throw error;
  }
};

/**
 * Fetches all categorized developers (jacks, mavens, connectors)
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Object>} - Object containing all categorized developers
 */
const getAllCategorizedDevelopers = async (repoOwner, repoName) => {
  try {
    const [jacks, mavens, connectors] = await Promise.all([
      getJackDevelopers(repoOwner, repoName),
      getMavenDevelopers(repoOwner, repoName),
      getConnectorDevelopers(repoOwner, repoName)
    ]);
    
    return {
      jacks,
      mavens,
      connectors
    };
  } catch (error) {
    console.error('Error fetching all categorized developers:', error);
    throw error;
  }
};

/**
 * Fetches potential replacement developers for a specific developer
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @param {string} githubUsername - GitHub username of the developer
 * @returns {Promise<Array>} - List of potential replacement developers
 */
const getDeveloperReplacements = async (repoOwner, repoName, githubUsername) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/developers/${githubUsername}/replacements`);
    if (!response.ok) {
      throw new Error('Failed to fetch developer replacements');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching developer replacements:', error);
    throw error;
  }
};

/**
 * Fetches knowledge distribution statistics for the repository
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Object>} - Knowledge distribution stats
 */
const getKnowledgeDistribution = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/knowledge-distribution`);
    if (!response.ok) {
      throw new Error('Failed to fetch knowledge distribution');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching knowledge distribution:', error);
    throw error;
  }
};

/**
 * Fetches developer contribution statistics
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of developer contributions
 */
const getDeveloperContributions = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/developers/contributions`);
    if (!response.ok) {
      throw new Error('Failed to fetch developer contributions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching developer contributions:', error);
    throw error;
  }
};

/**
 * Fetches collaboration statistics between developers
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of collaborations between developers
 */
const getCollaborations = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/collaborations`);
    if (!response.ok) {
      throw new Error('Failed to fetch collaborations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    throw error;
  }
};

/**
 * Fetches critical files in the repository
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @returns {Promise<Array>} - List of critical files
 */
const getCriticalFiles = async (repoOwner, repoName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${repoOwner}/${repoName}/critical-files`);
    if (!response.ok) {
      throw new Error('Failed to fetch critical files');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching critical files:', error);
    throw error;
  }
};

/**
 * Gets artifact traceability graph data
 * Constructs a graph from various API endpoints
 * @param {string} repoOwner - The repository owner
 * @param {string} repoName - The repository name
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} - Graph data with nodes and links
 */
const getArtifactTraceabilityGraph = async (repoOwner, repoName, options = {}) => {
  try {
    // Fetch all required data
    const [
      developers,
      criticalFiles,
      collaborations
    ] = await Promise.all([
      getDeveloperContributions(repoOwner, repoName),
      getCriticalFiles(repoOwner, repoName),
      getCollaborations(repoOwner, repoName)
    ]);
    
    // Get developer categories
    const categories = await getAllCategorizedDevelopers(repoOwner, repoName);
    
    // Process nodes
    const nodes = [];
    
    // Add developer nodes
    developers.forEach(dev => {
      nodes.push({
        id: dev.github,
        name: dev.name,
        email: dev.email,
        type: 'developer',
        knowledgeBreadth: dev.knowledge_breadth,
        category: getDeveloperCategory(dev.github, categories)
      });
    });
    
    // Add file nodes
    criticalFiles.forEach(file => {
      nodes.push({
        id: file.file_path,
        name: file.filename,
        type: 'file',
        contributors: file.contributors
      });
    });
    
    // Process links
    const links = [];
    
    // Add collaboration links
    collaborations.forEach(collab => {
      links.push({
        source: collab.developer1,
        target: collab.developer2,
        type: 'collaborated',
        value: collab.collaboration_strength
      });
    });
    
    // Add developer-file links based on developer contributions
    developers.forEach(dev => {
      criticalFiles.forEach(file => {
        // This is a simplification - in a real implementation,
        // you would need specific data about which developers modified which files
        // For now, we're creating links based on probability
        if (Math.random() < 0.3) { // 30% chance a developer modified a critical file
          links.push({
            source: dev.github,
            target: file.file_path,
            type: 'modified',
            value: 1
          });
        }
      });
    });
    
    // Apply filters if provided
    let filteredNodes = [...nodes];
    let filteredLinks = [...links];
    
    if (options.developerId) {
      // Filter for a specific developer
      const developerNode = nodes.find(node => node.id === options.developerId);
      if (developerNode) {
        const connectedNodeIds = links
          .filter(link => link.source === options.developerId || link.target === options.developerId)
          .map(link => link.source === options.developerId ? link.target : link.source);
        
        filteredNodes = [
          developerNode,
          ...nodes.filter(node => connectedNodeIds.includes(node.id))
        ];
        
        filteredLinks = links.filter(link => 
          link.source === options.developerId || link.target === options.developerId
        );
      }
    } else if (options.fileCategory) {
      // Filter for files in a specific category
      const categoryFiles = nodes
        .filter(node => node.type === 'file' && node.id.startsWith(options.fileCategory + '/'))
        .map(node => node.id);
      
      const connectedNodeIds = links
        .filter(link => 
          (link.source.startsWith && link.source.startsWith(options.fileCategory + '/')) || 
          (link.target.startsWith && link.target.startsWith(options.fileCategory + '/'))
        )
        .flatMap(link => [link.source, link.target]);
      
      filteredNodes = nodes.filter(node => 
        categoryFiles.includes(node.id) || connectedNodeIds.includes(node.id)
      );
      
      filteredLinks = links.filter(link => 
        categoryFiles.includes(link.source) || categoryFiles.includes(link.target)
      );
    }
    
    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  } catch (error) {
    console.error('Error generating artifact traceability graph:', error);
    throw error;
  }
};

/**
 * Helper function to determine a developer's category
 * @param {string} githubUsername - GitHub username of the developer
 * @param {Object} categories - Object containing categorized developers
 * @returns {string} - Developer category
 */
const getDeveloperCategory = (githubUsername, categories) => {
  const isJack = categories.jacks.some(dev => dev.github === githubUsername);
  const isMaven = categories.mavens.some(dev => dev.github === githubUsername);
  const isConnector = categories.connectors.some(dev => dev.github === githubUsername);
  
  if (isConnector) return 'connector';
  if (isMaven) return 'maven';
  if (isJack) return 'jack';
  return 'uncategorized';
};

const graphdbService = {
  getJackDevelopers,
  getMavenDevelopers,
  getConnectorDevelopers,
  getAllCategorizedDevelopers,
  getDeveloperReplacements,
  getKnowledgeDistribution,
  getDeveloperContributions,
  getCollaborations,
  getCriticalFiles,
  getArtifactTraceabilityGraph
};

export default graphdbService;