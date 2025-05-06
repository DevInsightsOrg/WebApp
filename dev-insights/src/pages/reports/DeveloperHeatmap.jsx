import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Slider,
  Card,
  CardContent,
  CardHeader,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRepo } from '../../context/RepoContext';
import apiService from '../../services/apiService';

// Custom heatmap component
const HeatmapGrid = ({ data, maxValue, minValue }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No heatmap data available.
        </Typography>
      </Box>
    );
  }

  // Calculate color intensity
  const getColor = (value) => {
    if (value === 0) return '#eee';
    
    // Normalize between 0 and 1
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    
    // Create color gradient from light blue to dark blue
    const intensity = Math.min(255, Math.floor(normalizedValue * 255));
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  };

  // Group by file path categories
  const fileCategories = {};
  data.forEach(item => {
    const pathParts = item.filePath.split('/');
    let category = pathParts.length > 1 ? pathParts[0] : 'root';
    
    if (!fileCategories[category]) {
      fileCategories[category] = [];
    }
    fileCategories[category].push(item);
  });

  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      {Object.entries(fileCategories).map(([category, files]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {category}
          </Typography>
          <Grid container spacing={1}>
            {files.map((item, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: getColor(item.interactionCount),
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                      boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                    }
                  }}
                  title={`${item.filePath}: ${item.interactionCount} interactions`}
                >
                  {item.interactionCount > 0 && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: item.interactionCount > maxValue / 2 ? 'white' : 'black' }}>
                      {item.interactionCount}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

const DeveloperHeatmap = () => {
  const { selectedRepo } = useRepo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)); // 90 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [fileTypes, setFileTypes] = useState([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [currentView, setCurrentView] = useState('heatmap'); // 'heatmap' or 'list'
  
  // For heatmap statistics
  const [maxInteractions, setMaxInteractions] = useState(0);
  const [minInteractions, setMinInteractions] = useState(0);
  const [avgInteractions, setAvgInteractions] = useState(0);
  const [thresholdValue, setThresholdValue] = useState(0);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!selectedRepo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch developers
        const developersData = await apiService.getDevelopers(selectedRepo);
        setDevelopers(developersData);
        
        if (developersData.length > 0 && !selectedDeveloper) {
          setSelectedDeveloper(developersData[0].id);
        }
        
        // Fetch file types
        const heatmapData = await apiService.getDeveloperHeatmap(selectedRepo, {
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        });
        
        // Extract unique file types
        const uniqueFileTypes = [...new Set(
          heatmapData.flatMap(dev => 
            dev.fileInteractions.map(file => 
              file.filePath.split('.').pop()
            )
          )
        )];
        
        setFileTypes(uniqueFileTypes.filter(type => type.length > 0));
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load developer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [selectedRepo]);
  
  // Fetch heatmap data when filters change
  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!selectedRepo || !selectedDeveloper) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Prepare filter parameters
        const params = {
          developerId: selectedDeveloper,
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        };
        
        if (selectedFileTypes.length > 0) {
          params.fileTypes = selectedFileTypes;
        }
        
        // Fetch heatmap data
        const data = await apiService.getDeveloperHeatmap(selectedRepo, params);
        
        // Process data for the selected developer
        const developerData = data.find(dev => dev.id === selectedDeveloper);
        
        if (developerData) {
          const fileInteractions = developerData.fileInteractions;
          
          // Calculate statistics
          if (fileInteractions.length > 0) {
            const interactions = fileInteractions.map(file => file.interactionCount);
            setMaxInteractions(Math.max(...interactions));
            setMinInteractions(Math.min(...interactions));
            setAvgInteractions(
              interactions.reduce((sum, count) => sum + count, 0) / interactions.length
            );
            setThresholdValue(Math.ceil(avgInteractions));
          }
          
          setHeatmapData(fileInteractions);
        } else {
          setHeatmapData([]);
          setMaxInteractions(0);
          setMinInteractions(0);
          setAvgInteractions(0);
          setThresholdValue(0);
        }
      } catch (err) {
        console.error('Error fetching heatmap data:', err);
        setError('Failed to load heatmap data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeatmapData();
  }, [selectedRepo, selectedDeveloper, startDate, endDate, selectedFileTypes]);
  
  // Handle developer selection change
  const handleDeveloperChange = (event) => {
    setSelectedDeveloper(event.target.value);
  };
  
  // Handle file type selection
  const handleFileTypeToggle = (fileType) => {
    setSelectedFileTypes(prev => {
      if (prev.includes(fileType)) {
        return prev.filter(type => type !== fileType);
      } else {
        return [...prev, fileType];
      }
    });
  };
  
  // Handle threshold slider change
  const handleThresholdChange = (event, newValue) => {
    setThresholdValue(newValue);
  };
  
  // Filter heatmap data based on threshold
  const filteredHeatmapData = heatmapData.filter(
    file => file.interactionCount >= thresholdValue
  );
  
  // Toggle between heatmap and list view
  const toggleView = () => {
    setCurrentView(prev => prev === 'heatmap' ? 'list' : 'heatmap');
  };

  if (!selectedRepo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a repository to view developer heatmap.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Developer Heatmap
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Visualize developer-file interactions to identify areas of specialization and code ownership.
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="developer-select-label">Developer</InputLabel>
              <Select
                labelId="developer-select-label"
                id="developer-select"
                value={selectedDeveloper}
                label="Developer"
                onChange={handleDeveloperChange}
                disabled={loading || developers.length === 0}
              >
                {developers.map(dev => (
                  <MenuItem key={dev.id} value={dev.id}>
                    {dev.name || dev.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              File Types:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {fileTypes.map(type => (
                <Chip
                  key={type}
                  label={type}
                  color={selectedFileTypes.includes(type) ? 'primary' : 'default'}
                  variant={selectedFileTypes.includes(type) ? 'filled' : 'outlined'}
                  onClick={() => handleFileTypeToggle(type)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Heatmap Controls */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader 
                  title="Interaction Threshold" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Slider
                    value={thresholdValue}
                    onChange={handleThresholdChange}
                    min={minInteractions}
                    max={maxInteractions}
                    valueLabelDisplay="auto"
                    disabled={maxInteractions === 0}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Showing files with {thresholdValue}+ interactions
                    (Min: {minInteractions}, Max: {maxInteractions}, Avg: {avgInteractions.toFixed(1)})
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="View Options" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={toggleView}
                  >
                    Switch to {currentView === 'heatmap' ? 'List' : 'Heatmap'} View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Heatmap Visualization */}
          <Paper sx={{ p: 3 }}>
            {filteredHeatmapData.length > 0 ? (
              currentView === 'heatmap' ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    File Interaction Heatmap
                  </Typography>
                  <HeatmapGrid 
                    data={filteredHeatmapData} 
                    maxValue={maxInteractions} 
                    minValue={minInteractions} 
                  />
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    File Interactions List
                  </Typography>
                  <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                    <Grid container spacing={1}>
                      {filteredHeatmapData
                        .sort((a, b) => b.interactionCount - a.interactionCount)
                        .map((file, index) => (
                          <Grid item xs={12} key={index}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                bgcolor: file.interactionCount > avgInteractions * 1.5 ? 'rgba(63, 81, 181, 0.1)' : 'transparent'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {file.filePath}
                              </Typography>
                              <Chip 
                                label={`${file.interactionCount} interactions`}
                                color={
                                  file.interactionCount > avgInteractions * 1.5 ? 'primary' : 
                                  file.interactionCount > avgInteractions ? 'info' : 'default'
                                }
                                size="small"
                              />
                            </Paper>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                </>
              )
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No file interactions found with the current filters.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Try adjusting the threshold or date range.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Legend */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Heatmap Legend:
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#eee', border: '1px solid #ddd', mr: 1 }}></Box>
                  <Typography variant="caption">No interactions</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#E6E6FF', border: '1px solid #ddd', mr: 1 }}></Box>
                  <Typography variant="caption">Low interactions</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#9999FF', border: '1px solid #ddd', mr: 1 }}></Box>
                  <Typography variant="caption">Medium interactions</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#0000FF', border: '1px solid #ddd', mr: 1 }}></Box>
                  <Typography variant="caption">High interactions</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Understanding the Heatmap:</strong> The intensity of color represents the level of interaction a developer 
                has with each file. Darker blue indicates higher interaction frequency, which may suggest code ownership
                or specialization in those areas.
              </Typography>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DeveloperHeatmap;