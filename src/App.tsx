import React from "react";

import { useState, useEffect } from "react";
import { WalletConnect } from "./lib/wallet-connect";

function App() {
  const [curWalletConnect, setCurWalletConnect] =
    useState<WalletConnect | null>(null);

  useEffect(() => {
    const walletConnect = new WalletConnect();
    setCurWalletConnect(walletConnect);

    return () => {
      walletConnect.handleDisconnect();
    };
  }, []);

  return (
    <div className="App" style={{ textAlign: "center", padding: "0 2rem" }}>
      <h1>Wallet Connect v2.0 Sign SDK Sample</h1>
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
          onClick={() => curWalletConnect?.handleConnect()}
          disabled={!curWalletConnect}
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
          onClick={() => curWalletConnect?.handleDisconnect()}
          disabled={!curWalletConnect}
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
          onClick={() => curWalletConnect?.handleAptosSignMessage()}
          disabled={!curWalletConnect}
        >
          Aptos Sign Message
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
          onClick={() => curWalletConnect?.handleAptosSignTransaction()}
          disabled={!curWalletConnect}
        >
          Aptos Sign Transaction
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
          onClick={() =>
            curWalletConnect?.handleAptosSignAndSubmitTransaction()
          }
          disabled={!curWalletConnect}
        >
          Aptos Sign and Submit Transaction
        </button>
      </div>
    </div>
  );
}

export default App;
