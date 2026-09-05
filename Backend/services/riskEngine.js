function calculateRisk(customer) {

  let score = 0;

  /* =====================================================
     PAYMENT STATUS
     ===================================================== */

  if (customer.paymentStatus === "failed") {
    score += 30;
  }

  if (customer.paymentStatus === "overdue") {
    score += 35;
  }


  /* =====================================================
     SUBSCRIPTION STATUS
     ===================================================== */

  if (customer.subscription === "failed") {
    score += 25;
  }


  /* =====================================================
     FAILED ATTEMPTS
     ===================================================== */

  const failedAttempts =
    customer.failedAttempts || 0;

  score += Math.min(
    failedAttempts * 10,
    30
  );


  /* =====================================================
     FAILURE REASON
     ===================================================== */

  switch (customer.failureReason) {

    case "insufficient_funds":
      score += 10;
      break;

    case "expired_card":
      score += 15;
      break;

    case "bank_declined":
      score += 20;
      break;

    case "gateway_error":
      score += 5;
      break;

    default:
      break;

  }


  /* =====================================================
     LIMIT SCORE
     ===================================================== */

  score =
    Math.min(
      score,
      100
    );


  /* =====================================================
     RISK LEVEL
     ===================================================== */

  let riskLevel = "low";

  if (score >= 75) {

    riskLevel = "critical";

  } else if (score >= 50) {

    riskLevel = "high";

  } else if (score >= 25) {

    riskLevel = "medium";

  }


  /* =====================================================
     REVENUE AT RISK
     ===================================================== */

  const amount =
    Number(
      customer.amount
    ) || 0;


  /*
     Higher risk means a larger portion
     of the payment is considered at risk.
  */

  let riskMultiplier = 0.25;

  if (score >= 75) {

    riskMultiplier = 1.0;

  } else if (score >= 50) {

    riskMultiplier = 0.75;

  } else if (score >= 25) {

    riskMultiplier = 0.50;

  }


  const revenueAtRisk =
    Number(
      (
        amount *
        riskMultiplier
      ).toFixed(2)
    );


  return {

    score,

    riskLevel,

    revenueAtRisk

  };

}


module.exports = {
  calculateRisk
};