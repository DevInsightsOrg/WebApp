// RepositoryCheck.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProcessingRepository from '../../pages/repository/ProcessRepository';
import api from '../../services/apiConfig'; // Adjust the import based on your project structure

const RepositoryCheck = ({ repoFullName, children }) => {
  const [status, setStatus] = useState('checking'); 
  const [error, setError] = useState(null);

  // inline status-check against /api/debug/repo/:owner/:repo
  const checkRepositoryStatus = async () => {
    try {
      const [owner, repo] = repoFullName.split('/');
      const response = await api.get(`/api/debug/repo/${owner}/${repo}`);
      const { repository_exists, file_count, commit_count, developer_count } = response.data;
      const isProcessed = repository_exists && file_count > 0 && commit_count > 0;
      console.log(`Repository ${repoFullName} status:`, {
        exists: repository_exists,
        isProcessed,
        fileCount: file_count,
        commitCount: commit_count,
        developerCount: developer_count
      });
      return { exists: repository_exists, isProcessed };
    } catch (err) {
      console.error('Error checking repository status:', err);
      return { exists: false, isProcessed: false };
    }
  };

  useEffect(() => {
    let isMounted = true;
    setStatus('checking');
    checkRepositoryStatus().then(({ exists, isProcessed }) => {
      if (!isMounted) return;
      if (exists && isProcessed) {
        setStatus('processed');
      } else {
        setStatus('unprocessed');
      }
    });
    return () => { isMounted = false; };
  }, [repoFullName]);

  const handleProcess = async () => {
    setStatus('processing');
    setError(null);
    try {
      const res = await api.get(
        `/commits?repo=${encodeURIComponent(repoFullName)}&branch=main&limit=10`,
        { timeout: 120_000 }
      );
      if (res.data.commits?.length > 0) {
        setStatus('processed');
      } else {
        throw new Error('No commits returned after processing');
      }
    } catch (err) {
      console.error('Error processing repository:', err);
      setError(err);
      setStatus('error');
    }
  };

  if (status === 'checking') {
    return <div>Checking repository status…</div>;
  }

  if (status === 'error') {
    return (
      <div style={{ color: 'red' }}>
        <p>Error: {error.message || 'Unknown error'}</p>
        <button onClick={handleProcess}>Retry Processing</button>
      </div>
    );
  }

  if (status === 'unprocessed') {
    // ask user if they want to kick off processing
    return (
      <ProcessingRepository
        onComplete={handleProcess}
        error={error}
      />
    );
  }

  if (status === 'processing') {
    return <div>Processing repository… please wait.</div>;
  }

  // processed
  return <>{children}</>;
};

export default RepositoryCheck;
