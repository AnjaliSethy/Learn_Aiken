import { MeshWallet } from '@meshsdk/core';
import fs from 'node:fs';

const secret_key = MeshWallet.brew(true) as string;
console.log("Generated Secret Key:", secret_key); // Debugging line

if (!secret_key) {
    throw new Error("Failed to generate a secret key.");
}

fs.writeFileSync('me.sk', secret_key);

const wallet = new MeshWallet({
    networkId: 0,
    key: {
        type: 'root',
        bech32: secret_key,
    },
});

// Use an async function to handle the promise
async function generateAddress() {
    // Get unused addresses
    const unusedAddresses = await wallet.getUnusedAddresses();
    if (unusedAddresses.length === 0) {
        throw new Error("No unused addresses available.");
    }

    // Write the first unused address to a file
    fs.writeFileSync('me.addr', unusedAddresses[0]);
    console.log("Generated Address:", unusedAddresses[0]); // Debugging line
}

// Call the async function
generateAddress().catch(error => {
    console.error("Error generating address:", error);
});