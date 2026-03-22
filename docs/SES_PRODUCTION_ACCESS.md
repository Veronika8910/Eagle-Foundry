# Amazon SES: Moving Out of the Sandbox

This guide explains how to request production access for Amazon SES so you can send emails (including OTP verification codes) to **any** recipient—not just verified addresses. It is based on the [official AWS documentation](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html).

---

## 1. Understanding the SES Sandbox

All new Amazon SES accounts start in the **sandbox**. Sandbox status is **per AWS Region**. While in the sandbox:

| Restriction | Description |
|-------------|-------------|
| **Recipients** | You can only send to **verified** email addresses and domains, or to the [Amazon SES mailbox simulator](https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html#send-email-simulator). |
| **Volume** | Maximum **200 messages per 24 hours**. |
| **Rate** | Maximum **1 message per second**. |
| **Suppression list** | Bulk actions and API calls for suppression list management are disabled. |

**After production access**, you can send to any recipient, but you must still verify all **From**, **Source**, **Sender**, or **Return-Path** identities (e.g. `noreply@eaglefoundry.ashland.edu`).

---

## 2. Prerequisites Before Requesting Production Access

Complete these steps before submitting your request. Doing so helps AWS approve your request faster.

### 2.1 Verify Your Sending Identity

1. Go to [SES Console](https://console.aws.amazon.com/ses/) and select your region.
2. Navigate to **Configuration → Verified identities**.
3. Create a domain identity (e.g. `eaglefoundry.ashland.edu`) or an email identity (e.g. `noreply@eaglefoundry.ashland.edu`).
4. Add the DNS records SES provides to your domain’s DNS. Domain verification is preferred.

### 2.2 Configure DNS Records (SPF, DKIM, DMARC)

| Record | Purpose |
|--------|---------|
| **DKIM** | Proves your domain authorized the message. SES provides CNAME records—add them to DNS. |
| **SPF** | Lists servers allowed to send for your domain. Add the TXT record SES suggests. |
| **DMARC** | Policy for handling failures. Add a `_dmarc` TXT record (optional but recommended). |

SES will guide you through DKIM and SPF setup when you verify your domain.

### 2.3 Configure MAIL FROM Domain (Optional but Recommended)

A custom MAIL FROM (e.g. `bounces.eaglefoundry.ashland.edu`) improves deliverability and lets you handle bounces. Configure it in **Verified identities → Your identity → MAIL FROM domain**.

### 2.4 Set Up Email Feedback Notifications

Configure bounce and complaint handling via SNS:

1. Create an SNS topic for bounce and complaint notifications.
2. In SES Console, go to **Configuration → Event destinations**.
3. Add event destinations for **Bounces** and **Complaints** to your SNS topic.
4. Optionally subscribe an SQS queue or Lambda to the SNS topic to process feedback.

---

## 3. Request Production Access via AWS Console

1. Open the [Amazon SES console](https://console.aws.amazon.com/ses/).
2. In the left panel, choose **Account dashboard**.
3. In the warning banner “Your Amazon SES account is in the sandbox”, click **View Get set up page**, then **Request production access**.
4. In the modal:
   - **Mail type**: Select **Transactional** (for OTP, password reset, etc.).
   - **Website URL**: Enter your site URL (e.g. `https://eaglefoundry.ashland.edu`).
   - **Additional contacts**: Up to 4 emails for AWS communications.
   - **Preferred contact language**: English or Japanese.
   - **Acknowledgement**: Check the box that you will only send to users who requested it and that you have bounce/complaint handling in place.
5. Click **Submit request**.

You will receive an initial response within about 24 hours. If AWS needs more information, they will contact you.

---

## 4. Request Production Access via AWS CLI

If you prefer automation or scripted setup:

```bash
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --website-url https://eaglefoundry.ashland.edu \
  --additional-contact-email-addresses admin@eaglefoundry.ashland.edu \
  --contact-language EN
```

| Parameter | Replace With |
|-----------|--------------|
| `TRANSACTIONAL` | Use `MARKETING` only if most email is promotional. |
| `https://eaglefoundry.ashland.edu` | Your website URL. |
| `admin@eaglefoundry.ashland.edu` | Up to 4 comma-separated contact emails. |
| `EN` | `EN` (English) or `JA` (Japanese). |

---

## 5. Post-Approval Checklist

After production access is granted:

1. **Verify sending limits**  
   Check the SES Account dashboard (or use GetAccount API) for your actual regional sending quota.
   Quotas vary by account and region; request an increase via AWS Support if needed.

2. **Set up a suppression list**  
   In SES Console, review **Suppression list** so bounces and complaints are recorded.

3. **Configure bounce/complaint handling**  
   Use SNS → SQS or Lambda to process bounces and complaints and update your user records.

4. **Monitor reputation**  
   Use the SES **Reputation dashboard** and metrics to watch bounce/complaint rates.

5. **Set CloudWatch alarms**  
   Create alarms for high bounce or complaint rates so you can react quickly.

6. **EC2 port 25**  
   If sending from EC2, you may need to [request removal of the port 25 throttle](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-port-25-throttle/).

---

## 6. Temporary Workaround: Sending in the Sandbox

While waiting for production access, you can still send OTP emails **if recipients are verified**:

1. In SES Console, go to **Verified identities**.
2. Click **Create identity**.
3. Choose **Email address** and enter each test user’s email.
4. Have each user click the verification link sent to them.

After verification, you can send OTP emails to those addresses. Use this only for testing; production access is required for real users.

---

## References

- [Request production access (AWS SES Developer Guide)](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [SES sandbox overview](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [EC2 port 25 throttle removal](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-port-25-throttle/)
