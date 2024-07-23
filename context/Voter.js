import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import {
  VotingAddress,
  VotingAddressABI,
  handleNetworkSwitch,
  CONTRACT_OWNER,
} from "./constants";

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();


export const VotingProvider = ({ children }) => {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");
  const [loader, setLoader] = useState(false);
  const pushCandidate = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState();
  const [votingStartTime, setVotingStartTime] = useState(null);
  const [votingEndTime, setVotingEndTime] = useState(null);

  const [error, setError] = useState("");
  const higestVote = [];

  const pushVoter = [];
  const [voterArray, setVoterArray] = useState();
  const [voterLength, setVoterLength] = useState("");
  const [voterAddress, setVoterAddress] = useState([]);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");
    const network = await handleNetworkSwitch();
    const account = await window.ethereum.request({ method: "eth_accounts" });

    if (account.length) {
      setCurrentAccount(account[0]);
      return account[0];
    } else {
      setError("Please Install MetaMask & Connect, Reload");
    }
  };
  // console.log("Current Account:", currentAccount);
  // console.log("Contract Owner:", CONTRACT_OWNER);
  // if(currentAccount==CONTRACT_OWNER){
  //   console.log("yes");
  // }
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const network = await handleNetworkSwitch();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);
    setError("");
  };

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const address = await checkIfWalletIsConnected();
        if (address) {
          setLoader(true);
          const formData = new FormData();
          formData.append("file", file);

          const response = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
              pinata_api_key: `a4ad2b0b57fc90988328`,
              pinata_secret_api_key: `501b6e52264773d8d223174f662a861b525e2269325731cd7839c3da42698dd3`,
              "Content-Type": "multipart/form-data",
            },
          });
          const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
          setLoader(false);
          return ImgHash;
        } else {
          setLoader(false);
          console.log("Kindly connect to your wallet");
        }
      } catch (error) {
        console.log("Unable to upload image to Pinata");
        setLoader(false);
      }
    }
  };

  const uploadToIPFSCandidate = async (file) => {
    if (file) {
      try {
        setLoader(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `a4ad2b0b57fc90988328`,
            pinata_secret_api_key: `501b6e52264773d8d223174f662a861b525e2269325731cd7839c3da42698dd3`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        setLoader(false);
        return ImgHash;
      } catch (error) {
        setLoader(false);
        console.log("Unable to upload image to Pinata");
      }
    }
  };

  const createVoter = async (formInput, fileUrl) => {
    try {
      const { name, address, position } = formInput;
      const connectAddress = await checkIfWalletIsConnected();
      if (connectAddress !== CONTRACT_OWNER)
        return setError("Only Owner Of Contract Can Create Voter");


      if (!name || !address || !position)
        return setError("Input Data is missing");
      setLoader(true);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ name, address, position, image: fileUrl });

      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `a4ad2b0b57fc90988328`,
          pinata_secret_api_key: `501b6e52264773d8d223174f662a861b525e2269325731cd7839c3da42698dd3`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const voter = await contract.voterRight(address, name, url, fileUrl, {
        gasLimit: ethers.utils.hexlify(8000000),
      });
      await voter.wait();
      setLoader(false);
      window.location.href = "/voterList";
    } catch (error) {
      setLoader(false);
      setError("error: Check your API key and data");
    }
  };

  const getAllVoterData = async () => {
    try {
      const address = await checkIfWalletIsConnected();
      if (address) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        //VOTR LIST
        const voterListData = await contract.getVoterList();
        setVoterAddress(voterListData);

        const items = await Promise.all(
          voterListData.map(async (el) => {
            const singleVoterData = await contract.getVoterData(el);
            // console.log(singleVoterData);
            return {
              voterID: singleVoterData[0]?.toNumber(),
              name: singleVoterData[1],
              image: singleVoterData[4],
              voterVote: singleVoterData[5]?.toNumber(),
              ipfs: singleVoterData[2],
              address: singleVoterData[3],
              votingStatus: singleVoterData[6],
            };
          })
        );
        setVoterArray(items);

        //VOTER LENGHT
        const voterList = await contract.getVoterLength();
        setVoterLength(voterList.toNumber());
      } else {
        setError("Connect to wallet");
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  const giveVote = async (id) => {
    try {
      const connectAddress = await checkIfWalletIsConnected();
      if (connectAddress == CONTRACT_OWNER)
        return setError("Owner Can not give vote");
      setLoader(true);
      const voterAddress = id.address;
      const voterId = id.id;
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const voteredList = await contract.vote(voterAddress, voterId, {
        gasLimit: ethers.utils.hexlify(8000000),
      });

      await voteredList.wait();
      setLoader(false);
      window.location.reload();
    } catch (error) {
      setError("Sorry!, You have already voted, Reload Browser");
      setLoader(false);
    }
  };
console.log(CONTRACT_OWNER);
// console.log(connectAddress);
  const setCandidate = async (candidateForm, fileUrl, router) => {
    const { name, address, age } = candidateForm;
    const connectAddress = await checkIfWalletIsConnected();
    if (connectAddress !== CONTRACT_OWNER)
      return setError("Only Owner Of Contract Can Create Candidate");
    try {
      if (!name || !address || !age) return console.log("Data Missing");
      setLoader(true);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({
        name,
        address,
        image: fileUrl,
        age,
      });

      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `a4ad2b0b57fc90988328`,
          pinata_secret_api_key: `501b6e52264773d8d223174f662a861b525e2269325731cd7839c3da42698dd3`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const candidate = await contract.setCandidate(
        address,
        age,
        name,
        fileUrl,
        url,
        {
          gasLimit: ethers.utils.hexlify(8000000),
        }
      );
      await candidate.wait();
      setLoader(false);
      window.location.href = "/";
    } catch (error) {
      setLoader(false);
      setError("Something went wrong, check your API Key");
    }
  };

  const getNewCandidate = async () => {
    const address = await checkIfWalletIsConnected();
    if (address) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      //
      const allCandidate = await contract.getCandidate();

      const items = await Promise.all(
        allCandidate.map(async (el) => {
          const singleCandidateData = await contract.getCandidateData(el);

          return {
            age: singleCandidateData[0],
            name: singleCandidateData[1],
            candidateID: singleCandidateData[2].toNumber(),
            image: singleCandidateData[3],
            totalVote: singleCandidateData[4].toNumber(),
            ipfs: singleCandidateData[5],
            address: singleCandidateData[6],
          };
        })
      );

      setCandidateArray(items);

      const allCandidateLength = await contract.getCandidateLength();
      setCandidateLength(allCandidateLength.toNumber());
    } else {
      setError("Connect to wallet");
    }
  };


  const setVotingTime = async (startTime, endTime) => {
    try {
      setVotingStartTime(new Date(startTime).getTime());
      setVotingEndTime(new Date(endTime).getTime());
      const contract = await fetchContract(signer);
      const transaction = await contract.setVotingTime(startTime, endTime);
      await transaction.wait();
      console.log("Voting time set successfully");
    } catch (error) {
      console.error("Error setting voting time:", error);
    }
  };
  
  const isVotingOpen = async () => {
    try {
      const contract = await fetchContract(provider);
      const votingStatus = await contract.isVotingOpen();
      return votingStatus;
    } catch (error) {
      console.error("Error checking voting status:", error);
      return false;
    }
  };

  return (
    <VotingContext.Provider
      value={{
        currentAccount,
        connectWallet,
        uploadToIPFS,
        createVoter,
        setCandidate,
        getNewCandidate,
        giveVote,
        pushCandidate,
        candidateArray,
        uploadToIPFSCandidate,
        getAllVoterData,
        voterArray,
        giveVote,
        checkIfWalletIsConnected,
        error,
        candidateLength,
        voterLength,
        loader,
        CONTRACT_OWNER,
        setVotingTime,
        isVotingOpen,
        votingEndTime,
        votingStartTime,
       
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
