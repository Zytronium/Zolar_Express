#!/usr/bin/node
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const router = express.Router();


// Tell Express to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(express.static('public'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Server-side routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/zolarexpress');

// Test route: get articles
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find().sort({date: -1}).limit(20);
        res.json(articles);
    } catch (err) {
        console.error(`Error fetching articles: ${err}`);
        res.status(500).json({error: 'Failed to fetch articles'});
    }
});

// Route: Get article data by slug (JSON)
app.get('/article/:slug', async (req, res) => {
    const slug = req.params.slug;
    const article = await Article.findOne({ slug });

    if (!article) return res.status(404).send('Article not found');

    res.render('article', {
        headline: article.headline,
        author: article.author,
        createdAt: new Date(article.createdAt).toLocaleDateString(),
        updatedAt: new Date(article.updatedAt).toLocaleDateString(),
        publish_date: article.publish_date.toLocaleDateString(),
        tags: article.tags,
        content: article.content,
        slug: article.slug
    });
});


// Test route: create new article
app.get('/api/create-article', async (req, res) => {
    try {
        const {
            headline,
            author,
            content,
            slug,
            tags,
            publish_date,
            visibility
        } = req.query; // get params from URL

        if (!headline || !author || !content || !slug || !publish_date) {
            return res.status(400).json({error: 'Missing required fields.'});
        }

        const newArticle = new Article({
            headline,
            author,
            content,
            slug,
            tags: tags ? tags.split(',') : [], // split tags if provided
            publish_date: new Date(publish_date), // make sure it's a Date
            visibility: visibility || 'draft'
        });

        await newArticle.save();
        res.status(201).json({
            message: 'Article created!',
            article: newArticle
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({error: 'Failed to create article.'});
    }
});


module.exports = router;
