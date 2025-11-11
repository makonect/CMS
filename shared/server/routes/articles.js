import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getRelatedArticles,
  generateAIContent,
  getArticleCategories
} from '../controllers/articleController.js';

const router = express.Router();

router.get('/', getArticles);
router.get('/categories', getArticleCategories);
router.get('/:id', getArticle);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.get('/related/:id', getRelatedArticles);
router.post('/generate/ai-content', generateAIContent);

export default router;