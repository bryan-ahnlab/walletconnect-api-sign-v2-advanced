import React from "react";
import "./App.css";

import { useState, useEffect } from "react";
import {
  getClient,
  handleConnect,
  handleDisconnect,
  handleRequestTransaction,
} from "./lib/wallet-connect";
import { SignClient } from "@walletconnect/sign-client";

function App() {
  const [curSignClient, setCurSignClient] = useState<InstanceType<
    typeof SignClient
  > | null>(null);

  useEffect(() => {
    if (!curSignClient) {
      const initializeClient = async () => {
        const signClient = await getClient();
        if (signClient) {
          setCurSignClient(signClient);
        }
      };
      initializeClient();
    }
    console.log("curSignClient: ", curSignClient);
  }, [curSignClient]);

  return (
    <div className="App">
      <h1>Sign v2 Standalone</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <button
          style={{ width: "80%", height: "3rem" }}
          onClick={() => handleConnect()}
          disabled={!curSignClient}
        >
          Connect
        </button>
        <button
          style={{ width: "80%", height: "3rem" }}
          onClick={() => handleDisconnect()}
          disabled={!curSignClient}
        >
          Disconnect
        </button>
        <button
          style={{ width: "80%", height: "3rem" }}
          onClick={() => handleRequestTransaction()}
          disabled={!curSignClient}
        >
          Request Transaction
        </button>
      </div>
    </div>
  );
}

export default App;
