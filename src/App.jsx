import React, { useState } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import abi from "./abi.json";

const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const userProvider = new ethers.BrowserProvider(window.ethereum);
      const userSigner = await userProvider.getSigner();
      const userContract = new ethers.Contract(contractAddress, abi, userSigner);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setProvider(userProvider);
      setContract(userContract);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error(`Error connecting wallet: ${error.message}`);
    }
  };

  const getBalance = async () => {
    try {
      if (!contract) {
        toast.error("Contract not initialized.");
        return;
      }

      const contractBalance = await contract.getBalance();
      setBalance(ethers.formatEther(contractBalance));
      toast.info(`Balance: ${ethers.formatEther(contractBalance)} ETH`);
    } catch (error) {
      toast.error(`Error fetching balance: ${error.message}`);
    }
  };

  const deposit = async () => {
    try {
      if (!contract || !amount) {
        toast.error("Please connect wallet and enter an amount.");
        return;
      }

      const tx = await contract.deposit({ value: ethers.parseEther(amount) });
      await tx.wait();
      setAmount("");
      getBalance();
      toast.success(`Successfully deposited ${amount} ETH.`);
    } catch (error) {
      toast.error(`Error during deposit: ${error.message}`);
    }
  };

  const withdraw = async () => {
    try {
      if (!contract || !amount) {
        toast.error("Please connect wallet and enter an amount.");
        return;
      }

      const tx = await contract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      setAmount("");
      getBalance();
      toast.success(`Successfully withdrew ${amount} ETH.`);
    } catch (error) {
      toast.error(`Error during withdrawal: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mini DApp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4">Connected Account: {account}</p>
          <p className="mb-4">Contract Balance: {balance} ETH</p>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-2 py-1 border rounded mr-2"
            />

            <button
              onClick={deposit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
            >
              Deposit
            </button>

            <button
              onClick={withdraw}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Withdraw
            </button>
          </div>

          <button
            onClick={getBalance}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Refresh Balance
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default App;
