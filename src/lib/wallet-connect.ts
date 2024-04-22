import { SignClient } from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";
import { Web3Modal } from "@web3modal/standalone";
import { ErrorResponse } from "@walletconnect/jsonrpc-types";

let signClient: InstanceType<typeof SignClient> | null = null;
let session: SessionTypes.Struct | null = null;
let account: string | null = null;
let web3Modal: InstanceType<typeof Web3Modal> | null = null;

web3Modal = new Web3Modal({
  walletConnectVersion: 2,
  projectId: process.env.REACT_APP_PROJECT_ID || "", // Add Project ID
  standaloneChains: [process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || ""], // Add Chain ID
  explorerRecommendedWalletIds: [process.env.REACT_APP_WALLET_ID || ""], // Add ABC Wallet ID
});

export const getClient = async () => {
  if (signClient) {
    return signClient;
  }
  try {
    signClient = await SignClient.init({
      projectId: process.env.REACT_APP_PROJECT_ID || "",
    });
    await subscribeToEvents(signClient);
    return signClient;
  } catch (error) {
    console.error(`getClient: ${JSON.stringify(error)}`);
    return signClient;
  }
};

export const handleConnect = async () => {
  try {
    const signClient = await getClient();

    if (signClient) {
      const proposalNamespace = {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
          ],
          chains: [process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || ""],
          events: ["connect", "disconnect"],
        },
      };

      const { uri, approval } = await signClient.connect({
        requiredNamespaces: proposalNamespace,
      });

      if (uri && web3Modal) {
        web3Modal.openModal({ uri });

        const sessionNamespace = await approval();
        onSessionConnected(sessionNamespace);
        web3Modal.closeModal();
      }
    }
  } catch (error) {
    console.error(`handleConnect: ${JSON.stringify(error)}`);
  }
};

export const onSessionConnected = (sessionNamespace: SessionTypes.Struct) => {
  try {
    console.info(`session: ${sessionNamespace}`);
    console.info(`account: ${sessionNamespace.namespaces.eip155.accounts[0]}`);
    session = sessionNamespace;
    account = sessionNamespace.namespaces.eip155.accounts[0];
  } catch (error) {
    console.error(`onSessionConnected: ${JSON.stringify(error)}`);
    return { session: null, account: null };
  }
};

export const handleDisconnect = async () => {
  try {
    if (signClient && session) {
      await signClient.disconnect({
        topic: session.topic,
        reason: { code: 600, message: "Disconnected" } as ErrorResponse,
      });
      reset();
      console.info(`handleDisconnect: Disconnected`);
    }
  } catch (error) {
    console.error(`handleDisconnect: ${JSON.stringify(error)}`);
  }
};

export const reset = () => {
  session = null;
  account = null;
  window.indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
};

const subscribeToEvents = async (
  signClient: InstanceType<typeof SignClient> | null
) => {
  if (!signClient)
    throw Error("Unable to subscribe to events. Client does not exist.");
  try {
    signClient.on("session_delete", () => {
      console.info("The user has disconnected the session from their wallet.");
      reset();
    });
  } catch (error) {
    console.error(`subscribeToEvents: ${JSON.stringify(error)}`);
  }
};

/* Sample transaction */
const tx = {
  from: account,
  to: "0xBDE1EAE59cE082505bB73fedBa56252b1b9C60Ce",
  data: "0x",
  /* gasPrice: "0x029104e28c",
  gasLimit: "0x5208", */
  value: "0x00",
};

export const handleRequestTransaction = async () => {
  try {
    if (signClient && session) {
      const response = await signClient.request({
        topic: session.topic,
        chainId: process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || "",
        request: {
          method: "eth_sendTransaction",
          params: [tx],
        },
      });
      console.info(`requestTransaction: ${response}`);
    }
  } catch (error) {
    console.error(`requestTransaction: ${JSON.stringify(error)}`);
  }
};
