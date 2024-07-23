import React, { useState, useContext } from "react";
import Style from "../card/card.module.css";
import { VotingContext } from "../../context/Voter";

const Card = ({ candidateArray, giveVote, currentAccount, CONTRACT_OWNER }) => {
  const [showTotalVotes, setShowTotalVotes] = useState(false);

  const toggleShowTotalVotes = () => {
    setShowTotalVotes(!showTotalVotes);
  };

  return (
    <div className={Style.cardContainer}>
      {currentAccount === CONTRACT_OWNER && (
        <button onClick={toggleShowTotalVotes} className={Style.toggleButton}>
          {showTotalVotes ? "Hide Total Votes" : "Show Total Votes"}
        </button>
      )}
      <div className={Style.cardboxes}>
      {candidateArray?.map((el, i) => (
        <div className={Style.card_box} key={i}>
          <div className={Style.image}>
            <img src={el?.image} alt="Profile photo" />
          </div>

          <div className={Style.card_info}>
            <h2>{el?.candidateID}</h2>
            <p>Party: {el?.age}</p>
            <p>Address: {el?.address.slice(0, 12)}...</p>
            <p className={Style.total}>{"Total Votes"}</p>
          </div>

          <div className={Style.card_vote}>
            <p>{showTotalVotes ? el?.totalVote : "Reveal Soon"}</p>
          </div>

          <div className={Style.card_button}>
            <button
              onClick={() =>
                giveVote({ id: el?.candidateID, address: el?.address })
              }
            >
              Give Vote
            </button>
          </div>
        </div>
        
      ))}
    </div>
    </div>
  );
};

export default Card;
