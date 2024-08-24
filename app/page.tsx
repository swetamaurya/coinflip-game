"use client";
import { useState, useEffect } from 'react';
import Web3 from 'web3';

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_guess",
        "type": "bool"
      }
    ],
    "name": "flipCoin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

export default function CoinFlipGame() {
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [userAccount, setUserAccount] = useState<string | null>(null);
  const [coinFlipContract, setCoinFlipContract] = useState<any>(null);
  const [betAmountEth, setBetAmountEth] = useState<string>('');
  const [userGuess, setUserGuess] = useState<boolean>(true);
  const [gameResult, setGameResult] = useState<string>('');

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      setWeb3Instance(web3);
      const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
      setCoinFlipContract(contractInstance);
    } else {
      alert('Please install MetaMask');
    }
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setUserAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleFlipCoin = async () => {
    if (!web3Instance || !coinFlipContract) {
      setGameResult('Web3 or contract not initialized');
      return;
    }
    if (userAccount) {
      try {
        const betInWei = web3Instance.utils.toWei(betAmountEth, 'ether');
        const flipResult = await coinFlipContract.methods.flipCoin(userGuess).send({ from: userAccount, value: betInWei });
        setGameResult(flipResult ? 'You won!' : 'You lost!');
      } catch (error: any) {
        console.error('Error flipping the coin:', error);
        setGameResult(`Error occurred: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div>
      <h1>Coin Flip Game</h1>
      {userAccount ? (
        <div>
          <p>Connected as: {userAccount}</p>
          <input
            type="number"
            placeholder="Bet amount (ETH)"
            value={betAmountEth}
            onChange={(e) => setBetAmountEth(e.target.value)}
          />
          <br />
          <label>
            <input
              type="radio"
              value="true"
              checked={userGuess === true}
              onChange={() => setUserGuess(true)}
            />
            Heads
          </label>
          <label>
            <input
              type="radio"
              value="false"
              checked={userGuess === false}
              onChange={() => setUserGuess(false)}
            />
            Tails
          </label>
          <br />
          <button onClick={handleFlipCoin}>Flip Coin</button>
          <p>{gameResult}</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
