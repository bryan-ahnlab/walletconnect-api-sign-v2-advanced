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
      <h1>Wallet Connect v2.0 Sign SDK Sample Test</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <button
          style={{
            width: "100%",
            minHeight: "3rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            wordBreak: "break-all",
          }}
          onClick={() => handleConnect()}
          disabled={!curSignClient}
        >
          Connect
        </button>
        <button
          style={{
            width: "100%",
            minHeight: "3rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            wordBreak: "break-all",
          }}
          onClick={() => handleDisconnect()}
          disabled={!curSignClient}
        >
          Disconnect
        </button>
        <button
          style={{
            width: "100%",
            minHeight: "3rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            wordBreak: "break-all",
          }}
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
