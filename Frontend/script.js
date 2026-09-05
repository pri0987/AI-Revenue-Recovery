/* =========================================================
   AI REVENUE RECOVERY
   Frontend JavaScript
   ========================================================= */

const API_BASE_URL = "http://localhost:5000/api";
let analyticsData = null;

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const runRecoveryBtn =
        document.getElementById("runRecoveryBtn");

    const recoveryModal =
        document.getElementById("recoveryModal");

    const closeModal =
        document.getElementById("closeModal");

    const cancelRecovery =
        document.getElementById("cancelRecovery");

    const confirmRecovery =
        document.getElementById("confirmRecovery");

    const refreshAiDecisions =
    document.getElementById("refreshAiDecisions");

if (refreshAiDecisions) {
    refreshAiDecisions.addEventListener(
        "click",
        loadAiDecisions
    );
}

    const revenueRisk =
        document.getElementById("revenueRisk");

    const revenueRecovered =
        document.getElementById("revenueRecovered");

    const recoveryRate =
        document.getElementById("recoveryRate");

    const customersAtRisk =
        document.getElementById("customersAtRisk");

    const casesTable =
        document.getElementById("casesTable");

    const mobileMenu =
        document.querySelector(".mobile-menu");

    const sidebar =
        document.querySelector(".sidebar");


    /* =====================================================
       DASHBOARD DATA
       ===================================================== */

    let dashboardData = {
        revenueAtRisk: 0,
        revenueRecovered: 0,
        customersAtRisk: 0,
        successfulRecoveries: 0,
        totalCases: 0,
        actionsExecuted: 0,
        recoveryRate: 0
    };


    /* =====================================================
       UTILITY FUNCTIONS
       ===================================================== */

    function formatCurrency(amount) {

        const numericAmount =
            Number(amount) || 0;

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(numericAmount);
    }


    function calculateRecoveryRate() {

        if (dashboardData.recoveryRate !== undefined) {
            return Number(dashboardData.recoveryRate) || 0;
        }

        if (
            dashboardData.revenueAtRisk <= 0 &&
            dashboardData.revenueRecovered <= 0
        ) {
            return 0;
        }

        if (dashboardData.revenueAtRisk <= 0) {
            return 100;
        }

        return (
            dashboardData.revenueRecovered /
            (
                dashboardData.revenueAtRisk +
                dashboardData.revenueRecovered
            )
        ) * 100;
    }


    function updateDashboard() {

        if (revenueRisk) {
            revenueRisk.textContent =
                formatCurrency(
                    dashboardData.revenueAtRisk
                );
        }

        if (revenueRecovered) {
            revenueRecovered.textContent =
                formatCurrency(
                    dashboardData.revenueRecovered
                );
        }

        if (customersAtRisk) {
            customersAtRisk.textContent =
                dashboardData.customersAtRisk;
        }

        if (recoveryRate) {
            recoveryRate.textContent =
                calculateRecoveryRate().toFixed(2) + "%";
        }

        updateAgentStats();
    }


    function updateAgentStats() {

        const agentStats =
            document.querySelectorAll(
                ".agent-stats strong"
            );

        if (agentStats.length >= 1) {
            agentStats[0].textContent =
                dashboardData.totalCases
                    .toLocaleString("en-IN");
        }

        if (agentStats.length >= 2) {
            agentStats[1].textContent =
                dashboardData.actionsExecuted
                    .toLocaleString("en-IN");
        }
    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function capitalizeWords(text) {

        return String(text || "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }


    /* =====================================================
       DASHBOARD API
       ===================================================== */

    async function loadDashboardStats() {

        try {

            const response = await fetch(
                `${API_BASE_URL}/dashboard/stats`
            );

            if (!response.ok) {
                throw new Error(
                    `Dashboard API error: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load dashboard statistics"
                );
            }

            const stats =
                data.stats || {};

            dashboardData.revenueAtRisk =
                Number(stats.revenueAtRisk) || 0;

            dashboardData.revenueRecovered =
                Number(stats.revenueRecovered) || 0;

            dashboardData.customersAtRisk =
                Number(stats.customersAtRisk) || 0;

            dashboardData.successfulRecoveries =
                Number(stats.recoveredCases) || 0;

            dashboardData.totalCases =
                Number(stats.totalRecoveryCases) || 0;

            dashboardData.actionsExecuted =
                (
                    Number(stats.recoveredCases) || 0
                ) +
                (
                    Number(stats.pendingCases) || 0
                ) +
                (
                    Number(stats.failedCases) || 0
                ) +
                (
                    Number(stats.stoppedCases) || 0
                );

            dashboardData.recoveryRate =
                Number(stats.recoveryRate) || 0;

            updateDashboard();

            return data;

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            showCaseNotification(
                "Unable to load live dashboard data. Make sure the backend is running."
            );

            return null;
        }
    }
    /* =====================================================
   LOAD RECOVERY ANALYTICS
   ===================================================== */

async function loadRecoveryAnalytics() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/dashboard/analytics`
            );

        if (!response.ok) {
            throw new Error(
                `Analytics API error: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                data.message ||
                "Failed to load analytics"
            );
        }

        analyticsData =
    data.analytics;

updateRecoveryAnalytics();

    } catch (error) {

        console.error(
            "Analytics loading error:",
            error
        );

    }

}

/* =====================================================
   UPDATE RECOVERY ANALYTICS UI
   ===================================================== */

function updateRecoveryAnalytics() {

    if (!analyticsData) {
        return;
    }

    const recovered =
        document.getElementById(
            "analyticsRecovered"
        );

    const failed =
        document.getElementById(
            "analyticsFailed"
        );

    const processing =
        document.getElementById(
            "analyticsProcessing"
        );

    const stopped =
        document.getElementById(
            "analyticsStopped"
        );

    const recoveredAmount =
        document.getElementById(
            "analyticsRecoveredAmount"
        );

    const recoveryRate =
        document.getElementById(
            "analyticsRecoveryRate"
        );


    if (recovered) {
        recovered.textContent =
            analyticsData.recovered;
    }

    if (failed) {
        failed.textContent =
            analyticsData.failed;
    }

    if (processing) {
        processing.textContent =
            analyticsData.processing;
    }

    if (stopped) {
        stopped.textContent =
            analyticsData.stopped;
    }

    if (recoveredAmount) {
        recoveredAmount.textContent =
            formatCurrency(
                analyticsData.recoveredAmount
            );
    }

    if (recoveryRate) {
        recoveryRate.textContent =
            `${analyticsData.recoveryRate}%`;
    }

}


    /* =====================================================
       RECOVERY CASES API
       ===================================================== */

    async function loadRecentCases() {

        try {

            const response = await fetch(
                `${API_BASE_URL}/dashboard/recent-cases`
            );

            if (!response.ok) {
                throw new Error(
                    `Cases API error: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load recovery cases"
                );
            }

            renderRecoveryCases(
                data.cases || []
            );

            return data;

        } catch (error) {

            console.error(
                "Recovery cases loading error:",
                error
            );

            return null;
        }
    }


    function renderRecoveryCases(cases) {

        if (!casesTable) {
            return;
        }

        const tbody = casesTable;

        if (!tbody) {
            console.warn(
                "No <tbody> found inside #casesTable"
            );
            return;
        }

        tbody.innerHTML = "";

        if (!cases || cases.length === 0) {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td colspan="100%" style="text-align:center;">
                    No recovery cases found.
                </td>
            `;

            tbody.appendChild(row);

            return;
        }

        cases.forEach((item) => {

            const customer =
                item.customer || {};

            const riskLevel =
                item.riskLevel || "medium";

            const status =
                item.status || "pending";

            const action =
                item.action || "stop";

            const amount =
                Number(item.amountAtRisk) || 0;

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    <div class="customer">

                        <strong>
                            ${escapeHtml(
                                customer.name ||
                                "Unknown Customer"
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                customer.email || ""
                            )}
                        </small>

                    </div>
                </td>

                <td>
                    ${formatCurrency(amount)}
                </td>

                <td>
                    <span class="risk-badge ${escapeHtml(
                        riskLevel.toLowerCase()
                    )}">
                        ${escapeHtml(
                            capitalizeWords(riskLevel)
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        capitalizeWords(action)
                    )}
                </td>

                <td>
                    <span class="status-badge ${escapeHtml(
                        status.toLowerCase()
                    )}">
                        ${escapeHtml(
                            capitalizeWords(status)
                        )}
                    </span>
                </td>

                <td>
                    <button
                        class="more-btn"
                        type="button"
                        title="View recovery case"
                    >
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                </td>

            `;

            tbody.appendChild(row);

        });
    }


    /* =====================================================
       RECENT ACTIVITY API
       ===================================================== */

    async function loadRecentActivity() {

        try {

            const response = await fetch(
                `${API_BASE_URL}/dashboard/activity`
            );

            if (!response.ok) {
                throw new Error(
                    `Activity API error: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load activity"
                );
            }

            renderRecentActivity(
                data.logs || []
            );

            return data;

        } catch (error) {

            console.error(
                "Activity loading error:",
                error
            );

            return null;
        }
    }


    function renderRecentActivity(logs) {

        const activityList =
            document.querySelector(
                ".activity-list"
            );

        if (!activityList) {
            return;
        }

        activityList.innerHTML = "";

        if (!logs || logs.length === 0) {

            activityList.innerHTML = `
                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="fa-solid fa-clock"></i>
                    </div>

                    <div>
                        <strong>
                            No activity yet
                        </strong>

                        <p>
                            Recovery activity will appear here.
                        </p>

                        <span>
                            Waiting for activity
                        </span>
                    </div>

                </div>
            `;

            return;
        }

        logs
            .slice(0, 4)
            .forEach((log) => {

                const item =
                    document.createElement("div");

                item.className =
                    "activity-item";

                const customerName =
                    log.customer &&
                    log.customer.name
                        ? log.customer.name
                        : "Customer";

                const recoveredAmount =
                    Number(
                        log.recoveredAmount
                    ) || 0;

                const eventType =
                    formatEventType(
                        log.eventType
                    );

                const icon =
                    getActivityIcon(
                        log.eventType
                    );

                const iconClass =
                    getActivityClass(
                        log.eventType
                    );

                item.innerHTML = `

                    <div class="activity-icon ${iconClass}">
                        <i class="${icon}"></i>
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(eventType)}
                        </strong>

                        <p>
                            ${escapeHtml(
                                log.message ||
                                "Recovery activity recorded."
                            )}

                            ${
                                recoveredAmount > 0
                                    ? ` — ${formatCurrency(
                                        recoveredAmount
                                    )} recovered`
                                    : ""
                            }
                        </p>

                        <span>
                            ${escapeHtml(
                                customerName
                            )}
                            ·
                            ${formatRelativeTime(
                                log.createdAt
                            )}
                        </span>

                    </div>

                `;

                activityList.appendChild(item);

            });
    }


    function formatEventType(eventType) {

        if (!eventType) {
            return "Recovery Activity";
        }

        return String(eventType)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }


    function getActivityIcon(eventType) {

        switch (eventType) {

            case "recovery_success":
                return "fa-solid fa-circle-check";

            case "recovery_failed":
                return "fa-solid fa-circle-xmark";

            case "recovery_stopped":
                return "fa-solid fa-stop-circle";

            case "ai_decision":
                return "fa-solid fa-brain";

            case "risk_detected":
                return "fa-solid fa-triangle-exclamation";

            case "reminder_sent":
                return "fa-solid fa-bell";

            case "case_escalated":
                return "fa-solid fa-arrow-up";

            case "recovery_started":
                return "fa-solid fa-play";

            default:
                return "fa-solid fa-circle-info";
        }
    }


    function getActivityClass(eventType) {

        switch (eventType) {

            case "recovery_success":
                return "success";

            case "recovery_failed":
                return "danger";

            case "recovery_stopped":
                return "warning";

            case "risk_detected":
                return "warning";

            default:
                return "";
        }
    }


    function formatRelativeTime(dateValue) {

        if (!dateValue) {
            return "Recently";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Recently";
        }

        const difference =
            Date.now() -
            date.getTime();

        const seconds =
            Math.floor(
                difference / 1000
            );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {
            return `${hours} hr ago`;
        }

        const days =
            Math.floor(
                hours / 24
            );

        return `${days} day${
            days === 1 ? "" : "s"
        } ago`;
    }


    /* =====================================================
       MODAL
       ===================================================== */

    function openModal() {

        if (!recoveryModal) {
            return;
        }

        recoveryModal.classList.add("show");
    }


    function closeRecoveryModal() {

        if (!recoveryModal) {
            return;
        }

        recoveryModal.classList.remove("show");
    }


    if (runRecoveryBtn) {

        runRecoveryBtn.addEventListener(
            "click",
            () => {
                openModal();
            }
        );
    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            () => {
                closeRecoveryModal();
            }
        );
    }


    if (cancelRecovery) {

        cancelRecovery.addEventListener(
            "click",
            () => {
                closeRecoveryModal();
            }
        );
    }


    if (recoveryModal) {

        recoveryModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    recoveryModal
                ) {
                    closeRecoveryModal();
                }

            }
        );
    }


    /* =====================================================
       RUN RECOVERY BATCH
       ===================================================== */

    if (confirmRecovery) {

        confirmRecovery.addEventListener(
            "click",
            async () => {
                await runRecoveryBatch();
            }
        );
    }


    async function runRecoveryBatch() {

        if (!confirmRecovery) {
            return;
        }

        confirmRecovery.disabled = true;

        confirmRecovery.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Processing...
        `;

        closeRecoveryModal();

        showProcessingState();

        try {

            /* ---------------------------------------------
               STEP 1
               --------------------------------------------- */

            updateAgentText(
                "Detecting revenue at risk..."
            );

            await delay(700);


            /* ---------------------------------------------
               STEP 2
               --------------------------------------------- */

            updateAgentText(
                "Analyzing customer behavior..."
            );

            await delay(700);


            /* ---------------------------------------------
               STEP 3
               --------------------------------------------- */

            updateAgentText(
                "Selecting recovery interventions..."
            );

            await delay(700);


            /* ---------------------------------------------
               STEP 4
               --------------------------------------------- */

            updateAgentText(
                "Executing recovery workflows..."
            );

            await delay(700);


            /* ---------------------------------------------
               CALL BACKEND
               --------------------------------------------- */

            const response =
                await fetch(
                    `${API_BASE_URL}/recovery/run-batch`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Recovery API error: ${response.status}`
                );
            }


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Recovery batch failed"
                );
            }


            /* ---------------------------------------------
               CALCULATE RESULT
               --------------------------------------------- */

            const results =
                data.results || [];

            const recoveredAmount =
                results.reduce(
                    (
                        total,
                        result
                    ) => {

                        const recoveryCase =
                            result.recoveryCase ||
                            {};

                        return (
                            total +
                            (
                                Number(
                                    recoveryCase.recoveredAmount
                                ) || 0
                            )
                        );

                    },
                    0
                );


            const recoveredCustomers =
                results.filter(
                    (result) => {

                        const recoveryCase =
                            result.recoveryCase ||
                            {};

                        return (
                            result.success &&
                            recoveryCase.status ===
                            "recovered"
                        );
                    }
                ).length;


            const actions =
                results.filter(
                    (result) =>
                        result.success
                ).length;


            const result = {

                recoveredAmount,

                recoveredCustomers,

                actions,

                processed:
                    Number(
                        data.processed
                    ) || 0,

                timestamp:
                    new Date()
            };


            /* ---------------------------------------------
               REFRESH DASHBOARD
               --------------------------------------------- */

            await loadDashboardStats();

            await loadRecentCases();

            await loadRecentActivity();

            await loadAiDecisions();

            await loadRecoveryAnalytics();


            /* ---------------------------------------------
               SHOW COMPLETION
               --------------------------------------------- */

            showRecoveryComplete(
                result
            );


            if (
                Number(data.processed) ===
                0
            ) {

                showCaseNotification(
                    "No customers currently require recovery."
                );

            } else {

                showCaseNotification(
                    `Recovery batch completed — ${data.processed} customer(s) processed.`
                );
            }


        } catch (error) {

            console.error(
                "Recovery batch error:",
                error
            );


            const agentTitle =
                document.querySelector(
                    ".agent-main h4"
                );


            const agentDescription =
                document.querySelector(
                    ".agent-main p"
                );


            if (agentTitle) {

                agentTitle.textContent =
                    "Recovery batch failed";
            }


            if (agentDescription) {

                agentDescription.textContent =
                    error.message ||
                    "Unable to run recovery batch.";
            }


            showCaseNotification(
                error.message ||
                "Failed to run recovery batch."
            );


        } finally {

            confirmRecovery.disabled =
                false;

            confirmRecovery.innerHTML = `
                <i class="fa-solid fa-play"></i>
                Start Recovery
            `;
        }
    }


    /* =====================================================
       PROCESSING STATE
       ===================================================== */

    function showProcessingState() {

        const agentTitle =
            document.querySelector(
                ".agent-main h4"
            );

        const agentDescription =
            document.querySelector(
                ".agent-main p"
            );


        if (agentTitle) {

            agentTitle.textContent =
                "AI agent is working...";
        }


        if (agentDescription) {

            agentDescription.textContent =
                "Analyzing active revenue-risk cases and executing recovery workflows.";
        }
    }


    function updateAgentText(text) {

        const agentDescription =
            document.querySelector(
                ".agent-main p"
            );


        if (agentDescription) {

            agentDescription.textContent =
                text;
        }
    }


    /* =====================================================
       RECOVERY COMPLETE
       ===================================================== */

    function showRecoveryComplete(result) {

        const agentTitle =
            document.querySelector(
                ".agent-main h4"
            );

        const agentDescription =
            document.querySelector(
                ".agent-main p"
            );


        if (agentTitle) {

            agentTitle.textContent =
                "Recovery batch completed";
        }


        if (agentDescription) {

            if (
                result.recoveredAmount > 0
            ) {

                agentDescription.innerHTML = `
                    <strong style="color:#16a34a;">
                        ${formatCurrency(
                            result.recoveredAmount
                        )}
                    </strong>
                    recovered across
                    <strong>
                        ${result.recoveredCustomers}
                    </strong>
                    customers.
                `;

            } else {

                agentDescription.innerHTML = `
                    Recovery batch completed.
                    No payments were recovered in this run.
                `;
            }
        }


        updateAgentStats();


        setTimeout(
            () => {

                if (agentTitle) {

                    agentTitle.textContent =
                        "Agent is monitoring";
                }


                if (agentDescription) {

                    agentDescription.textContent =
                        "Analyzing payment events and identifying recovery opportunities.";
                }

            },
            5000
        );
    }


    /* =====================================================
       TABLE INTERACTION
       ===================================================== */

    if (casesTable) {

        casesTable.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        ".more-btn"
                    );


                if (!button) {
                    return;
                }


                const row =
                    button.closest("tr");


                if (!row) {
                    return;
                }


                const customer =
                    row.querySelector(
                        ".customer strong"
                    );


                if (!customer) {
                    return;
                }


                showCaseNotification(
                    `Opening recovery case for ${customer.textContent}`
                );
            }
        );
    }


    /* =====================================================
       TOAST NOTIFICATION
       ===================================================== */

    function showCaseNotification(message) {

        let toast =
            document.querySelector(
                ".toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.className =
                "toast";

            document.body.appendChild(
                toast
            );
        }


        toast.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            <span>
                ${escapeHtml(message)}
            </span>
        `;


        setTimeout(
            () => {
                toast.classList.add(
                    "show"
                );
            },
            10
        );


        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
    }


    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }


    /* Close sidebar when clicking outside */

    document.addEventListener(
        "click",
        (event) => {

            if (
                window.innerWidth <= 900 &&
                sidebar &&
                sidebar.classList.contains(
                    "open"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                mobileMenu &&
                !mobileMenu.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }
    );


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const navLinks =
    document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", () => {

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });
});


    /* =====================================================
       CHART RANGE
       ===================================================== */

    const chartRange =
        document.getElementById(
            "chartRange"
        );


    if (chartRange) {

        chartRange.addEventListener(
            "change",
            () => {

                const value =
                    chartRange.value;


                showCaseNotification(
                    `Showing recovery performance for the last ${value} days`
                );
            }
        );
    }


    /* =====================================================
       VIEW AGENT ACTIVITY
       ===================================================== */

    const viewAgentBtn =
        document.querySelector(
            ".view-agent-btn"
        );


    if (viewAgentBtn) {

        viewAgentBtn.addEventListener(
            "click",
            () => {

                showCaseNotification(
                    "AI Agent activity panel opened"
                );
            }
        );
    }


    /* =====================================================
       DELAY
       ===================================================== */

    function delay(ms) {

        return new Promise(
            (resolve) => {

                setTimeout(
                    resolve,
                    ms
                );
            }
        );
    }

    /* =====================================================
   AI AGENT DECISIONS
   ===================================================== */

async function loadAiDecisions() {

    const container =
        document.getElementById(
            "aiDecisionsList"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/recovery/ai-decisions`
            );


        if (!response.ok) {

            throw new Error(
                `AI decisions API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load AI decisions"
            );

        }


        renderAiDecisions(
            data.decisions || []
        );


    } catch (error) {

        console.error(
            "AI decisions loading error:",
            error
        );


        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h4>
                    Unable to load AI decisions
                </h4>

                <p>
                    Make sure the backend is running.
                </p>

            </div>

        `;

    }

}
async function loadAuditLogs() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/audit`
        );

        if (!response.ok) {
            throw new Error(
                `Audit API error: ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message ||
                "Failed to load audit logs"
            );
        }

        renderAuditLogs(data.logs || []);

    } catch (error) {
        console.error(
            "Audit logs loading error:",
            error
        );
    }
}
function renderAuditLogs(logs) {

    const auditList =
        document.getElementById("auditList");

    if (!auditList) {
        return;
    }

    if (!logs.length) {

        auditList.innerHTML = `
            <div class="ai-empty-state">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <h4>No audit events yet</h4>
                <p>Recovery activity will appear here.</p>
            </div>
        `;

        return;
    }

    auditList.innerHTML = logs
        .slice(0, 20)
        .map((log) => {

            const customerName =
                log.customer?.name ||
                "Unknown Customer";

            const eventType =
                log.eventType ||
                "activity";

            const timestamp =
                log.createdAt
                    ? new Date(
                        log.createdAt
                    ).toLocaleString()
                    : "Unknown time";

            return `
                <div class="audit-item">

                    <div class="audit-icon">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>

                    <div class="audit-content">

                        <strong>
                            ${eventType}
                        </strong>

                        <span>
                            ${customerName}
                        </span>

                        <small>
                            ${timestamp}
                        </small>

                    </div>

                </div>
            `;
        })
        .join("");
}


function renderAiDecisions(decisions) {

    const container =
        document.getElementById(
            "aiDecisionsList"
        );


    if (!container) {
        return;
    }


    if (
        !decisions ||
        decisions.length === 0
    ) {

        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-brain"></i>

                <h4>
                    No AI decisions yet
                </h4>

                <p>
                    Run a recovery batch to see AI decisions.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    decisions.forEach(
        (decision) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "ai-decision-card";


            const risk =
                Number(
                    decision.riskScore
                ) || 0;


            const amount =
                Number(
                    decision.revenueAtRisk
                ) || 0;


            let riskLabel =
                "Low";


            if (risk >= 75) {

                riskLabel =
                    "Critical";

            } else if (risk >= 50) {

                riskLabel =
                    "High";

            } else if (risk >= 25) {

                riskLabel =
                    "Medium";

            }


            card.innerHTML = `

                <div class="ai-decision-top">

                    <div class="ai-customer">

                        <div class="ai-customer-icon">

                            <i class="fa-solid fa-user"></i>

                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    decision.customerName
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    decision.email
                                )}
                            </small>

                        </div>

                    </div>


                    <span class="risk-badge ${riskLabel.toLowerCase()}">

                        ${riskLabel}

                    </span>

                </div>


                <div class="ai-decision-metrics">

                    <div class="ai-metric">

                        <strong>
                            Risk:
                        </strong>

                        ${risk}/100

                    </div>


                    <div class="ai-metric">

                        <strong>
                            Revenue:
                        </strong>

                        ${formatCurrency(amount)}

                    </div>


                    <div class="ai-metric">

                        <strong>
                            Action:
                        </strong>

                        ${escapeHtml(
                            capitalizeWords(
                                decision.action
                            )
                        )}

                    </div>

                </div>


                <div class="ai-recommendation">

                    <strong>
                        AI Reasoning:
                    </strong>

                    ${escapeHtml(
                        decision.recommendation
                    )}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


    /* =====================================================
       INITIALIZE
       ===================================================== */

    updateDashboard();


    Promise.all([
    loadDashboardStats(),
    loadRecentCases(),
    loadRecentActivity(),
    loadAiDecisions(),
    loadRecoveryAnalytics(),
    loadAuditLogs()
])
        .catch(
            (error) => {

                console.error(
                    "Initialization error:",
                    error
                );
            }
        );

});