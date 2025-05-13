import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { useRepo } from '../../context/RepoContext';
import graphDbService from '../../services/graphDbService';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const NODE_COLORS = {
  developer: '#8884d8',
  file: '#82ca9d',
  commit: '#ffc658',
  issue: '#ff8042',
  pullRequest: '#0088FE'
};
const EDGE_COLORS = {
  collaborated: '#8884d8',
  modified: '#82ca9d',
  authored: '#ffc658',
  created: '#ff8042',
  resolved: '#0088FE',
  referenced: '#aaaaaa'
};

const TraceabilityContent = () => {
  const { selectedRepoFullName } = useRepo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [developers, setDevelopers] = useState([]);
  const [jacks, setJacks] = useState([]);
  const [mavens, setMavens] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [criticalFiles, setCriticalFiles] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [knowledgeDist, setKnowledgeDist] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef();

  useEffect(() => {
    const fetchAll = async () => {
      if (!selectedRepoFullName) return;
      setLoading(true);
      setError(null);
      const [owner, repo] = selectedRepoFullName.split('/');

      const safeFetch = async (fetchPromise) => {
        try {
          return await fetchPromise;
        } catch (err) {
          console.error('Safe fetch error:', err);
          return null;
        }
      };

      // Parallel core data fetch
      const [devs, categories, critFiles, collabs, kd] = await Promise.all([
        safeFetch(graphDbService.getDeveloperContributions(owner, repo)),
        safeFetch(graphDbService.getAllCategorizedDevelopers(owner, repo)),
        safeFetch(graphDbService.getCriticalFiles(owner, repo)),
        safeFetch(graphDbService.getCollaborations(owner, repo)),
        safeFetch(graphDbService.getKnowledgeDistribution(owner, repo))
      ]);

      if (devs) setDevelopers(devs);
      if (categories) {
        setJacks(categories.jacks || []);
        setMavens(categories.mavens || []);
        setConnectors(categories.connectors || []);
      }
      if (critFiles) setCriticalFiles(critFiles);
      if (collabs) setCollaborations(collabs);
      if (kd) setKnowledgeDist(kd);

      // Fetch replacements per developer and tag leaving developer
      if (devs) {
        const replResults = await Promise.all(
          devs.map(async dev => {
            const reps = await safeFetch(
              graphDbService.getDeveloperReplacements(owner, repo, dev.github)
            );
            return (reps || []).map(rep => ({ ...rep, leavingDev: dev.name }));
          })
        );
        setReplacements(replResults.flat());
      }

      // Fetch graph last
      const graph = await safeFetch(
        graphDbService.getArtifactTraceabilityGraph(owner, repo)
      );
      if (graph) setGraphData(graph);

      setLoading(false);
    };
    fetchAll();
  }, [selectedRepoFullName]);

  const handleTabChange = (_e, newVal) => setTab(newVal);
  const resetGraphView = () => graphRef.current && graphRef.current.zoomToFit(400, 50);

  if (!selectedRepoFullName) {
    return <Alert severity="info">Please select a repository to view artifact traceability.</Alert>;
  }
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Artifact Traceability Dashboard
      </Typography>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Graph" />
        <Tab label="Contributions" />
        <Tab label="Jacks" />
        <Tab label="Mavens" />
        <Tab label="Connectors" />
        <Tab label="Critical Files" />
        <Tab label="Collaborations" />
        <Tab label="Replacements" />
        <Tab label="Knowledge Dist." />
      </Tabs>

      {/* Graph View */}
      <TabPanel value={tab} index={0}>
        <Button variant="outlined" onClick={resetGraphView} sx={{ mb: 2 }}>
          Reset View
        </Button>
        <Paper sx={{ height: 600 }}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeRelSize={6}
            nodeColor={node => NODE_COLORS[node.type] || '#cccccc'}
            linkColor={link => EDGE_COLORS[link.type] || '#aaaaaa'}
          />
        </Paper>
      </TabPanel>

      {/* Contributions Table */}
      <TabPanel value={tab} index={1}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Commits</TableCell>
                <TableCell>Files Touched</TableCell>
                <TableCell>Total Files</TableCell>
                <TableCell>Knowledge Breadth</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {developers.map(dev => (
                <TableRow key={dev.github}>
                  <TableCell>{dev.name}</TableCell>
                  <TableCell>{dev.commits}</TableCell>
                  <TableCell>{dev.files_touched}</TableCell>
                  <TableCell>{dev.total_files}</TableCell>
                  <TableCell>{(dev.knowledge_breadth * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Jacks Table */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Files Reached</TableCell>
                <TableCell>Total Files</TableCell>
                <TableCell>Knowledge Breadth</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jacks.map(dev => (
                <TableRow key={dev.github}>
                  <TableCell>{dev.name}</TableCell>
                  <TableCell>{dev.files_reached}</TableCell>
                  <TableCell>{dev.total_files}</TableCell>
                  <TableCell>{(dev.knowledge_breadth * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Mavens Table */}
      <TabPanel value={tab} index={3}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Rare Files Count</TableCell>
                <TableCell>Mavenness</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mavens.map(dev => (
                <TableRow key={dev.github}>
                  <TableCell>{dev.name}</TableCell>
                  <TableCell>{dev.rare_files_count}</TableCell>
                  <TableCell>{(dev.mavenness * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Connectors Table */}
      <TabPanel value={tab} index={4}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Betweenness Centrality</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {connectors.map(dev => (
                <TableRow key={dev.github}>
                  <TableCell>{dev.name}</TableCell>
                  <TableCell>{dev.betweenness_centrality}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Critical Files Table */}
      <TabPanel value={tab} index={5}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>File Path</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>Contributors</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {criticalFiles.map(file => (
                <TableRow key={file.file_path}>
                  <TableCell>{file.file_path}</TableCell>
                  <TableCell>{file.filename}</TableCell>
                  <TableCell>{file.contributors}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Collaborations Table */}
      <TabPanel value={tab} index={6}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Developer 1</TableCell>
                <TableCell>Developer 2</TableCell>
                <TableCell>Strength</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collaborations.map(pair => (
                <TableRow key={`${pair.developer1}-${pair.developer2}`}> 
                  <TableCell>{pair.name1}</TableCell>
                  <TableCell>{pair.name2}</TableCell>
                  <TableCell>{pair.collaboration_strength}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Replacements Table */}
      <TabPanel value={tab} index={7}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Leaving Developer</TableCell>
                <TableCell>Replacement</TableCell>
                <TableCell>Leaving Files</TableCell>
                <TableCell>Shared Files</TableCell>
                <TableCell>Overlap Ratio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {replacements.map(rep => (
                <TableRow key={`${rep.leavingDev}-${rep.github}`}> 
                  <TableCell>{rep.leavingDev}</TableCell>
                  <TableCell>{rep.name}</TableCell>
                  <TableCell>{rep.leaving_dev_file_count}</TableCell>
                  <TableCell>{rep.shared_file_count}</TableCell>
                  <TableCell>{(rep.overlap_ratio * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Knowledge Distribution */}
      <TabPanel value={tab} index={8}>
        {knowledgeDist && (
          <Paper sx={{ p: 2 }}>
            <Typography>Top Contributor: {knowledgeDist.top_contributor}</Typography>
            <Typography>Top Coverage: {(knowledgeDist.top_coverage * 100).toFixed(1)}%</Typography>
            <Typography>Average Coverage: {(knowledgeDist.average_coverage * 100).toFixed(1)}%</Typography>
            <Typography>Std Dev: {(knowledgeDist.coverage_std_dev * 100).toFixed(1)}%</Typography>
            <Typography>Skewness: {knowledgeDist.skewness.toFixed(2)}</Typography>
            <Typography>Distribution: {knowledgeDist.distribution_type}</Typography>
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
};

export default TraceabilityContent;