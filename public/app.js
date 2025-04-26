// Fetch and display articles from the server
async function fetchNews() {
  try {
    const response = await fetch('/api/articles'); // Expected backend route
    const articles = await response.json();
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = ''; // Clear any existing content

    if (articles.length === 0) {
      newsList.innerHTML = '<p>No news articles available yet.</p>';
      return;
    }

    articles.forEach(article => {
      let articleContent = article.content;

      if (articleContent.length > 256) {
        articleContent = articleContent.substring(0, 255) + '...';
      }
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <h3>${article.headline}</h3>
        <p class="meta">By ${article.author} • ${new Date(article.publish_date).toLocaleDateString()}</p>
        <p>${articleContent}</p>
        <a href="/article/${article.slug}" class="read-more">Read more</a>
      `;
      newsList.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load news:', err);
    document.getElementById('news-list').innerHTML = '<p>Error loading news articles.</p>';
  }
}

document.addEventListener('DOMContentLoaded', fetchNews);
