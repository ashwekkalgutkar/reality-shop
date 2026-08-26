import { getVideoById, createEngagementEvent } from '../db/queries.js';

const ALLOWED_EVENT_TYPES = new Set(['view', 'click', 'add_to_cart']);

export function handleCreateEvent(req, res, next) {
  try {
    const { videoId, eventType } = req.body;

    // Validate videoId presence & type
    if (videoId === undefined || videoId === null || isNaN(Number(videoId))) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "videoId" must be a valid number.'
      });
    }

    const parsedVideoId = Number(videoId);

    // Validate eventType presence & enum
    if (!eventType || typeof eventType !== 'string' || !ALLOWED_EVENT_TYPES.has(eventType.trim())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Field "eventType" must be one of: ${Array.from(ALLOWED_EVENT_TYPES).join(', ')}.`
      });
    }

    // Check video existence
    const video = getVideoById(parsedVideoId);
    if (!video) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Video with ID ${parsedVideoId} was not found.`
      });
    }

    // Create event
    const createdEvent = createEngagementEvent(parsedVideoId, eventType.trim());

    return res.status(201).json({
      message: 'Event recorded successfully',
      data: createdEvent
    });
  } catch (err) {
    next(err);
  }
}
