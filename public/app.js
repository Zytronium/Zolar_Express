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
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <h3>${article.title}</h3>
        <p class="meta">By ${article.publisherName} • ${new Date(article.date).toLocaleDateString()}</p>
        <p>${article.summary}</p>
        <a href="/factions/${article.slug}" class="read-more">Read more</a>
      `;
      newsList.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load news:', err);
    document.getElementById('news-list').innerHTML = '<p>Error loading news articles.</p>';
  }
}

document.addEventListener('DOMContentLoaded', fetchNews);
