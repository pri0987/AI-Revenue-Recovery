const AuditLog = require("../models/AuditLog");

async function createAuditLog({
  customer,
  recoveryCase = null,
  eventType,
  riskScore = 0,
  action = "",
  message,
  amountAtRisk = 0,
  recoveredAmount = 0,
  metadata = {},
}) {
  try {
    const log = new AuditLog({
      customer,
      recoveryCase,
      eventType,
      riskScore,
      action,
      message,
      amountAtRisk,
      recoveredAmount,
      metadata,
    });

    return await log.save();
  } catch (error) {
    console.error("Audit log error:", error.message);
    return null;
  }
}

module.exports = {
  createAuditLog,
};