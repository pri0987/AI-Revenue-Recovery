const express = require("express");
const router = express.Router();


const Customer = require("../models/Customer");
const { calculateRisk } = require("../services/riskEngine");

// GET all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

/* =====================================================
   GENERATE RANDOM CUSTOMERS
   ===================================================== */

router.post("/generate", async (req, res) => {

  try {

    const count = Math.min(
      Math.max(
        Number(req.body.count) || 10,
        1
      ),
      1000
    );


    const firstNames = [
      "Rahul",
      "Amit",
      "Priya",
      "Rohit",
      "Neha",
      "Ankit",
      "Sneha",
      "Vikas",
      "Pooja",
      "Arjun",
      "Karan",
      "Simran",
      "Aditya",
      "Nisha",
      "Vivek",
      "Riya",
      "Saurabh",
      "Anjali",
      "Manish",
      "Kavya"
    ];


    const lastNames = [
      "Kumar",
      "Singh",
      "Sharma",
      "Verma",
      "Gupta",
      "Yadav",
      "Patel",
      "Mehta",
      "Mishra",
      "Das",
      "Jain",
      "Roy",
      "Shah",
      "Sinha",
      "Agarwal"
    ];


    const failureReasons = [
      "insufficient_funds",
      "expired_card",
      "gateway_error",
      "bank_declined",
      "unknown"
    ];


    const customers = [];


    for (let i = 0; i < count; i++) {

      const name =
        `${firstNames[
          Math.floor(
            Math.random() *
            firstNames.length
          )
        ]} ${
          lastNames[
            Math.floor(
              Math.random() *
              lastNames.length
            )
          ]
        }`;


      const amountOptions = [
        499,
        999,
        1499,
        1999,
        2499,
        3999,
        4999,
        7499,
        9999,
        14999,
        19999
      ];


      const amount =
        amountOptions[
          Math.floor(
            Math.random() *
            amountOptions.length
          )
        ];


      const failureReason =
        failureReasons[
          Math.floor(
            Math.random() *
            failureReasons.length
          )
        ];


      const failedAttempts =
        Math.floor(
          Math.random() * 4
        );


      const customer =
        new Customer({

          name,

          email:
            `${name
              .toLowerCase()
              .replace(/\s+/g, ".")
            }.${Date.now()}${i}@example.com`,

          phone:
            `9${Math.floor(
              100000000 +
              Math.random() *
              900000000
            )}`,

          subscription:
            Math.random() < 0.75
              ? "failed"
              : "active",

          paymentStatus:
            Math.random() < 0.8
              ? "failed"
              : "overdue",

          amount,

          failureReason,

          failedAttempts,

          lastPaymentAttempt:
            new Date(),

          riskScore: 0,

          revenueAtRisk:
            amount

        });


      /* ---------------------------------------------
         CALCULATE RISK
         --------------------------------------------- */

      const risk =
        calculateRisk(customer);


      customer.riskScore =
        risk.score;

      customer.revenueAtRisk =
        risk.revenueAtRisk;


      customers.push(customer);
    }


    const savedCustomers =
      await Customer.insertMany(
        customers
      );


    res.status(201).json({

      success: true,

      message:
        `${savedCustomers.length} random customers generated successfully.`,

      count:
        savedCustomers.length,

      customers:
        savedCustomers

    });


  } catch (error) {

    console.error(
      "Customer generation error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to generate random customers",

      error:
        error.message

    });

  }

});
/* =====================================================
   RECALCULATE ALL CUSTOMER RISKS
   ===================================================== */

router.post("/recalculate-risk", async (req, res) => {

  try {

    const customers = await Customer.find();

    let updated = 0;

    for (const customer of customers) {

      const risk =
        calculateRisk(customer);

      customer.riskScore =
        risk.score;

      customer.revenueAtRisk =
        risk.revenueAtRisk;

      await customer.save();

      updated++;

    }

    res.json({

      success: true,

      message:
        "Customer risk scores recalculated successfully.",

      updated

    });

  } catch (error) {

    console.error(
      "Risk recalculation error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to recalculate customer risks",

      error:
        error.message

    });

  }

});
// GET one customer
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// CREATE customer
router.post("/", async (req, res) => {
  try {
    const customer = new Customer(req.body);

    // Calculate risk automatically
    const risk = calculateRisk(customer);

    customer.riskScore = risk.score;
    customer.revenueAtRisk = risk.revenueAtRisk;

    const savedCustomer = await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: savedCustomer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
});

module.exports = router;