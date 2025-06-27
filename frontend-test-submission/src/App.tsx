import React, { useState } from 'react';
import './App.css';
import { log } from './logger';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
      });
      log('info', 'Shortened URL created', { longUrl, shortUrl: SHORT_URL_PREFIX + code, expiry, shortcode: code });
    }
    setResults(newResults);
    setUsedShortcodes(newShortcodes);
    setError(null);
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
  return <div>Statistics Page (to be implemented)</div>;
}

function App() {
  React.useEffect(() => {
    log('info', 'App loaded');
  }, []);

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
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
        </Routes>
      </Container>
    </Router>
  );
}

export default App;