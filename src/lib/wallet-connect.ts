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
        console.info(`handleConnect: Connected`);
        // alert("Connected");
      }
    }
  } catch (error) {
    console.error(`handleConnect: ${JSON.stringify(error)}`);
    reset();
  }
};

export const onSessionConnected = (sessionNamespace: SessionTypes.Struct) => {
  try {
    console.info(`session: ${JSON.stringify(sessionNamespace)}`);
    console.info(`account: ${sessionNamespace.namespaces.eip155.accounts[0]}`);
    session = sessionNamespace;
    account = sessionNamespace.namespaces.eip155.accounts[0];
  } catch (error) {
    session = null;
    account = null;
    console.error(`onSessionConnected: ${JSON.stringify(error)}`);
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
      // alert("Disconnected");
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

export const handleRequestTransaction = async () => {
  try {
    /* Sample transaction */
    const tx = {
      from: account,
      to: process.env.REACT_APP_TRANSACTION_TEST_ACCOUNT || "",
      data: process.env.REACT_APP_TRANSACTION_TEST_DATA || "",
      gasLimit: process.env.REACT_APP_TRANSACTION_TEST_GAS_LIMIT || "",
      value: process.env.REACT_APP_TRANSACTION_TEST_VALUE || "",
    };
    if (signClient && session && account) {
      const response = await signClient.request({
        topic: session.topic,
        chainId: process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || "",
        request: {
          method: process.env.REACT_APP_TRANSACTION_TEST_METHOD || "",
          params: [tx],
        },
      });
      console.info(`requestTransaction: ${response}`);
      // alert("Request Transaction");
    }
  } catch (error) {
    console.error(`requestTransaction: ${JSON.stringify(error)}`);
  }
};
