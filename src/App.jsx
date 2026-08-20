import { useEffect, useState } from "react";
import qz from "qz-tray";

const BILL_PRINTER = "Soda PDF Desktop 14";
const KOT_PRINTER = "OneNote for Windows 10";

// ======================================================
// BILL DATA
// ======================================================

function createBill() {
    return [
        "\x1B\x40",

        // Center
        "\x1B\x61\x01",

        "FOODFLOW POS\n",
        "BILL\n",

        // Left
        "\x1B\x61\x00",

        "================================\n",
        "Invoice : INV-0001\n",
        "Date    : 2026-08-20\n",
        "Cashier : admin\n",
        "================================\n",

        "Item              Qty     Price\n",
        "--------------------------------\n",

        "Fried Rice          2   1400.00\n",
        "Coke                2    400.00\n",

        "--------------------------------\n",

        "Subtotal              1800.00\n",
        "Tax                    180.00\n",

        "================================\n",

        "TOTAL                 1980.00\n",

        "================================\n",

        "\x1B\x61\x01",

        "\nTHANK YOU!\n",

        "\n\n\n",

        // Cut
        "\x1D\x56\x00"
    ].join("");
}

// ======================================================
// KOT DATA
// ======================================================

function createKOT() {
    return [
        "\x1B\x40",

        "\x1B\x61\x01",

        "FOODFLOW\n",
        "KITCHEN ORDER\n",

        "\x1B\x61\x00",

        "================================\n",

        "ORDER : INV-0001\n",
        "DATE  : 2026-08-20\n",
        "TIME  : 20:30\n",

        "================================\n",

        "ITEM                    QTY\n",
        "--------------------------------\n",

        "Fried Rice                2\n",
        "Coke                      2\n",

        "--------------------------------\n",

        "\x1B\x61\x01",

        "       KITCHEN\n",
        "        ORDER\n",

        "\n\n\n",

        "\x1D\x56\x00"
    ].join("");
}

// ======================================================
// QZ CONNECTION
// ======================================================

async function connectQZ() {
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }
}

// ======================================================
// GET PRINTERS
// ======================================================

async function findPrinters() {
    await connectQZ();

    const printers =
        await qz.printers.find();

    return printers;
}

// ======================================================
// PRINT RAW ESC/POS
// ======================================================

async function printRaw(
    printerName,
    data
) {
    await connectQZ();

    const config =
        qz.configs.create(
            printerName
        );

    await qz.print(
        config,
        [
            {
                type: "raw",
                format: "plain",
                data: data
            }
        ]
    );
}

// ======================================================
// APP
// ======================================================

