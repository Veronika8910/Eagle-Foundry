import { publishEvent } from '../connectors/sqs.js';
import { logger } from '../connectors/logger.js';
import { EventPayload } from './eventTypes.js';

/**
 * Publish an event to SQS for async processing
 */
export async function publish<T extends EventPayload>(
    type: string,
    payload: T
): Promise<string> {
    try {
        const eventId = await publishEvent(type, payload);
        logger.info({ eventId, type }, 'Event published');
        return eventId;
    } catch (error) {
        logger.error({ type, error }, 'Failed to publish event');
        // Don't throw - event publishing is best-effort
        // The main operation should still succeed
        return '';
    }
}

/**
 * Publish multiple events
 */
export async function publishMany(
    events: Array<{ type: string; payload: EventPayload }>
): Promise<string[]> {
    const eventIds: string[] = [];

    for (const event of events) {
        const eventId = await publish(event.type, event.payload);
        eventIds.push(eventId);
    }

    return eventIds;
}
