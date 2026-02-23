# OTP Email Consumer Lambda

This Lambda consumes SQS events published by the backend and sends OTP emails through SES.

## Supported Event Types

- `email.otp_requested`
- `email.password_reset_otp_requested`

Expected SQS message body:

```json
{
  "eventId": "uuid",
  "type": "email.otp_requested",
  "occurredAt": "2026-02-21T00:00:00.000Z",
  "payload": {
    "email": "user@example.com",
    "otp": "<REDACTED>",
    "purpose": "signup",
    "expiresAt": "2026-02-21T00:10:00.000Z"
  }
}
```

## Environment Variables

- `AWS_REGION`: AWS region (example: `us-east-1`)
- `SES_FROM_EMAIL`: Verified SES sender identity

## Runtime + Handler

- Runtime: `nodejs20.x`
- Handler: `handler.handler`

## Recommended Lambda Settings

- Trigger: SQS queue used by backend (`SQS_EVENTS_QUEUE_URL`)
- Batch size: `10` (or lower if you prefer lower retry blast radius)
- Enable **report batch item failures** to allow partial retries
- Configure DLQ on the source SQS queue

## IAM Permissions

Grant Lambda execution role:

- `ses:SendEmail` for your sender identity
- `sqs:ReceiveMessage` for the source SQS queue ARN
- `sqs:DeleteMessage` for the source SQS queue ARN
- `sqs:ChangeMessageVisibility` for the source SQS queue ARN
- `sqs:GetQueueAttributes` for the source SQS queue ARN
- `sqs:GetQueueUrl` for the source SQS queue ARN
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`
