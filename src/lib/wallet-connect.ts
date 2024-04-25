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
      standaloneChains: [
        `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
          "",
      ], // Add Chain ID
      explorerRecommendedWalletIds: [process.env.REACT_APP_WALLET_ID || ""], // Add ABC Wallet ID
      explorerExcludedWalletIds: "ALL",
    });
  }

  public async getClient() {
    if (this.signClient) {
      console.info("getClient: Client already exists.");
      return this.signClient;
    }
    try {
      console.info("getClient: Initializing client");
      this.signClient = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID || "",
      });
      return this.signClient;
    } catch (error) {
      console.error(`getClient: ${JSON.stringify(error)}`);
    }
  }

  public async handleConnect() {
    try {
      console.info("handleConnect: Handling connection.");
      const signClient = await this.getClient();

      if (signClient) {
        console.info("handleConnect: Connecting to the client.");
        const proposalNamespace = {
          [process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL || ""]: {
            methods: [
              "personal_sign",
              "eth_signTransaction",
              "eth_signTypedData",
              "eth_sendTransaction",
            ],
            chains: [
              `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
                "",
            ],
            events: ["chainChanged", "accountsChanged"],
          },
        };

        const { uri, approval } = await signClient.connect({
          requiredNamespaces: proposalNamespace,
        });

        if (uri && this.web3Modal) {
          console.info("handleConnect: Opening modal.");
          this.web3Modal.openModal({ uri });

          console.info("handleConnect: Waiting for approval.");
          const sessionNamespace = await approval();

          console.info("handleConnect: Session approved.");
          this.onSessionConnected(sessionNamespace);

          console.info("handleConnect: Closing modal.");
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
      console.info(
        `onSessionConnected: Session - ${JSON.stringify(sessionNamespace)}`
      );
      console.info(
        `onSessionConnected: Account - ${
          sessionNamespace.namespaces[
            process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL || ""
          ].accounts[0]
        }`
      );
      this.session = sessionNamespace;
      this.account = sessionNamespace.namespaces[
        process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL || ""
      ].accounts[0]
        .split(":")
        .slice(2)
        .join(":");
    } catch (error) {
      console.error(`onSessionConnected: ${JSON.stringify(error)}`);
      this.reset();
    }
  }

  public async handleDisconnect() {
    try {
      if (this.signClient && this.session && this.account) {
        console.info("handleDisconnect: Disconnecting the client.");
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
    console.info("reset: Reset.");
    this.signClient = null;
    this.session = null;
    this.account = null;
    window.indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
  }

  public async handlePersonalSign() {
    try {
      /* Sample transaction */
      const tx = {
        message: "Hello World!",
        address: this.account,
      };
      if (this.signClient && this.session && this.account) {
        const response = await this.signClient.request({
          topic: this.session.topic,
          chainId:
            `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
            "",
          request: {
            method: "personal_sign",
            params: [tx.message, tx.address],
          },
        });
        console.info(`handlePersonalSign: ${response}`);
        // alert("Personal Sign");
      }
    } catch (error) {
      console.error(`handlePersonalSign: ${JSON.stringify(error)}`);
    }
  }

  public async handleEthSignTransaction() {
    try {
      /* Sample transaction */
      const tx = {
        from: this.account,
        to: process.env.REACT_APP_TRANSACTION_TEST_ACCOUNT || "",
        data: "0x",
        /* gas: "0x76c0", */
        /* gasPrice: "0x9184e72a000", */
        value: "0x00",
        /* nonce: 0x117 */
      };
      if (this.signClient && this.session && this.account) {
        const response = await this.signClient.request({
          topic: this.session.topic,
          chainId:
            `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
            "",
          request: {
            method: "eth_signTransaction",
            params: [tx],
          },
        });
        console.info(`handleEthSignTransaction: ${response}`);
        // alert("ETH Sign Transaction");
      }
    } catch (error) {
      console.error(`handleEthSignTransaction: ${JSON.stringify(error)}`);
    }
  }

  public async handleEthSignTypedData() {
    try {
      /* Sample transaction */
      const tx = {
        address: this.account,
        message: {
          types: {
            EIP712Domain: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "version",
                type: "string",
              },
              {
                name: "chainId",
                type: "uint256",
              },
              {
                name: "verifyingContract",
                type: "address",
              },
            ],
            Person: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "wallet",
                type: "address",
              },
            ],
            Mail: [
              {
                name: "from",
                type: "Person",
              },
              {
                name: "to",
                type: "Person",
              },
              {
                name: "contents",
                type: "string",
              },
            ],
          },
          primaryType: "Mail",
          domain: {
            name: "Ether Mail",
            version: "1",
            chainId: process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID || 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          },
          message: {
            from: {
              name: "Cow",
              wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            },
            to: {
              name: "Bob",
              wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            },
            contents: "Hello, Bob!",
          },
        },
      };
      if (this.signClient && this.session && this.account) {
        const response = await this.signClient.request({
          topic: this.session.topic,
          chainId:
            `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
            "",
          request: {
            method: "eth_signTypedData",
            params: [tx.address, tx.message],
          },
        });
        console.info(`handleEthSignTypedData: ${response}`);
        // alert("ETH Sign Typed Data");
      }
    } catch (error) {
      console.error(`handleEthSignTypedData: ${JSON.stringify(error)}`);
    }
  }

  public async handleEthSendTransaction() {
    try {
      /* Sample transaction */
      const tx = {
        from: this.account,
        to: process.env.REACT_APP_TRANSACTION_TEST_ACCOUNT || "",
        data: "0x",
        gasLimit: "0x5208",
        value: "0x00",
      };
      if (this.signClient && this.session && this.account) {
        const response = await this.signClient.request({
          topic: this.session.topic,
          chainId:
            `${process.env.REACT_APP_ETHEREUM_IMPROVEMENT_PROPOSAL}:${process.env.REACT_APP_KLAYTN_BAOBAB_CHAIN_ID}` ||
            "",
          request: {
            method: "eth_sendTransaction",
            params: [tx],
          },
        });
        console.info(`requestTransaction: ${response}`);
        // alert("ETH Send Transaction");
      }
    } catch (error) {
      console.error(`handleEthSendTransaction: ${JSON.stringify(error)}`);
    }
  }
}
