import { getPaginatedVideoAnalytics, getOverallAnalyticsSummary, getAllVideoIds } from '../db/queries.js';

export function handleGetVideoAnalytics(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Query parameters "page" and "limit" must be positive integers.'
      });
    }

    const result = getPaginatedVideoAnalytics(page, limit);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export function handleGetOverallSummary(req, res, next) {
  try {
    const summary = getOverallAnalyticsSummary();
    return res.status(200).json({ data: summary });
  } catch (err) {
    next(err);
  }
}

export function handleGetVideoIds(req, res, next) {
  try {
    const ids = getAllVideoIds();
    return res.status(200).json({ data: ids });
  } catch (err) {
    next(err);
  }
}
