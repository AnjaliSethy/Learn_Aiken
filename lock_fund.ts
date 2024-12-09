import { Asset, deserializeAddress, mConStr0 } from "@meshsdk/core";
import { getScript, getTxBuilder, wallet } from "./common";

async function main() {
  // these are the assets we want to lock into the contract
  const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: "1000000", // 1 ADA in lovelace
    },
  ];

  // get utxo and wallet address
  const utxos = await wallet.getUtxos();
  const walletAddress = (await wallet.getUsedAddresses())[0];

  const { scriptAddr } = getScript();

  // Log the script address where the funds will be locked
  console.log(`Funds will be locked at script address: ${scriptAddr}`);

  // hash of the public key of the wallet, to be used in the datum
  const signerHash = deserializeAddress(walletAddress).pubKeyHash;

  // build transaction with MeshTxBuilder
  const txBuilder = getTxBuilder();
  await txBuilder
    .txOut(scriptAddr, assets) // send assets to the script address
    .txOutDatumHashValue(mConStr0([signerHash])) // provide the datum where `"constructor": 0`
    .changeAddress(walletAddress) // send change back to the wallet address
    .selectUtxosFrom(utxos)
    .complete();
  
  const unsignedTx = txBuilder.txHex;

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  
  console.log(`1 ADA locked into the contract at Tx ID: ${txHash}`);
}

main().catch((error) => {
  console.error("Error locking funds:", error);
});