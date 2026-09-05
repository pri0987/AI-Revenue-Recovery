const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const RecoveryCase = require("../models/RecoveryCase");

const { processCustomer } =
  require("../services/recoveryEngine");

const { calculateRisk } =
  require("../services/riskEngine");


/* =====================================================
   GET ALL RECOVERY CASES
   ===================================================== */

router.get("/cases", async (req, res) => {

  try {

    const cases =
      await RecoveryCase.find()
        .populate("customer")
        .sort({
          createdAt: -1
        });


    res.json({

      success: true,

      count:
        cases.length,

      cases

    });


  } catch (error) {

    console.error(
      "Fetch recovery cases error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to fetch recovery cases",

      error:
        error.message

    });

  }

});


/* =====================================================
   RUN INTELLIGENT RECOVERY BATCH
   ===================================================== */

router.post("/run-batch", async (req, res) => {

  try {

    /* -------------------------------------------------
       1. FIND CUSTOMERS REQUIRING RECOVERY
       ------------------------------------------------- */

    const customers =
      await Customer.find({

        $or: [

          {
            paymentStatus:
              "failed"
          },

          {
            paymentStatus:
              "overdue"
          },

          {
            subscription:
              "failed"
          }

        ]

      });


    /* -------------------------------------------------
       2. NO CUSTOMERS REQUIRE RECOVERY
       ------------------------------------------------- */

    if (
      customers.length === 0
    ) {

      return res.json({

        success: true,

        message:
          "No customers currently require recovery",

        processed: 0,

        recovered: 0,

        recoveredCustomers: 0,

        skippedCustomers: 0,

        failedCustomers: 0,

        revenueAtRisk: 0,

        results: []

      });

    }


    /* -------------------------------------------------
       3. RECALCULATE RISK SCORES
       ------------------------------------------------- */

    customers.forEach(
      (customer) => {

        const risk =
          calculateRisk(customer);


        customer.riskScore =
          risk.score;


        customer.revenueAtRisk =
          risk.revenueAtRisk;

      }
    );


    /* -------------------------------------------------
       4. FIND MAX REVENUE AT RISK
       -------------------------------------------------

       Used to normalize revenue between 0 and 100.
    */

    const maxRevenueAtRisk =
      Math.max(

        ...customers.map(
          (customer) =>
            Number(
              customer.revenueAtRisk
            ) || 0
        ),

        1

      );


    /* -------------------------------------------------
       5. CALCULATE PRIORITY SCORE
       -------------------------------------------------

       Risk contribution     = 60%
       Revenue contribution  = 40%

       Formula:

       Priority =
       (Risk × 0.6) +
       (Normalized Revenue × 0.4)
    */

    customers.forEach(
      (customer) => {

        const riskScore =
          Number(
            customer.riskScore
          ) || 0;


        const revenue =
          Number(
            customer.revenueAtRisk
          ) || 0;


        const normalizedRevenue =
          (
            revenue /
            maxRevenueAtRisk
          ) * 100;


        customer.priorityScore =
          Number(

            (
              (riskScore * 0.6) +
              (normalizedRevenue * 0.4)
            ).toFixed(2)

          );

      }
    );


    /* -------------------------------------------------
       6. SORT CUSTOMERS BY PRIORITY
       -------------------------------------------------

       Highest priority customers are processed first.
    */

    customers.sort(
      (a, b) => {

        /* First: Priority Score */

        if (
          b.priorityScore !==
          a.priorityScore
        ) {

          return (
            b.priorityScore -
            a.priorityScore
          );

        }


        /* Second: Risk Score */

        if (
          b.riskScore !==
          a.riskScore
        ) {

          return (
            b.riskScore -
            a.riskScore
          );

        }


        /* Third: Revenue */

        return (

          (
            Number(
              b.revenueAtRisk
            ) || 0
          ) -

          (
            Number(
              a.revenueAtRisk
            ) || 0
          )

        );

      }
    );


    /* -------------------------------------------------
       7. PROCESS CUSTOMERS
       ------------------------------------------------- */

    const results = [];


    for (
      const customer of customers
    ) {

      const result =
        await processCustomer(

          customer,

          customer.priorityScore

        );


      results.push({

        customerId:
          customer._id,

        customerName:
          customer.name,

        riskScore:
          customer.riskScore,

        revenueAtRisk:
          customer.revenueAtRisk,

        priorityScore:
          customer.priorityScore,

        result

      });

    }


    /* -------------------------------------------------
       8. CALCULATE BATCH RESULTS
       ------------------------------------------------- */

    let recoveredAmount = 0;

    let recoveredCustomers = 0;

    let skippedCustomers = 0;

    let failedCustomers = 0;


    results.forEach(
      (item) => {

        const result =
          item.result || {};


        /* ---------------------------------------------
           SKIPPED
           --------------------------------------------- */

        if (
          result.skipped
        ) {

          skippedCustomers++;

          return;

        }


        /* ---------------------------------------------
           PROCESSING ERROR
           --------------------------------------------- */

        if (
          !result.success
        ) {

          failedCustomers++;

          return;

        }


        /* ---------------------------------------------
           RECOVERY RESULT
           --------------------------------------------- */

        const recoveryCase =
          result.recoveryCase;


        if (
          recoveryCase &&
          recoveryCase.status ===
            "recovered"
        ) {

          recoveredCustomers++;


          recoveredAmount +=
            Number(
              recoveryCase.recoveredAmount
            ) || 0;

        }

      }
    );


    /* -------------------------------------------------
       9. TOTAL REVENUE AT RISK
       ------------------------------------------------- */

    const revenueAtRisk =
      customers.reduce(

        (
          total,
          customer
        ) => {

          return (

            total +

            (
              Number(
                customer.revenueAtRisk
              ) || 0
            )

          );

        },

        0

      );


    /* -------------------------------------------------
       10. RECOVERY RATE
       ------------------------------------------------- */

    const recoveryRate =
      revenueAtRisk > 0

        ? (
            recoveredAmount /
            revenueAtRisk
          ) * 100

        : 0;


    /* -------------------------------------------------
       11. RETURN BATCH RESULT
       ------------------------------------------------- */

    res.json({

      success: true,

      message:
        "Intelligent recovery batch completed.",

      processed:
        results.length,

      recovered:
        Number(
          recoveredAmount.toFixed(2)
        ),

      recoveredCustomers,

      skippedCustomers,

      failedCustomers,

      revenueAtRisk,

      recoveryRate:
        Number(
          recoveryRate.toFixed(2)
        ),

      results

    });


  } catch (error) {

    console.error(
      "Recovery batch error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Recovery batch failed",

      error:
        error.message

    });

  }

});

/* =====================================================
   GET AI AGENT DECISIONS
   ===================================================== */

router.get("/ai-decisions", async (req, res) => {

  try {

    const AuditLog = require("../models/AuditLog");

    const decisions =
      await AuditLog.find({
        eventType: "ai_decision"
      })
        .populate("customer")
        .sort({
          createdAt: -1
        })
        .limit(50);


    const formattedDecisions =
      decisions.map((log) => {

        return {

          id:
            log._id,

          customerId:
            log.customer?._id || null,

          customerName:
            log.customer?.name ||
            "Unknown Customer",

          email:
            log.customer?.email ||
            "",

          riskScore:
            log.riskScore || 0,

          revenueAtRisk:
            log.amountAtRisk || 0,

          action:
            log.action || "stop",

          recommendation:
            log.message ||
            "No recommendation available.",

          timestamp:
            log.createdAt

        };

      });


    res.json({

      success: true,

      count:
        formattedDecisions.length,

      decisions:
        formattedDecisions

    });


  } catch (error) {

    console.error(
      "AI decisions error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to fetch AI decisions",

      error:
        error.message

    });

  }

});

module.exports = router;