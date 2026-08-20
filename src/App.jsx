import { useState } from "react";

const BACKEND = "https://res-backend-neon.vercel.app";

const BILL_AGENT = "POS-001";
const KOT_AGENT = "POS-002";

// ======================================================
// BILL RECEIPT
// ======================================================

function createBill() {
  const receipt = `
================================
          FOODFLOW POS
================================

Invoice: INV-0001
Date: 2026-08-20
Cashier: admin

--------------------------------
Item              Qty     Price
--------------------------------
Fried Rice         2    1400.00
Coke               2     400.00
--------------------------------

Subtotal:              1800.00
Tax:                    180.00

TOTAL:                1980.00

        THANK YOU!

================================


`;

  return btoa(receipt);
}

// ======================================================
// KOT
// ======================================================

function createKOT() {
  const kot = `
================================
             KOT
================================

Order: INV-0001
Date: 2026-08-20
Time: 20:30
Cashier: admin

--------------------------------
ITEM              QTY
--------------------------------

Fried Rice          2
Coke                2

--------------------------------

         KITCHEN
         ORDER

================================



`;

  return btoa(kot);
}

// ======================================================
// SEND PRINT JOB
// ======================================================

async function sendPrintJob(agentId, printData) {
  const response = await fetch(
    `${BACKEND}/api/print`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        agentId,
        printData
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      `Print failed for ${agentId}`
    );
  }

  return result;
}

// ======================================================
// APP
// ======================================================

function App() {
  const [status, setStatus] = useState("");
  const [printing, setPrinting] = useState(false);

  const [agentStatus, setAgentStatus] = useState({
    bill: "Unknown",
    kot: "Unknown"
  });

  // ====================================================
  // TEST BACKEND
  // ====================================================

  const testBackend = async () => {
    try {
      setStatus("Checking backend...");

      const response = await fetch(
        `${BACKEND}/api/health`
      );

      const data = await response.json();

      if (!data.success) {
        setStatus("Backend error ❌");
        return;
      }

      const agents = data.agents || [];

      const billOnline =
        agents.includes(BILL_AGENT);

      const kotOnline =
        agents.includes(KOT_AGENT);

      setAgentStatus({
        bill: billOnline
          ? "Online"
          : "Offline",

        kot: kotOnline
          ? "Online"
          : "Offline"
      });

      setStatus(
        `Backend connected ✅`
      );

    } catch (error) {
      console.error(error);

      setStatus(
        "Backend connection failed ❌"
      );
    }
  };

  // ====================================================
  // PRINT BILL + KOT
  // ====================================================

  const printOrder = async () => {
    if (printing) {
      return;
    }

    try {
      setPrinting(true);

      setStatus(
        "Sending BILL and KOT..."
      );

      // -----------------------------------------------
      // Create print data
      // -----------------------------------------------

      const billData =
        createBill();

      const kotData =
        createKOT();

      // -----------------------------------------------
      // Send BILL and KOT simultaneously
      // -----------------------------------------------

      const [
        billResult,
        kotResult
      ] = await Promise.allSettled([

        sendPrintJob(
          BILL_AGENT,
          billData
        ),

        sendPrintJob(
          KOT_AGENT,
          kotData
        )

      ]);

      // -----------------------------------------------
      // BILL result
      // -----------------------------------------------

      const billSuccess =
        billResult.status === "fulfilled";

      // -----------------------------------------------
      // KOT result
      // -----------------------------------------------

      const kotSuccess =
        kotResult.status === "fulfilled";

      // -----------------------------------------------
      // Update agent status
      // -----------------------------------------------

      setAgentStatus({

        bill:
          billSuccess
            ? "Printed"
            : "Offline / Failed",

        kot:
          kotSuccess
            ? "Printed"
            : "Offline / Failed"

      });

      // -----------------------------------------------
      // Both successful
      // -----------------------------------------------

      if (
        billSuccess &&
        kotSuccess
      ) {

        setStatus(
          "BILL + KOT printed successfully ✅"
        );

        return;
      }

      // -----------------------------------------------
      // BILL success, KOT failed
      // -----------------------------------------------

      if (
        billSuccess &&
        !kotSuccess
      ) {

        setStatus(
          "BILL printed ✅ but KOT failed ❌"
        );

        return;
      }

      // -----------------------------------------------
      // KOT success, BILL failed
      // -----------------------------------------------

      if (
        !billSuccess &&
        kotSuccess
      ) {

        setStatus(
          "KOT printed ✅ but BILL failed ❌"
        );

        return;
      }

      // -----------------------------------------------
      // Both failed
      // -----------------------------------------------

      setStatus(
        "BILL and KOT printing failed ❌"
      );

    } catch (error) {

      console.error(
        "Print error:",
        error
      );

      setStatus(
        error.message ||
        "Print failed ❌"
      );

    } finally {

      setPrinting(false);

    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
      }}
    >

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >

        <h1
          style={{
            marginTop: 0
          }}
        >
          FoodFlow Print Test
        </h1>

        <p
          style={{
            color: "#666"
          }}
        >
          BILL and KOT printer testing
        </p>

        {/* ==========================================
            AGENTS
        =========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "15px",
            marginTop: "25px"
          }}
        >

          {/* BILL */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px"
            }}
          >

            <h3>
              BILL
            </h3>

            <p>
              Agent:{" "}
              <strong>
                {BILL_AGENT}
              </strong>
            </p>

            <p>
              Printer: Bill Printer
            </p>

            <strong>
              Status:{" "}
              {agentStatus.bill}
            </strong>

          </div>

          {/* KOT */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px"
            }}
          >

            <h3>
              KOT
            </h3>

            <p>
              Agent:{" "}
              <strong>
                {KOT_AGENT}
              </strong>
            </p>

            <p>
              Printer: Kitchen Printer
            </p>

            <strong>
              Status:{" "}
              {agentStatus.kot}
            </strong>

          </div>

        </div>

        {/* ==========================================
            BUTTONS
        =========================================== */}

        <div
          style={{
            marginTop: "30px"
          }}
        >

          <button
            onClick={testBackend}
            disabled={printing}
            style={{
              padding:
                "12px 20px",
              marginRight: "10px",
              cursor:
                printing
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            Test Backend
          </button>

          <button
            onClick={printOrder}
            disabled={printing}
            style={{
              padding:
                "12px 30px",
              cursor:
                printing
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold"
            }}
          >
            {printing
              ? "PRINTING..."
              : "PRINT BILL + KOT"}
          </button>

        </div>

        {/* ==========================================
            STATUS
        =========================================== */}

        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            background: "#f1f3f5",
            borderRadius: "8px"
          }}
        >

          <strong>
            Status:
          </strong>

          <div
            style={{
              marginTop: "5px"
            }}
          >
            {status ||
              "Ready to print"}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
