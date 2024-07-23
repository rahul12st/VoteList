import { useState, useCallback, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import withAuthorization from '../components/withAuthorization';
import { VotingContext } from "../context/Voter";
import Style from "../styles/allowedVoter.module.css";
import images from "../assets";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import Loader from "../components/Loader";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { VotingAddressABI, VotingAddress } from "../context/constants";

const CandidateRegistration = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const { currentAccount } = useContext(VotingContext);
  const {
    uploadToIPFSCandidate,
    setCandidate,
    getNewCandidate,
    candidateArray,
    loader,
    setVotingTime,
  } = useContext(VotingContext);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    address: "",
    age: "",
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const router = useRouter();

  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFSCandidate(acceptedFile[0]);
    setFileUrl(url);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });

  const handleSetVotingTime = async () => {
    await setVotingTime(startTime, endTime);
  };

  const resetVoting = async () => {
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(YOUR_CONTRACT_ADDRESS, YOUR_CONTRACT_ABI, signer);

      const tx = await contract.resetVoting();
      await tx.wait();

      setResetSuccess('Voting has been successfully reset.');
      // Optionally, reload or redirect
      router.reload();
    } catch (err) {
      setResetError('An error occurred while resetting the voting.');
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    getNewCandidate();
  }, []);

  return (
    <div className={Style.createVoter}>
      <div className={Style.blockone}>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="asset_file" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span>&nbsp;{candidateForm.name}</span>
              </p>
              <p>
                Address:&nbsp; <span>{candidateForm.address.slice(0, 20)} </span>
              </p>
              <p>
                Party:&nbsp;<span>{candidateForm.age}</span>
              </p>
            </div>
          </div>
        )}

        {!fileUrl && (
          <div className={Style.sideInfo}>
            <div className={Style.sideInfo_box}>
              <h4>Create Candidate For Voting</h4>
              <p>
                Blockchain voting organization, providing Ethereum blockchain ecosystem.
              </p>
              <p className={Style.sideInfo_para}>Contract Candidate List</p>
            </div>
            <div className={Style.car}>
              {candidateArray
                ?.map((el, i) => (
                  <div key={i + 1} className={Style.card_box}>
                    <div className={Style.image}>
                      <img src={el?.image} alt="Profile photo" />
                    </div>
                    <div className={Style.card_info}>
                      <p>Party: {el?.age}</p>
                      <p>ID: {el?.candidateID}</p>
                      <p>Address: {el?.address.slice(0, 7)}..</p>
                    </div>
                  </div>
                ))
                .slice(0, 4)}
            </div>
          </div>
        )}
      </div>

     

      <div className={Style.createdVoter}>
        <div className={Style.createdVoter__info}>
          <h2>Organizer </h2>
          <Image src={images.creator} alt="user profile" />
          <p>Notice</p>
          <p>
            Organizer <span>{currentAccount.slice(0, 10)}..</span>
          </p>
          <p>
            Only organizer of the voting contract can create voter and candidate
            for voting election
          </p>
        </div>
      </div>
      <div className={Style.voter}>
        <div className={Style.voter__container}>
        <div className={Style.voter__container1}>
          <h1>Register New Candidate</h1>
          </div>
          <div className={Style.voter__container__box}>
            <div className={Style.voter__container__box__div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className={Style.voter__container__box__div_info}>
                  <p>Upload File: JPG, PNG, GIF, WEBM MAX 100MB</p>
                  <div className={Style.voter__container__box__div__image}>
                    <Image
                      src={images.upload}
                      width={150}
                      height={150}
                      objectFit="contain"
                      alt="file upload"
                    />
                  </div>
                  <p>Drag & Drop File</p>
                  <p>or Browse media on your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.input__container}>
          <Input
            inputType="text"
            title="Name"
            placeholder="Candidate Name"
            handleClick={(e) =>
              setCandidateForm({ ...candidateForm, name: e.target.value })
            }
            value={candidateForm.name}
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Candidate Address"
            handleClick={(e) =>
              setCandidateForm({ ...candidateForm, address: e.target.value })
            }
            value={candidateForm.address}
          />
          <Input
            inputType="text"
            title="Party"
            placeholder="Candidate party"
            handleClick={(e) =>
              setCandidateForm({ ...candidateForm, age: e.target.value })
            }
            value={candidateForm.age}
          />

          <div className={Style.Button}>
            <Button
              btnName="Authorize Candidate"
              handleClick={() => setCandidate(candidateForm, fileUrl, router)}
            />
          </div>
        </div>
      </div>
      <div className={Style.centeredContainer}>
      <div className={Style.votingTime}>
        <h2>Set Voting Time</h2>
        <label>
          Start Time
          <input
            type="datetime-local"
            onChange={(e) => setStartTime(e.target.value)}
            value={startTime}
          />
        </label>
        <label>
          End Time
          <input
            type="datetime-local"
            onChange={(e) => setEndTime(e.target.value)}
            value={endTime}
          />
        </label>
        <Button btnName="Set Voting Time" handleClick={handleSetVotingTime} />
      </div>
</div>
<div className={Style.reset}>
      <div className={Style.resetVoting}>
        <h2>Reset Voting</h2>
        <Button
          btnName={resetLoading ? "Resetting..." : "Reset Voting"}
          handleClick={resetVoting}
          disabled={resetLoading}
        />
        {resetSuccess && <p style={{ color: 'green' }}>{resetSuccess}</p>}
        {resetError && <p style={{ color: 'red' }}>{resetError}</p>}
      </div>
      </div>

      {loader && <Loader />}
    </div>
  );
};

export default withAuthorization(CandidateRegistration, process.env.CONTRACT_OWNER);
