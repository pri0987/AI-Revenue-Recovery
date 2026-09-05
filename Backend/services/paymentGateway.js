/* =========================================================
   MOCK PAYMENT GATEWAY
   Used for hackathon demonstration
   ========================================================= */

async function retryPayment(customer) {

    /*
     * This is a simulated payment gateway.
     *
     * No real money is charged.
     */

    const failureReason =
        customer.failureReason || "unknown";


    /* ---------------------------------------------
       SUCCESS CONDITIONS
       --------------------------------------------- */

    if (
        failureReason === "insufficient_funds"
    ) {

        return {
            success: true,
            status: "paid",
            message:
                "Payment succeeded after retry."
        };
    }


    if (
        failureReason === "gateway_error"
    ) {

        return {
            success: true,
            status: "paid",
            message:
                "Temporary gateway error resolved."
        };
    }


    /* ---------------------------------------------
       FAILURE CONDITIONS
       --------------------------------------------- */

    if (
        failureReason === "expired_card"
    ) {

        return {
            success: false,
            status: "failed",
            message:
                "Payment failed because the card is expired."
        };
    }


    if (
        failureReason === "bank_declined"
    ) {

        return {
            success: false,
            status: "failed",
            message:
                "Payment was declined by the bank."
        };
    }


    /* ---------------------------------------------
       DEFAULT
       --------------------------------------------- */

    return {
        success: false,
        status: "failed",
        message:
            "Payment could not be completed."
    };
}


module.exports = {
    retryPayment
};