import cbor from "cbor";
import fs from "fs";
import {
    resolvePaymentKeyHash,
    resolvePlutusScriptAddress,
    Transaction,
} from "@meshsdk/core";
import { wallet } from "./common";

// Async function to execute the unlocking transaction
async function main() {
    try {
        // Load Plutus script blueprint
        const blueprint = JSON.parse(fs.readFileSync("./plutus.json", "utf8"));

        const script: {
            code: string;
            version: "V3"; // Correctly typed as a literal
        } = {
            code: cbor
                .encode(Buffer.from(blueprint.validators[0].compiledCode, "hex"))
                .toString("hex"),
            version: "V3", // Ensure this matches the expected type
        };

        // Create the Datum (Contains the owner's address)
        const ownerAddress = (await wallet.getUsedAddresses())[0];
        if (!ownerAddress) {
            throw new Error("No addresses available in the wallet.");
        }

        const owner = resolvePaymentKeyHash(ownerAddress);
        const datum = {
            value: {
                alternative: 0,
                fields: [owner],
            },
        };

        // Define the Redeemer with the message "Hello, World!"
        const redeemer = {
            msg: Buffer.from("Hello, World!").toString("hex"),
        };

        // Build the transaction that interacts with the contract to unlock the funds
        const unsignedTx = await new Transaction({ initiator: wallet })
            .sendLovelace(
                {
                    address: resolvePlutusScriptAddress(script, 0), // Same contract address
                    datum,
                },
                "1000000" // Send back 1 tADA (adjust as needed)
            )
            .build();

        // Sign the transaction
        const signedTx = await wallet.signTx(unsignedTx);

        // Submit the transaction to the blockchain
        const txHash = await wallet.submitTx(signedTx);

        console.log(`1 tADA unlocked with transaction:
            Tx ID: ${txHash}
            Redeemer: ${JSON.stringify(redeemer)}
            Datum: ${JSON.stringify(datum)}
        `);
    } catch (error) {
        console.error("Error unlocking funds:", error);
    }
}

// Execute the script
main();