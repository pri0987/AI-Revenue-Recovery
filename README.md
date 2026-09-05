# 💰 AI Revenue Recovery

> **Find revenue that's slipping away — and win it back.**

AI Revenue Recovery is a hackathon-ready platform that detects customers at risk of payment failure, calculates revenue at risk, prioritizes recovery opportunities, selects bounded recovery actions, executes the workflow, measures recovered revenue, and maintains an audit trail.

## 🚀 Project Overview

Businesses lose revenue because of failed payments, insufficient funds, expired cards, bank declines, gateway errors, failed subscriptions, and overdue payments.

This project provides an end-to-end recovery workflow:

```text
Customer Data
     ↓
Risk Engine
     ↓
Revenue at Risk
     ↓
AI Decision Engine
     ↓
Priority Ranking
     ↓
Recovery Engine
     ↓
Retry / Reminder / Recovery Message / Escalation / Stop
     ↓
Recovery Result
     ↓
MongoDB
     ↓
Dashboard + Analytics + Audit Trail
```

**Core principle:** Detect → Prioritize → Decide → Act → Measure → Audit

---

## ✨ Key Features

- 🔍 Customer risk detection
- 💵 Revenue-at-risk calculation
- 🤖 Rule-based AI decision engine
- 🎯 Priority-based recovery
- 💳 Mock payment gateway
- 🔄 Automated recovery batch processing
- 🛡️ Bounded payment retries
- 📩 Bounded recovery reminders/messages
- 🚨 Case escalation
- 🧾 Complete audit trail
- 📊 Dashboard and recovery analytics
- 📈 Revenue recovered measurement

### Risk Levels

| Score | Risk |
|---:|---|
| 0–24 | Low |
| 25–49 | Medium |
| 50–74 | High |
| 75–100 | Critical |

### Recovery Actions

| Action | Purpose |
|---|---|
| `retry_payment` | Retry potentially temporary payment failures |
| `send_reminder` | Ask the customer to resolve payment issues |
| `recovery_message` | Start a subscription/payment recovery workflow |
| `escalate` | Escalate high-value or repeatedly failed cases |
| `stop` | Stop when no further automated action is appropriate |

---

## 🧠 AI Decision Engine

The current prototype uses a deterministic, rule-based decision engine.

Typical logic:

```text
Payment already paid?
       ↓ YES
      STOP

Failed attempts >= 3?
       ↓ YES
    ESCALATE

Critical risk + significant revenue?
       ↓ YES
    ESCALATE

Insufficient funds?
       ↓ YES
  RETRY PAYMENT

Gateway error?
       ↓ YES
  RETRY PAYMENT

Expired card?
       ↓ YES
 SEND REMINDER

Bank declined?
       ↓ YES
 SEND REMINDER

Overdue payment?
       ↓ YES
 SEND REMINDER

Failed subscription?
       ↓ YES
RECOVERY MESSAGE

Otherwise
       ↓
      STOP
```

---

## 🎯 Priority-Based Recovery

Recovery cases are prioritized using:

```text
Priority Score =
60% Risk Contribution
+
40% Revenue Contribution
```

This helps the agent process high-value and high-risk opportunities first.

---

## 🛡️ Safety Controls

### Maximum Payment Attempts

```text
Maximum Payment Attempts = 3
```

After the limit, automatic retries stop and the case can be escalated.

### Maximum Recovery Reminders

```text
Maximum Recovery Reminders = 2
```

After the limit, additional automated reminders/messages are stopped.

These controls demonstrate bounded automation and help prevent excessive customer contact.

---

## 💳 Mock Payment Gateway

The project contains a simulated payment gateway for demonstration.

| Failure Reason | Retry Result |
|---|---|
| Insufficient funds | Payment succeeds |
| Gateway error | Payment succeeds |
| Expired card | Payment fails |
| Bank declined | Payment fails |
| Unknown | Payment fails |

> **Note:** This is a mock gateway. It does not process real payments.

---

## 📊 Dashboard

The frontend provides:

### KPI Cards
- Revenue at Risk
- Revenue Recovered
- Recovery Rate
- Customers at Risk

### AI Agent
- Agent status
- Recovery activity
- Cases processed
- Actions executed

### AI Decisions
- Customer
- Risk score
- Revenue at risk
- Recommended action
- Explanation
- Timestamp

### Recovery Cases
Displays cases created by the recovery engine.

### Audit Trail
Records important decisions and recovery events.

### Analytics
Tracks:
- Recovered cases
- Failed cases
- Processing cases
- Stopped cases
- Recovered amount
- Revenue at risk
- Recovery rate
- Action distribution

---

## 🧾 Audit Trail

