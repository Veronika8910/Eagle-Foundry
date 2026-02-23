# Lambda Consumer Contracts

This document defines the SQS envelope and payload contracts produced by the backend.

## SQS Envelope (all events)

Each message published to `SQS_EVENTS_QUEUE_URL` has this envelope:

```json
{
  "eventId": "uuid",
  "type": "string",
  "occurredAt": "ISO-8601 timestamp",
  "payload": {}
}
```

## OTP Email Events

### `email.otp_requested`

Sent when signup verification OTP is generated.

### `email.password_reset_otp_requested`

Sent when password-reset OTP is generated.

Payload for both event types:

```json
{
  "email": "user@example.com",
  "otp": "<REDACTED>",
  "purpose": "signup" | "password_reset",
  "expiresAt": "2026-02-21T00:10:00.000Z"
}
```

> **Note:** Never log or display OTP codes in plaintext.

## Processing Requirements

1. Consumers must be idempotent (SQS is at-least-once delivery).
2. Consumers should use partial batch response for retries (`batchItemFailures`).
3. A DLQ must be configured for the source queue.
4. Never log OTP codes in plaintext.
