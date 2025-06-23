import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { createClient } from "polkadot-api";
import { getPolkadotSigner } from "polkadot-api/signer";
import { getSmProvider } from "polkadot-api/sm-provider";
import { start } from "polkadot-api/smoldot";
import { chainSpec } from "polkadot-api/chains/westend2";
import { MultiAddress, wnd } from "@polkadot-api/descriptors";

// ALICE SIGNER
const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE));
const derive = sr25519CreateDerive(miniSecret);
const aliceKeyPair = derive("//Alice");
const alice = getPolkadotSigner(
  aliceKeyPair.publicKey,
  "Sr25519",
  aliceKeyPair.sign
);

// smoldot client
const smoldot = start();
const client = createClient(getSmProvider(smoldot.addChain({ chainSpec })));

// get typed api
const typedApi = client.getTypedApi(wnd);

// create the transaction sending Bob some assets
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const transfer = typedApi.tx.Balances.transfer_allow_death({
  dest: MultiAddress.Id(BOB),
  value: 100000000000n,
});

transfer.signSubmitAndWatch(alice).subscribe({
  next: (event) => {
    console.log("Tx event: ", event.type);
    if (event.type === "txBestBlocksState") {
      console.log("The tx is now in a best block, check it out:");
      console.log(`https://westend.subscan.io/extrinsic/${event.txHash}`);
    }
  },
  error: console.error,
  complete() {
    client.destroy();
    smoldot.terminate();
  },
});
