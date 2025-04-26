const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  headline: { // Article title/headline
    type: String,
    required: true
  },
  author: { // News publisher's full name
    type: String,
    required: true
  },
  content: { // Main content of the article
    type: String,
    required: true
  },
  slug: { // Article slug for URL/ID
    type: String,
    required: true,
    unique: true
  },
  tags: { // Article flair/tag(s) (i.e. "Game Update," "Announcement," or "Satire")
    type: [String],
    default: []
  },
  publish_date: {
    type: Date,
    required: true
  },
  visibility: {
    type: String,
    enum: ['archived', 'under-review', 'unlisted', 'draft', 'visible'],
    default: 'draft'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('Article', ArticleSchema);
