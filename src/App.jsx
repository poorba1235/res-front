import { useState } from "react";

const BACKEND =
    "http://localhost:4000";

const AGENT_ID =
    "POS-001";


function createReceipt() {

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
        
        
        
        
`;

    return btoa(receipt);
}


function App() {

    const [status, setStatus] =
        useState("");


    const testBackend = async () => {

        try {

            const response =
                await fetch(
                    `${BACKEND}/api/health`
                );

            const data =
                await response.json();

            setStatus(
                data.success
                    ? "Backend connected ✅"
                    : "Backend error"
            );

        } catch (error) {

            setStatus(
                "Backend offline ❌"
            );

        }

    };


    const print = async () => {

        try {

            setStatus(
                "Sending print job..."
            );


            const printData =
                createReceipt();


            const response =
                await fetch(
                    `${BACKEND}/api/print`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            agentId:
                                AGENT_ID,

                            printData

                        })

                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                setStatus(
                    result.message
                );

                return;
            }


            setStatus(
                "Print job sent ✅"
            );

        } catch (error) {

            console.error(error);

            setStatus(
                "Backend connection failed ❌"
            );

        }

    };


    return (
        <div
            style={{
                padding: 40,
                fontFamily: "Arial"
            }}
        >

            <h1>
                FoodFlow Print Test
            </h1>


            <button
                onClick={testBackend}
            >
                Test Backend
            </button>


            <button
                onClick={print}
                style={{
                    marginLeft: 10
                }}
            >
                PRINT
            </button>


            <p>
                {status}
            </p>

        </div>
    );

}


export default App;