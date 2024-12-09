use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/string
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
}

pub type Redeemer {
  msg: ByteArray,
}

// Validator declaration
validator hello_world {
  // The spend function
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    // Debug trace to log the redeemer message
    trace @"redeemer": string.from_bytearray(redeemer.msg)

    // Ensure the datum exists and destructure it
    expect Some(Datum { owner }) = datum

    // Check if the redeemer message says "Hello, World!"
    let must_say_hello = redeemer.msg == "Hello, World!"

    // Check if the owner's signature is in the extra_signatories
    let must_be_signed = list.has(self.extra_signatories, owner)

    // Both conditions must be true for the script to succeed
    must_say_hello? && must_be_signed?
  }

  else(_) {
    // Fail the validation if conditions aren't met
    fail
  }
}

// ... rest of the code is unchanged
 
test hello_world_example() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
 
  let redeemer = Redeemer { msg: "Hello, World!" }
 
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
 
  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}