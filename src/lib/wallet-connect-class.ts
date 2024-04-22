import { SignClient } from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";
import { Web3Modal } from "@web3modal/standalone";
import { ErrorResponse } from "@walletconnect/jsonrpc-types";

export class WalletConnect {
  private signClient: InstanceType<typeof SignClient> | null = null;
  public session: SessionTypes.Struct | null = null;
  public account: string | null = null;
  private web3Modal: InstanceType<typeof Web3Modal>;

  constructor() {
    this.web3Modal = new Web3Modal({
      walletConnectVersion: 2,
      projectId: process.env.REACT_APP_PROJECT_ID || "", // Add Project ID
      standaloneChains: [process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || ""], // Add Chain ID
      explorerRecommendedWalletIds: [process.env.REACT_APP_WALLET_ID || ""], // Add ABC Wallet ID
    });
  }

  public async getClient() {
    if (this.signClient) {
      return this.signClient;
    }
    try {
      this.signClient = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID || "",
      });
      await this.subscribeToEvents();
      return this.signClient;
    } catch (error) {
      console.error(`getClient: ${JSON.stringify(error)}`);
      return this.signClient;
    }
  }

  private async subscribeToEvents() {
    if (!this.signClient)
      throw Error("Unable to subscribe to events. Client does not exist.");
    try {
      this.signClient.on("session_delete", () => {
        console.info(
          "The user has disconnected the session from their wallet."
        );
        this.reset();
      });
    } catch (error) {
      console.error(`subscribeToEvents: ${JSON.stringify(error)}`);
    }
  }

  public async handleConnect() {
    try {
      const signClient = await this.getClient();

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

        if (uri && this.web3Modal) {
          this.web3Modal.openModal({ uri });

          const sessionNamespace = await approval();
          this.onSessionConnected(sessionNamespace);
          this.web3Modal.closeModal();
          console.info(`handleConnect: Connected`);
          // alert("Connected");
        }
      }
    } catch (error) {
      console.error(`handleConnect: ${JSON.stringify(error)}`);
      this.reset();
    }
  }

  private onSessionConnected(sessionNamespace: SessionTypes.Struct) {
    try {
      console.info(`session: ${JSON.stringify(sessionNamespace)}`);
      console.info(
        `account: ${sessionNamespace.namespaces.eip155.accounts[0]}`
      );
      this.session = sessionNamespace;
      this.account = sessionNamespace.namespaces.eip155.accounts[0];
    } catch (error) {
      this.session = null;
      this.account = null;
      console.error(`onSessionConnected: ${JSON.stringify(error)}`);
    }
  }

  public async handleDisconnect() {
    try {
      if (this.signClient && this.session && this.account) {
        await this.signClient.disconnect({
          topic: this.session.topic,
          reason: { code: 600, message: "Disconnected" } as ErrorResponse,
        });
        this.reset();
        console.info(`handleDisconnect: Disconnected`);
        // alert("Disconnected");
      }
    } catch (error) {
      console.error(`handleDisconnect: ${JSON.stringify(error)}`);
    }
  }

  public reset() {
    this.session = null;
    this.account = null;
    window.indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
  }

  public async handleRequestTransaction() {
    try {
      /* Sample transaction */
      const tx = {
        from: this.account,
        to: process.env.REACT_APP_TRANSACTION_TEST_ACCOUNT || "",
        data: process.env.REACT_APP_TRANSACTION_TEST_DATA || "",
        gasLimit: process.env.REACT_APP_TRANSACTION_TEST_GAS_LIMIT || "",
        value: process.env.REACT_APP_TRANSACTION_TEST_VALUE || "",
      };
      if (this.signClient && this.session && this.account) {
        const response = await this.signClient.request({
          topic: this.session.topic,
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
      console.error(`handleRequestTransaction: ${JSON.stringify(error)}`);
    }
  }
}
