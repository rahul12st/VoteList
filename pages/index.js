import React, { useState, useEffect, useContext } from "react";
import Countdown from "react-countdown";

// INTERNAL IMPORT
import { VotingContext } from "../context/Voter";
import Style from "../styles/index.module.css";
import Card from "../components/card/card";

const Index = () => {
  const {
    getNewCandidate,
    candidateArray,
    giveVote,
    checkIfWalletIsConnected,
    candidateLength,
    getAllVoterData,
    currentAccount,
    voterLength,
    votingStartTime, 
    votingEndTime,
    CONTRACT_OWNER
  } = useContext(VotingContext);
  const [countdownTime, setCountdownTime] = useState(null);
  
  useEffect(() => {
    getNewCandidate();
    getAllVoterData();

    if (votingEndTime) {
      setCountdownTime(votingEndTime);
    }
  }, [currentAccount, votingEndTime]);
  return (<>
  
    <div className={Style.home}>
    
      
      <div className={Style.hero}>
        <div className={Style.heroContent}>
          <h1 className={Style.heroTitle}>VoteList </h1>
          <h1>Each vote is Decentralised</h1>
          <p className={Style.heroSubtitle}>
            Participate in fair and transparent voting
          </p>
        </div>
      </div>
    </div>


    <div className={Style.home}>
      <div className={Style.down}>
        {currentAccount && (
          <div className={Style.winner}>
            <div className={Style.winner_info}>
              <div className={Style.candidate_list}>
                <p>
                  No Candidate: <span>{candidateLength}</span>
                </p>
              </div>
              <div className={Style.candidate_list}>
                <p>
                  No Voter: <span>{voterLength}</span>
                </p>
              </div>
            </div>
            <div className={Style.winner_message}>
                {countdownTime && (
                  <small>
                    <Countdown date={countdownTime} />
                  </small>
                )}
              </div>
          </div>
        )}

        <Card candidateArray={candidateArray} giveVote={giveVote} currentAccount={currentAccount}
        CONTRACT_OWNER={CONTRACT_OWNER}/>
      </div>
      </div>
    
    </>
  );
};

export default Index;