Important events include:

```text
ai_decision
recovery_success
recovery_failed
recovery_stopped
reminder_sent
case_escalated
```

The audit trail answers:

> **Why did the system take this action?**

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   Customer Data     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    Risk Engine      │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Revenue at Risk     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   AI Decision       │
                    │      Engine         │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Priority Ranking    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │  Recovery Engine    │
                    └──────────┬──────────┘
                               ↓
          ┌────────────┬────────────┬─────────────┐
          ↓            ↓            ↓             ↓
        Retry       Reminder    Recovery Msg   Escalate
          └────────────┴────────────┴─────────────┘
                               ↓
                    ┌─────────────────────┐
                    │  Recovery Result    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │      MongoDB        │
                    └──────────┬──────────┘
                               ↓
              ┌─────────────────────────────────┐
              │ Dashboard / Analytics / Audit  │
              └─────────────────────────────────┘
```

---

## 📁 Project Structure

```text
AI-Revenue-Recovery/
│
├── README.md
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   │
│   ├── models/
│   │   ├── Customer.js
│   │   ├── RecoveryCase.js
│   │   └── AuditLog.js
│   │
│   ├── routes/
│   │   ├── customers.js
│   │   ├── recovery.js
│   │   ├── dashboard.js
│   │   └── audit.js
│   │
│   └── services/
│       ├── riskEngine.js
│       ├── aiAgent.js
│       ├── recoveryEngine.js
│       ├── auditService.js
│       └── paymentGateway.js
│
└── Frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Font Awesome

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### AI
- Rule-based AI Decision Engine
- Risk Scoring Engine
- Priority Ranking

### Development
- Visual Studio Code
- Live Server
- Postman / Browser API testing

---

# ⚙️ How to Run

## 1. Open the Project

Open the project in Visual Studio Code:

```text
AI-Revenue-Recovery/
├── backend/
└── Frontend/
```

## 2. Install Node.js

Verify Node.js and npm:

```bash
node --version
npm --version
```

## 3. Install Backend Dependencies

Open a terminal:

```bash
cd backend
npm install
```

## 4. Configure MongoDB Atlas

Create a MongoDB Atlas cluster and obtain your connection string.

Create:

```text
backend/.env
```

Add:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revenue_recovery
PORT=5000
```

> **Important:** Never commit `.env` or database credentials to GitHub.

## 5. Start the Backend

From the `backend` folder:

```bash
node server.js
```

Expected output:

```text
MongoDB connected successfully
Server running on http://localhost:5000
```

## 6. Start the Frontend

Open:

```text
Frontend/index.html
```

using the **Live Server** extension in Visual Studio Code.

Right-click `index.html` → **Open with Live Server**.

The frontend will normally open at:

```text
http://127.0.0.1:5500/Frontend/index.html
```

The exact port may vary.

## 7. Verify the Backend

Open:

```text
http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "AI Revenue Recovery API is running"
}
```

---

# 🧪 How to Test

## 1. Generate Demo Customers

```http
POST /api/customers/generate
```

```text
http://localhost:5000/api/customers/generate
```

## 2. Recalculate Risk

```http
POST /api/customers/recalculate-risk
```

```text
http://localhost:5000/api/customers/recalculate-risk
```

## 3. View Customers

```http
GET /api/customers
```

## 4. Run Recovery Batch

```http
POST /api/recovery/run-batch
```

```text
http://localhost:5000/api/recovery/run-batch
```

The batch:

```text
Find at-risk customers
        ↓
Calculate priority
        ↓
Run AI decision engine
        ↓
Execute recovery action
        ↓
Update MongoDB
        ↓
Create audit records
        ↓
Return results
```

## 5. View Recovery Cases

```http
GET /api/recovery/cases
```

## 6. View AI Decisions

```http
GET /api/recovery/ai-decisions
```

## 7. View Audit Trail

```http
GET /api/audit
```

## 8. View Dashboard Statistics

```http
GET /api/dashboard/stats
```

## 9. View Analytics

```http
GET /api/dashboard/analytics
```

---

# 🔌 API Reference

## Customer APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| POST | `/api/customers/generate` | Generate demo customers |
| POST | `/api/customers/recalculate-risk` | Recalculate risk |

## Recovery APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recovery/cases` | Get recovery cases |
| POST | `/api/recovery/run-batch` | Run AI recovery batch |
| GET | `/api/recovery/ai-decisions` | Get AI decisions |

## Dashboard APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Dashboard KPIs |
| GET | `/api/dashboard/recent-cases` | Recent cases |
| GET | `/api/dashboard/activity` | Recent activity |
| GET | `/api/dashboard/recovery-summary` | Recovery summary |
| GET | `/api/dashboard/analytics` | Recovery analytics |

