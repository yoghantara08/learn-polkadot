import { collectives, dot, people } from "@polkadot-api/descriptors";
import {
  createClient,
  type PolkadotClient,
  type SS58String,
} from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const makeClient = (endpoint: string): PolkadotClient => {
  console.log("Connecting to endpoint: ", endpoint);
  const provider = getWsProvider(endpoint);
  const client: PolkadotClient = createClient(provider);
  return client;
};

const printChainInfo = async (client: PolkadotClient) => {
  const chainSpec = await client.getChainSpecData();
  const finalizeBlock = await client.getFinalizedBlock();
  return { chainSpec, finalizeBlock };
};

const getBalance = async (
  client: PolkadotClient,
  address: SS58String
): Promise<BigInt> => {
  const dotApi = client.getTypedApi(dot);
  const accountInfo = await dotApi.query.System.Account.getValue(address);
  const { free, reserved } = accountInfo.data;
  return free + reserved;
};

const getDisplayName = async (
  client: PolkadotClient,
  address: SS58String
): Promise<string | undefined> => {
  const peopleApi = client.getTypedApi(people);
  const accountInfo = await peopleApi.query.Identity.IdentityOf.getValue(
    address
  );
  const displayName = accountInfo?.info.display.value?.asText();
  return displayName;
};

interface FellowshipMember {
  address: SS58String;
  rank: number;
}

const getFellowshipMembers = async (
  collectivesClient: PolkadotClient
): Promise<FellowshipMember[]> => {
  const collectivesApi = collectivesClient.getTypedApi(collectives);
  const rawMembers =
    await collectivesApi.query.FellowshipCollective.Members.getEntries();
  const data = rawMembers.map((m) => {
    return { address: m.keyArgs[0], rank: m.value };
  });
  return data;
};

// MAIN
const main = async () => {
  const client = makeClient("wss://rpc.polkadot.io");
  const peopleClient = makeClient("wss://polkadot-people-rpc.polkadot.io");
  const collectivesClient = makeClient(
    "wss://polkadot-collectives-rpc.polkadot.io"
  );
  const address = "15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr";

  const members = await getFellowshipMembers(collectivesClient);

  console.log("Generating table...");
  const table = [];
  for (const { address, rank } of members) {
    const balance = await getBalance(client, address);
    const displayName = await getDisplayName(peopleClient, address);
    table.push({ rank, displayName, address, balance });
  }

  table.sort((a, b) => b.rank - a.rank);
  console.table(table);

  const chainInfo = await printChainInfo(client);
  const balance = await getBalance(client, address);
  const displayName = await getDisplayName(peopleClient, address);

  console.log(chainInfo);
  console.log(Number(balance) / 10 ** 10);
  console.log(displayName);

  process.exit(0);
};

main();
