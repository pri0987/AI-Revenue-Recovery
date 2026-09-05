const RecoveryCase = require("../models/RecoveryCase");
const Customer = require("../models/Customer");

const { analyzeCustomer } = require("./aiAgent");
const { createAuditLog } = require("./auditService");
const { retryPayment } = require("./paymentGateway");


/* =====================================================
   PROCESS ONE CUSTOMER
   ===================================================== */

async function processCustomer(customer) {

    try {

        /* -------------------------------------------------
           AI ANALYSIS
        ------------------------------------------------- */

        const analysis =
            analyzeCustomer(customer);


        /* -------------------------------------------------
           AUDIT: AI DECISION
        ------------------------------------------------- */

        await createAuditLog({

            customer: customer._id,

            eventType: "ai_decision",

            riskScore:
                customer.riskScore || 0,

            action:
                analysis.action,

            message:
                analysis.recommendation,

            amountAtRisk:
                customer.revenueAtRisk ||
                customer.amount ||
                0

        });


        /* -------------------------------------------------
           CHECK FOR EXISTING ACTIVE CASE
        ------------------------------------------------- */

        const existingCase =
            await RecoveryCase.findOne({

                customer: customer._id,

                status: {
                    $in: [
                        "pending",
                        "processing"
                    ]
                }

            });

            const previousReminderCount =
    await RecoveryCase.aggregate([
        {
            $match: {
                customer: customer._id,
                action: {
                    $in: [
                        "send_reminder",
                        "recovery_message"
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$reminderCount"
                }
            }
        }
    ]);

const totalPreviousReminders =
    previousReminderCount.length > 0
        ? previousReminderCount[0].total
        : 0;


        if (existingCase) {

            return {

                success: true,

                skipped: true,

                message:
                    "Customer already has an active recovery case.",

                recoveryCase:
                    existingCase,

                analysis
            };
        }


        /* -------------------------------------------------
           INITIAL VALUES
        ------------------------------------------------- */

        let status = "processing";

        let recoveredAmount = 0;

        let stopReason = "";

        let retryCount =
            customer.failedAttempts || 0;

        let reminderCount = totalPreviousReminders;


        /* =================================================
           STOP RULE 1
           PAYMENT ALREADY PAID
           ================================================= */

        if (
            customer.paymentStatus ===
            "paid"
        ) {

            status = "stopped";

            stopReason =
                "Payment already completed.";

        }


        /* =================================================
           STOP RULE 2
           MAXIMUM RETRIES
           ================================================= */

        else if (
            analysis.action ===
                "retry_payment" &&
            retryCount >= 3
        ) {

            status = "stopped";

            stopReason =
                "Maximum payment retry limit reached.";

        }


        /* =================================================
   ACTION: RETRY PAYMENT
   ================================================= */

else if (
    analysis.action ===
    "retry_payment"
) {

    retryCount += 1;


    /* ---------------------------------------------
       CALL MOCK PAYMENT GATEWAY
       --------------------------------------------- */

    const paymentResult =
        await retryPayment(customer);


    /* ---------------------------------------------
       PAYMENT SUCCESS
       --------------------------------------------- */

    if (
        paymentResult.success
    ) {

        recoveredAmount =
            customer.amount || 0;

        status =
            "recovered";


        /* -----------------------------------------
           UPDATE CUSTOMER
           ----------------------------------------- */

        await Customer.findByIdAndUpdate(
            customer._id,
            {
                paymentStatus: "paid",

                subscription: "active",

                failedAttempts:
                    retryCount,

                revenueAtRisk: 0,

                lastPaymentAttempt:
                    new Date()
            }
        );


    }

    /* ---------------------------------------------
       PAYMENT FAILURE
       --------------------------------------------- */

    else {

        status =
            "failed";

        stopReason =
            paymentResult.message;


        await Customer.findByIdAndUpdate(
            customer._id,
            {
                failedAttempts:
                    retryCount,

                lastPaymentAttempt:
                    new Date()
            }
        );
    }
}


        /* =================================================
           ACTION: SEND REMINDER
           ================================================= */

        else if (
    analysis.action === "send_reminder"
) {

    reminderCount += 1;

    if (reminderCount > 2) {

        status = "stopped";

        stopReason =
            "Maximum of 2 recovery reminders reached.";

    } else {

        status = "processing";

    }

}
else if (
    analysis.action === "recovery_message"
) {

    reminderCount += 1;

    if (reminderCount > 2) {

        status = "stopped";

        stopReason =
            "Maximum of 2 recovery messages reached.";

    } else {

        status = "processing";

    }

}


        /* =================================================
           ACTION: ESCALATE
           ================================================= */

        else if (
            analysis.action ===
            "escalate"
        ) {

            status =
                "processing";

        }


        /* =================================================
           ACTION: STOP
           ================================================= */

        else {

            status =
                "stopped";

            stopReason =
                "No suitable recovery action found.";

        }


        /* =================================================
           DETERMINE ISSUE TYPE
           ================================================= */

        let issueType =
            "payment_failed";


        if (
            customer.paymentStatus ===
            "overdue"
        ) {

            issueType =
                "invoice_overdue";

        } else if (
            customer.subscription ===
            "failed"
        ) {

            issueType =
                "subscription_failed";

        }


        /* =================================================
           DETERMINE RISK LEVEL
           ================================================= */

        let riskLevel =
            "low";


        if (
            customer.riskScore >= 75
        ) {

            riskLevel =
                "critical";

        } else if (
            customer.riskScore >= 50
        ) {

            riskLevel =
                "high";

        } else if (
            customer.riskScore >= 25
        ) {

            riskLevel =
                "medium";
        }


        /* =================================================
           CREATE RECOVERY CASE
           ================================================= */

        const recoveryCase =
            new RecoveryCase({

                customer:
                    customer._id,

                issueType,

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0,

                riskLevel,

                aiRecommendation:
                    analysis.recommendation,

                action:
                    analysis.action,

                status,

                recoveredAmount,

                retryCount,

                reminderCount,

                stopReason,

                processedAt:
                    new Date()

            });


        await recoveryCase.save();


        /* =================================================
           AUDIT RESULT
           ================================================= */

        if (
            status ===
            "recovered"
        ) {

            await createAuditLog({

                customer:
                    customer._id,

                recoveryCase:
                    recoveryCase._id,

                eventType:
                    "recovery_success",

                riskScore:
                    customer.riskScore,

                action:
                    analysis.action,

                message:
                    "Revenue successfully recovered and customer payment status updated.",

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0,

                recoveredAmount

            });


        } else if (
            status ===
            "failed"
        ) {

            await createAuditLog({

                customer:
                    customer._id,

                recoveryCase:
                    recoveryCase._id,

                eventType:
                    "recovery_failed",

                riskScore:
                    customer.riskScore,

                action:
                    analysis.action,

                message:
                    stopReason,

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0

            });


        } else if (
            status ===
            "stopped"
        ) {

            await createAuditLog({

                customer:
                    customer._id,

                recoveryCase:
                    recoveryCase._id,

                eventType:
                    "recovery_stopped",

                riskScore:
                    customer.riskScore,

                action:
                    analysis.action,

                message:
                    stopReason,

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0

            });


        } else if (
            analysis.action ===
            "send_reminder"
        ) {

            await createAuditLog({

                customer:
                    customer._id,

                recoveryCase:
                    recoveryCase._id,

                eventType:
                    "reminder_sent",

                riskScore:
                    customer.riskScore,

                action:
                    analysis.action,

                message:
                    "Payment recovery reminder scheduled.",

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0

            });


        } else if (
            analysis.action ===
            "escalate"
        ) {

            await createAuditLog({

                customer:
                    customer._id,

                recoveryCase:
                    recoveryCase._id,

                eventType:
                    "case_escalated",

                riskScore:
                    customer.riskScore,

                action:
                    analysis.action,

                message:
                    "Recovery case escalated to the recovery team.",

                amountAtRisk:
                    customer.revenueAtRisk ||
                    customer.amount ||
                    0

            });
        }


        /* =================================================
           RETURN RESULT
           ================================================= */

        return {

            success: true,

            skipped: false,

            recoveryCase,

            analysis

        };


    } catch (error) {

        console.error(
            "Recovery engine error:",
            error.message
        );

        return {

            success: false,

            message:
                error.message

        };
    }
}


module.exports = {
    processCustomer
};