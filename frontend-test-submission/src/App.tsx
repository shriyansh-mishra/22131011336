import React, { useState } from 'react';
import './App.css';
import { log } from './logger';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, TextField, Grid, Paper, IconButton, Box, Alert, Stack } from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

interface UrlInput {
  longUrl: string;
  validity: string;
  shortcode: string;
}

interface ShortenedUrl {
  longUrl: string;
  shortUrl: string;
  expiry: string;
  shortcode: string;
  createdAt?: string;
  clicks?: number;
}

const SHORT_URL_PREFIX = window.location.origin + '/';

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(code: string) {
  return /^[a-zA-Z0-9]{1,12}$/.test(code); // alphanumeric, up to 12 chars
}

// Helper to get all short links from localStorage
function getStoredShortLinks(): ShortenedUrl[] {
  const data = localStorage.getItem('shortLinks');
  return data ? JSON.parse(data) : [];
}

function setStoredShortLinks(links: ShortenedUrl[]) {
  localStorage.setItem('shortLinks', JSON.stringify(links));
}

// Helper to get click stats from localStorage
function getClickStats(): Record<string, number> {
  const data = localStorage.getItem('clickStats');
  return data ? JSON.parse(data) : {};
}

function incrementClick(shortcode: string) {
  const stats = getClickStats();
  stats[shortcode] = (stats[shortcode] || 0) + 1;
  localStorage.setItem('clickStats', JSON.stringify(stats));
}

function ShortUrlRedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const links = getStoredShortLinks();
    const found = links.find(l => l.shortcode === shortcode);
    if (!found) {
      setError('Short URL not found.');
      return;
    }
    // Check expiry
    const expiryDate = new Date(found.expiry);
    if (expiryDate < new Date()) {
      setError('This short URL has expired.');
      return;
    }
    // Increment click count
    incrementClick(shortcode!);
    // Redirect
    window.location.href = found.longUrl;
  }, [shortcode]);

  return error ? (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  ) : (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography>Redirecting...</Typography>
    </Box>
  );
}

function UrlShortenerPage() {
  const [inputs, setInputs] = useState<UrlInput[]>([
    { longUrl: '', validity: '', shortcode: '' },
  ]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usedShortcodes, setUsedShortcodes] = useState<Set<string>>(new Set());

  const handleInputChange = (idx: number, field: keyof UrlInput, value: string) => {
    const newInputs = [...inputs];
    newInputs[idx][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { longUrl: '', validity: '', shortcode: '' }]);
    }
  };

  const removeInput = (idx: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== idx));
    }
  };

  const generateShortcode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    } while (usedShortcodes.has(code));
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const newResults: ShortenedUrl[] = [];
    const newShortcodes = new Set(usedShortcodes);
    const now = new Date().toLocaleString();
    for (let i = 0; i < inputs.length; i++) {
      const { longUrl, validity, shortcode } = inputs[i];
      // Validation
      if (!isValidUrl(longUrl)) {
        setError(`Row ${i + 1}: Invalid URL format.`);
        log('error', `Invalid URL format: ${longUrl}`);
        return;
      }
      let validMins = 30;
      if (validity) {
        if (!/^\d+$/.test(validity)) {
          setError(`Row ${i + 1}: Validity must be an integer.`);
          log('error', `Invalid validity: ${validity}`);
          return;
        }
        validMins = parseInt(validity, 10);
      }
      let code = shortcode.trim();
      if (code) {
        if (!isValidShortcode(code)) {
          setError(`Row ${i + 1}: Invalid shortcode (alphanumeric, max 12 chars).`);
          log('error', `Invalid shortcode: ${code}`);
          return;
        }
        if (newShortcodes.has(code)) {
          setError(`Row ${i + 1}: Shortcode '${code}' already used.`);
          log('error', `Shortcode collision: ${code}`);
          return;
        }
      } else {
        code = generateShortcode();
      }
      newShortcodes.add(code);
      const expiry = new Date(Date.now() + validMins * 60000).toLocaleString();
      newResults.push({
        longUrl,
        shortUrl: SHORT_URL_PREFIX + code,
        expiry,
        shortcode: code,
        createdAt: now,
      });
      log('info', 'Shortened URL created', { longUrl, shortUrl: SHORT_URL_PREFIX + code, expiry, shortcode: code });
    }
    setResults(newResults);
    setUsedShortcodes(newShortcodes);
    setError(null);
    // Append to localStorage for redirection
    const prev = getStoredShortLinks();
    setStoredShortLinks([...prev, ...newResults]);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Shorten up to 5 URLs</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {inputs.map((input, idx) => (
            <Paper sx={{ p: 2, mb: 1 }} key={idx}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Long URL"
                  value={input.longUrl}
                  onChange={e => handleInputChange(idx, 'longUrl', e.target.value)}
                  fullWidth
                  required
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Validity (min)"
                  value={input.validity}
                  onChange={e => handleInputChange(idx, 'validity', e.target.value)}
                  fullWidth
                  placeholder="30"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Custom Shortcode"
                  value={input.shortcode}
                  onChange={e => handleInputChange(idx, 'shortcode', e.target.value)}
                  fullWidth
                  placeholder="Optional"
                  sx={{ flex: 1 }}
                />
                <Box>
                  <IconButton onClick={() => addInput()} disabled={inputs.length >= 5} color="primary">
                    <AddCircleIcon />
                  </IconButton>
                  <IconButton onClick={() => removeInput(idx)} disabled={inputs.length <= 1} color="error">
                    <RemoveCircleIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Shorten URLs</Button>
      </form>
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Shortened URLs</Typography>
          {results.map((res, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 1 }}>
              <Typography><b>Original:</b> {res.longUrl}</Typography>
              <Typography><b>Short URL:</b> <a href={res.shortUrl} target="_blank" rel="noopener noreferrer">{res.shortUrl}</a></Typography>
              <Typography><b>Expiry:</b> {res.expiry}</Typography>
              <Typography><b>Shortcode:</b> {res.shortcode}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

function StatisticsPage() {
  const [links, setLinks] = React.useState<ShortenedUrl[]>([]);
  const [clickStats, setClickStats] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    setLinks(getStoredShortLinks());
    setClickStats(getClickStats());
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Shortened URL Statistics</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Short URL</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Original URL</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Created</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Expiry</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>
                  <a href={`/${link.shortcode}`} target="_blank" rel="noopener noreferrer">{link.shortUrl}</a>
                </td>
                <td style={{ padding: 8, wordBreak: 'break-all' }}>{link.longUrl}</td>
                <td style={{ padding: 8 }}>{link.createdAt || '-'}</td>
                <td style={{ padding: 8 }}>{link.expiry}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>{clickStats[link.shortcode] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}

function App() {
  React.useEffect(() => {
    log('info', 'App loaded');
  }, []);

  return (
    <Router>
      <AppBar position="static" sx={{ backgroundColor: '#228B22', color: '#fff' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/stats">
            Statistics
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortenerPage />} />
          <Route path="/stats" element={<StatisticsPage />} />
          <Route path=":shortcode" element={<ShortUrlRedirectPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;