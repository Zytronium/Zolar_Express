#!/usr/bin/node
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Server-side routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/api/articles', async (req, res) => {
  const articles = await Article.find().sort({ date: -1 }).limit(20);
  res.json(articles.map(article => ({
    title: article.title,
    summary: article.summary,
    slug: article.slug,
    publisherName: article.publisherName,
    date: article.date,
  })));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/zolarexpress');

// Test route
app.get('/api/articles', async (req, res) => {
  try {
  const articles = await Article.find().sort({ date: -1 }).limit(20);
  res.json(articles);
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: 'Failed to fetch articles'});
  }
});