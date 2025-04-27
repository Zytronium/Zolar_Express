#!/usr/bin/node
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
const router = express.Router();
const newsFilePath = path.join(__dirname, 'database/news_articles.json');
const publisherFilePath = path.join(__dirname, 'database/news_publishers.json');

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

// Test route: get articles
app.get('/api/articles', async (req, res) => {
    fs.readFile(newsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading articles: ${err})`);
            return res.status(500).json({ error: 'Failed to fetch articles' });
        }

        const articles = JSON.parse(data);
        articles.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
        res.json(articles.slice(0, 32)); // Char limit of 32 characters
    });
});

// Route: Get article data by slug (JSON)
app.get('/article/:slug', async (req, res) => {
    const slug = req.params.slug;

    fs.readFile(newsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading articles: ${err}`);
            return res.status(500).json({ error: 'Error reading articles' });
        }

        const articles = JSON.parse(data);
        const article = articles.find(a => a.slug === slug);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        // Fetch the publisher data (assuming it's in a JSON file, similar to articles)
        fs.readFile(publisherFilePath, 'utf8', (err, publisherData) => {
            if (err) {
                console.error(`Error reading publishers: ${err}`);
                return res.status(500).json({ error: 'Error reading publisher data' });
            }

            const publishers = JSON.parse(publisherData);
            const publisher = publishers.find(pub => pub.name === article.author);

            // Create the HTML for the tags
            const tagsHTML = (article.tags || [])
                .map(tag => `<span class="tag-${tag.replaceAll(" ", "-").toLowerCase()}">${escapeHTML(tag)}</span>`)
                .join("");

            // Handle publisher name display logic
            const publisherName = getPublisherName(publisher, article.author);

            res.render('article', {
                headline: article.headline,
                author: article.author,
                publisherName, // Add publisher name for clickable link
                publisherId: publisher?.id, // Pass the publisher id for the link
                createdAt: new Date(article.created_at).toLocaleDateString(),
                updatedAt: new Date(article.updated_at).toLocaleDateString(),
                publish_date: new Date(article.publish_date).toLocaleDateString(),
                tagsHTML, // Pass the HTML for tags
                content: article.content,
                slug: article.slug
            });
        });
    });
});

// Helper function to get the publisher's name
function getPublisherName(publisher, author) {
    if (!publisher)
        return author !== null ? author : 'Unknown';

    let name;
    if (publisher.use_short_name && publisher.use_short_name.includes('Publisher Page')) {
        name = publisher.short_name;
    } else {
        name = publisher.name || 'Unknown';
    }

    if (publisher.show_initials) {
        name += ` (${publisher.initials})`;
    }

    return 'obamna';
}

// Slugify an article headline
function slugify(headline) {
    return headline
      .toLowerCase()                                       // convert to lowercase
      .replace(/[^a-z0-9\s-]/g, '')  // remove non-alphanumeric, non-space, non-hyphen
      .trim()                                              // remove leading/trailing whitespace
      .replace(/\s+/g, '-')          // replace spaces with hyphens
      .replace(/-+/g, '-');          // collapse multiple hyphens
}

function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

// Test route: create new article
app.get('/api/create-article', async (req, res) => {
        const {
            headline,
            author,
            content,
            slug = slugify(headline),
            tags,
            publish_date,
            visibility
        } = req.query; // get params from URL

        if (!headline || !author || !content || !publish_date) {
            return res.status(400).json({error: 'Missing required fields.'});
        }

        const newArticle = {
            headline,
            author,
            content,
            slug,
            tags: tags ? tags.split(',') : [],
            visibility: visibility || 'draft',
            publish_date: new Date(publish_date),
            created_at: new Date(),
            updated_at: new Date()
        };

        fs.readFile(newsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading articles: ${err}`);
                return res.status(500).json({ error: 'Failed to read articles' });
            }

            const articles = JSON.parse(data);
            articles.push(newArticle);

            fs.writeFile(newsFilePath, JSON.stringify(articles, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing new article: ${err}`);
                    return res.status(500).json({ error: 'Failed to create article' });
                }
                res.status(201).json({
                    message: 'Article created successfully!',
                    article: newArticle
                });
            });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = router;