## Audit APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit` | Complete audit trail |
| GET | `/api/audit/customer/:id` | Customer audit history |

---

# 🧪 Recommended Hackathon Demo

1. Start MongoDB Atlas.
2. Start the backend:
   ```bash
   cd backend
   node server.js
   ```
3. Start the frontend with Live Server.
4. Generate demo customers.
5. Recalculate customer risk.
6. Show the dashboard KPIs.
7. Run the recovery batch.
8. Show AI decisions.
9. Show recovered cases.
10. Show the audit trail.
11. Show analytics and recovered revenue.

### Demo Flow

```text
Payment Failure
      ↓
Risk Detection
      ↓
Revenue at Risk
      ↓
AI Decision
      ↓
Priority
      ↓
Recovery Action
      ↓
Recovered / Failed / Stopped
      ↓
Audit Trail
      ↓
Business Metrics
```

---

# 📈 Example Scenario

A customer has:

```text
Payment Status: Failed
Failure Reason: Insufficient Funds
Failed Attempts: 1
Amount: ₹5,000
```

The AI engine can select:

```text
RETRY PAYMENT
```

If the mock gateway succeeds:

```text
Payment Status → Paid
Recovered Amount → ₹5,000
Recovery Case → Recovered
```

An audit event is also recorded.

---

# 🚦 Escalation Example

If:

```text
Payment Status: Failed
Failed Attempts: 3
Revenue at Risk: ₹15,000
```

the system does not keep retrying indefinitely:

```text
Automatic Retry
      ↓
STOP
      ↓
ESCALATE
```

This demonstrates bounded automation.

---

# 🔐 Security Notes

For production deployment:

- Keep MongoDB credentials in `.env`
- Never commit `.env` to Git
- Validate API input
- Authenticate sensitive APIs
- Authorize administrative actions
- Rate-limit recovery APIs
- Secure customer information
- Encrypt sensitive data
- Use a production payment provider securely
- Maintain tamper-resistant audit logs

---

# ⚠️ Prototype Limitations

This is a hackathon/academic prototype.

### Rule-Based AI
The current AI engine is deterministic and rule-based rather than a trained ML model or external LLM.

### Mock Payment Gateway
Payments are simulated and no real financial transactions are performed.

### Simulated Communication
Reminder and recovery-message actions represent workflow execution but do not send real customer communications.

### Synthetic Data
Generated customers are synthetic test data.

---

# 🔮 Future Improvements

- Machine-learning recovery prediction
- LLM-powered personalized recovery messages
- Real payment gateway integration
- Email/SMS/WhatsApp recovery
- Smart retry scheduling
- Advanced customer segmentation
- Voice-based recovery agent
- Multilingual recovery workflows
- Production authentication and authorization
- Real-time monitoring and alerts

---

# 🏆 Hackathon Value Proposition

The project does not simply identify failed payments.

It creates an end-to-end revenue recovery workflow:

```text
Detect
  ↓
Prioritize
  ↓
Decide
  ↓
Act
  ↓
Measure
  ↓
Audit
```

> **Recover revenue while keeping automated interventions bounded, explainable, and auditable.**

---

# 🎤 Hackathon Pitch

### One-Line Pitch

> **"Our AI Revenue Recovery agent doesn't just detect lost revenue — it prioritizes the highest-value risks, chooses a bounded recovery action, executes it, measures the money recovered, and records every decision."**

### Short Pitch

Businesses lose revenue every day because of failed payments, expired cards, bank declines, subscription failures, and overdue invoices.

Our platform identifies revenue at risk, calculates customer risk, prioritizes valuable recovery opportunities, and automatically selects an appropriate intervention.

It can retry payments, send recovery reminders, generate recovery messages, or escalate high-value cases.

Every action is bounded by safety rules and recorded in an audit trail.

The result is a measurable recovery system connecting:

```text
Risk → Decision → Action → Revenue → Audit
```

---

# 👨‍💻 Project Information

**Project:** AI Revenue Recovery  
**Track:** AI Revenue Recovery  
**Category:** Artificial Intelligence / FinTech / Revenue Automation  
**Technology:** HTML, CSS, JavaScript, Node.js, Express.js, MongoDB

---

# 📄 License

This project is developed as a hackathon/academic prototype and is intended for educational and demonstration purposes.

---

## 💰 The Goal

**Don't just detect revenue leakage.**

**Recover it.**

**Measure it.**

**Explain it.**

**Audit it.**

> ### 🚀 AI Revenue Recovery — Turning Payment Failures Into Recovered Revenue.
