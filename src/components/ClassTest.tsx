import React from "react";

import { useState, useEffect } from "react";
import { WalletConnect } from "./../lib/wallet-connect-class";

function ClassTest() {
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
    <div
      className="ClassTest"
      style={{ textAlign: "center", padding: "0 2rem" }}
    >
      <h1>Wallet Connect v2.0 Sign SDK Class Test</h1>
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
          }}
          onClick={() => curWalletConnect?.handleRequestTransaction()}
          disabled={!curWalletConnect}
        >
          Request Transaction
        </button>
      </div>
    </div>
  );
}

export default ClassTest;
