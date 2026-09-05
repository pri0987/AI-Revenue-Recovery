const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const RecoveryCase = require("../models/RecoveryCase");
const AuditLog = require("../models/AuditLog");

// GET DASHBOARD STATISTICS
router.get("/stats", async (req, res) => {
  try {
    const customers = await Customer.find();
    const recoveryCases = await RecoveryCase.find();

    // Total customers with revenue at risk
    const customersAtRisk = customers.filter(
      (customer) => (customer.revenueAtRisk || 0) > 0
    ).length;

    // Total revenue at risk
    const revenueAtRisk = customers.reduce(
      (total, customer) =>
        total + (customer.revenueAtRisk || 0),
      0
    );

    // Total recovered revenue
    const revenueRecovered = recoveryCases.reduce(
      (total, recoveryCase) =>
        total + (recoveryCase.recoveredAmount || 0),
      0
    );

    // Recovery rate
    const recoveryRate =
      revenueAtRisk > 0
        ? (revenueRecovered / revenueAtRisk) * 100
        : 0;

    // Recovery case counts
    const recoveredCases = recoveryCases.filter(
      (item) => item.status === "recovered"
    ).length;

    const pendingCases = recoveryCases.filter(
      (item) =>
        item.status === "pending" ||
        item.status === "processing"
    ).length;

    const failedCases = recoveryCases.filter(
      (item) => item.status === "failed"
    ).length;

    const stoppedCases = recoveryCases.filter(
      (item) => item.status === "stopped"
    ).length;

    res.json({
      success: true,

      stats: {
        revenueAtRisk,
        revenueRecovered,
        recoveryRate: Number(recoveryRate.toFixed(2)),
        customersAtRisk,

        recoveredCases,
        pendingCases,
        failedCases,
        stoppedCases,

        totalRecoveryCases: recoveryCases.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});


// GET RECENT RECOVERY CASES
router.get("/recent-cases", async (req, res) => {
  try {
    const cases = await RecoveryCase.find()
      .populate("customer")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent recovery cases",
      error: error.message,
    });
  }
});


// GET RECENT ACTIVITY
router.get("/activity", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("customer")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
});
/* =====================================================
   RECOVERY SUMMARY
   ===================================================== */

router.get("/recovery-summary", async (req, res) => {
  try {
    const cases = await RecoveryCase.find();

    const summary = {
      totalCases: cases.length,
      recovered: 0,
      failed: 0,
      processing: 0,
      stopped: 0,
      totalRecovered: 0,
      totalAtRisk: 0
    };

    cases.forEach((item) => {

      summary.totalAtRisk +=
        Number(item.amountAtRisk) || 0;

      summary.totalRecovered +=
        Number(item.recoveredAmount) || 0;

      if (item.status === "recovered") {
        summary.recovered++;
      }

      if (item.status === "failed") {
        summary.failed++;
      }

      if (item.status === "processing") {
        summary.processing++;
      }

      if (item.status === "stopped") {
        summary.stopped++;
      }

    });

    summary.recoveryRate =
      summary.totalAtRisk > 0
        ? Number(
            (
              (summary.totalRecovered /
                summary.totalAtRisk) *
              100
            ).toFixed(2)
          )
        : 0;

    res.json({
      success: true,
      summary
    });

  } catch (error) {

    console.error(
      "Recovery summary error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch recovery summary",
      error: error.message
    });

  }
});
/* =====================================================
   RECOVERY ANALYTICS
   ===================================================== */

router.get("/analytics", async (req, res) => {

  try {

    const cases = await RecoveryCase.find();

    const analytics = {
      recovered: 0,
      failed: 0,
      processing: 0,
      stopped: 0,

      recoveredAmount: 0,
      atRiskAmount: 0,

      actions: {
        retry_payment: 0,
        send_reminder: 0,
        recovery_message: 0,
        escalate: 0,
        stop: 0
      }
    };


    cases.forEach((item) => {

      const amountAtRisk =
        Number(item.amountAtRisk) || 0;

      const recoveredAmount =
        Number(item.recoveredAmount) || 0;


      analytics.atRiskAmount +=
        amountAtRisk;

      analytics.recoveredAmount +=
        recoveredAmount;


      /* STATUS */

      if (item.status === "recovered") {
        analytics.recovered++;
      }

      else if (item.status === "failed") {
        analytics.failed++;
      }

      else if (item.status === "processing") {
        analytics.processing++;
      }

      else if (item.status === "stopped") {
        analytics.stopped++;
      }


      /* ACTION */

      if (
        analytics.actions[item.action] !==
        undefined
      ) {

        analytics.actions[item.action]++;

      }

    });


    const recoveryRate =
      analytics.atRiskAmount > 0

        ? (
            analytics.recoveredAmount /
            analytics.atRiskAmount
          ) * 100

        : 0;


    res.json({

      success: true,

      analytics: {

        ...analytics,

        recoveryRate:
          Number(
            recoveryRate.toFixed(2)
          )

      }

    });


  } catch (error) {

    console.error(
      "Analytics error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to fetch recovery analytics",

      error:
        error.message

    });

  }

});

module.exports = router;