function App() {

    const [connected, setConnected] =
        useState(false);

    const [printers, setPrinters] =
        useState([]);

    const [status, setStatus] =
        useState("Ready");

    const [printing, setPrinting] =
        useState(false);

    // ==================================================
    // CONNECT WHEN APP LOADS
    // ==================================================

    useEffect(() => {

        connectQZ()
            .then(() => {

                setConnected(true);

                setStatus(
                    "QZ Tray connected ✅"
                );

            })
            .catch((error) => {

                console.error(error);

                setConnected(false);

                setStatus(
                    "QZ Tray not connected ❌"
                );

            });

    }, []);

    // ==================================================
    // CONNECT BUTTON
    // ==================================================

    const handleConnect =
        async () => {

            try {

                setStatus(
                    "Connecting to QZ Tray..."
                );

                await connectQZ();

                setConnected(true);

                setStatus(
                    "QZ Tray connected ✅"
                );

            } catch (error) {

                console.error(error);

                setConnected(false);

                setStatus(
                    `QZ connection failed: ${error.message}`
                );

            }

        };

    // ==================================================
    // FIND PRINTERS
    // ==================================================

    const handleFindPrinters =
        async () => {

            try {

                setStatus(
                    "Finding printers..."
                );

                const list =
                    await findPrinters();

                console.log(
                    "QZ Printers:",
                    list
                );

                setPrinters(list);

                setStatus(
                    `${list.length} printer(s) found`
                );

            } catch (error) {

                console.error(error);

                setStatus(
                    `Printer detection failed: ${error.message}`
                );

            }

        };

    // ==================================================
    // TEST BILL
    // ==================================================

    const handleBill =
        async () => {

            try {

                setPrinting(true);

                setStatus(
                    "Printing BILL..."
                );

                const bill =
                    createBill();

                await printRaw(
                    BILL_PRINTER,
                    bill
                );

                setStatus(
                    "BILL printed successfully ✅"
                );

            } catch (error) {

                console.error(
                    "BILL error:",
                    error
                );

                setStatus(
                    `BILL failed ❌ ${error.message}`
                );

            } finally {

                setPrinting(false);

            }

        };

    // ==================================================
    // TEST KOT
    // ==================================================

    const handleKOT =
        async () => {

            try {

                setPrinting(true);

                setStatus(
                    "Printing KOT..."
                );

                const kot =
                    createKOT();

                await printRaw(
                    KOT_PRINTER,
                    kot
                );

                setStatus(
                    "KOT printed successfully ✅"
                );

            } catch (error) {

                console.error(
                    "KOT error:",
                    error
                );

                setStatus(
                    `KOT failed ❌ ${error.message}`
                );

            } finally {

                setPrinting(false);

            }

        };

    // ==================================================
    // PRINT BOTH
    // ==================================================

    const handlePrintBoth =
        async () => {

            if (printing) {
                return;
            }

            try {

                setPrinting(true);

                setStatus(
                    "Printing BILL + KOT..."
                );

                const bill =
                    createBill();

                const kot =
                    createKOT();

                const results =
                    await Promise.allSettled([

                        printRaw(
                            BILL_PRINTER,
                            bill
                        ),

                        printRaw(
                            KOT_PRINTER,
                            kot
                        )

                    ]);

                const billResult =
                    results[0];

                const kotResult =
                    results[1];

                const billSuccess =
                    billResult.status ===
                    "fulfilled";

                const kotSuccess =
                    kotResult.status ===
                    "fulfilled";

                if (
                    billSuccess &&
                    kotSuccess
                ) {

                    setStatus(
                        "BILL + KOT printed successfully ✅"
                    );

                } else if (
                    billSuccess &&
                    !kotSuccess
                ) {

                    console.error(
                        "KOT:",
                        kotResult.reason
                    );

                    setStatus(
                        "BILL printed ✅ | KOT failed ❌"
                    );

                } else if (
                    !billSuccess &&
                    kotSuccess
                ) {

                    console.error(
                        "BILL:",
                        billResult.reason
                    );

                    setStatus(
                        "BILL failed ❌ | KOT printed ✅"
                    );

                } else {

                    console.error(
                        "BILL:",
                        billResult.reason
                    );

                    console.error(
                        "KOT:",
                        kotResult.reason
                    );

                    setStatus(
                        "BILL + KOT failed ❌"
                    );

                }

            } catch (error) {

                console.error(error);

                setStatus(
                    `Print error: ${error.message}`
                );

            } finally {

                setPrinting(false);

            }

        };

    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f4f6f8",
                padding: "40px",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >

            <div
                style={{
                    maxWidth: "850px",
                    margin: "auto",
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "14px",
                    boxShadow:
                        "0 5px 25px rgba(0,0,0,0.08)"
                }}
            >

                <h1>
                    FoodFlow Print Test
                </h1>

                <p>
                    React + QZ Tray + Network Printers
                </p>

                {/* =====================================
                    CONNECTION
                ====================================== */}

                <div
                    style={{
                        padding: "15px",
                        background:
                            connected
                                ? "#e8f7ee"
                                : "#fff0f0",
                        borderRadius: "8px",
                        marginTop: "20px"
                    }}
                >

                    <strong>
                        QZ Tray:
                    </strong>

                    {" "}

                    {connected
                        ? "Connected ✅"
                        : "Disconnected ❌"}

                </div>

                <div
                    style={{
                        marginTop: "20px"
                    }}
                >

                    <button
                        onClick={
                            handleConnect
                        }
                        disabled={
                            printing
                        }
                        style={{
                            padding:
                                "12px 20px",
                            marginRight:
                                "10px"
                        }}
                    >
                        Connect QZ
                    </button>

                    <button
                        onClick={
                            handleFindPrinters
                        }
                        disabled={
                            printing
                        }
                        style={{
                            padding:
                                "12px 20px"
                        }}
                    >
                        Find Printers
                    </button>

                </div>

                {/* =====================================
                    PRINTER LIST
                ====================================== */}

                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        background:
                            "#f5f5f5",
                        borderRadius: "8px"
                    }}
                >

                    <h3>
                        Detected Printers
                    </h3>

                    {printers.length === 0 ? (

                        <p>
                            Click "Find Printers"
                        </p>

                    ) : (

                        <ul>

                            {printers.map(
                                (printer) => (

                                    <li
                                        key={
                                            printer
                                        }
                                    >
                                        {printer}
                                    </li>

                                )
                            )}

                        </ul>

                    )}

                </div>

                {/* =====================================
                    PRINTER CONFIG
                ====================================== */}

                <div
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "20px",
                        marginTop: "25px"
                    }}
                >

                    {/* BILL */}

                    <div
                        style={{
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "10px",
                            padding:
                                "20px"
                        }}
                    >

                        <h2>
                            BILL
                        </h2>

                        <p>
                            Printer
                        </p>

                        <strong>
                            {BILL_PRINTER}
                        </strong>

                        <br />
                        <br />

                        <button
                            onClick={
                                handleBill
                            }
                            disabled={
                                printing
                            }
                            style={{
                                padding:
                                    "12px 20px"
                            }}
                        >
                            TEST BILL
                        </button>

                    </div>

                    {/* KOT */}

                    <div
                        style={{
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "10px",
                            padding:
                                "20px"
                        }}
                    >

                        <h2>
                            KOT
                        </h2>

                        <p>
                            Printer
                        </p>

                        <strong>
                            {KOT_PRINTER}
                        </strong>

                        <br />
                        <br />

                        <button
                            onClick={
                                handleKOT
                            }
                            disabled={
                                printing
                            }
                            style={{
                                padding:
                                    "12px 20px"
                            }}
                        >
                            TEST KOT
                        </button>

                    </div>

                </div>

                {/* =====================================
                    PRINT BOTH
                ====================================== */}

                <button
                    onClick={
                        handlePrintBoth
                    }
                    disabled={
                        printing ||
                        !connected
                    }
                    style={{
                        width: "100%",
                        marginTop: "25px",
                        padding: "18px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor:
                            printing
                                ? "not-allowed"
                                : "pointer"
                    }}
                >

                    {printing
                        ? "PRINTING..."
                        : "PRINT BILL + KOT"}

                </button>

                {/* =====================================
                    STATUS
                ====================================== */}

                <div
                    style={{
                        marginTop: "25px",
                        padding: "15px",
                        background:
                            "#f1f3f5",
                        borderRadius: "8px"
                    }}
                >

                    <strong>
                        Status:
                    </strong>

                    <div
                        style={{
                            marginTop: "6px"
                        }}
                    >
                        {status}
                    </div>

                </div>

            </div>

        </div>

    );
}

export default App;
