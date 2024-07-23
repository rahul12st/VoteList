import React, { useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";

// INTERNAL IMPORT
import { VotingContext } from "../../context/Voter";
import Style from "./NavBar.module.css";
import logo from "../../logo.png";

const NavBar = () => {
  const { connectWallet, error, currentAccount ,CONTRACT_OWNER} = useContext(VotingContext);
  const [openNav, setOpenNav] = useState(false);
  

  const toggleNavigation = () => {
    setOpenNav(!openNav);
  };
// console.log("Current Account:", currentAccount);
//   console.log("Contract Owner:", CONTRACT_OWNER);
//   if(currentAccount==CONTRACT_OWNER){
//     console.log("yes");
//   }
  const isContractOwner = currentAccount === CONTRACT_OWNER;

  return (
    <div className={Style.navbar}>
      {error && (
        <div className={Style.message__Box}>
          <p>{error}</p>
        </div>
      )}
         
      <div className={Style.navbar_box}>
        <div className={Style.title}>
          <Link href="/">
            <Image src={logo} alt="logo" width={59} height={55} />
          </Link>
        </div>

        <div className={Style.connect}>
          {currentAccount ? (
            <div className={Style.connect_flex}>
              <button onClick={toggleNavigation}>
                {currentAccount.slice(0, 10)}..
                <span>{openNav ? <AiFillUnlock /> : <AiFillLock />}</span>
              </button>

              {openNav && (
                <div className={Style.navigation}>
                  <p>
                    <Link href="/">Home</Link>
                  </p>
                   {isContractOwner && (
                    <>
                      <p>
                        <Link href="/candidate-regisration">Candidate Registration</Link>
                      </p>
                      <p>
                        <Link href="/allowed-voters">Voter Registration</Link>
                      </p>
                    </>
                  )}
                  <p>
                    <Link href="/voterList">Voter List</Link>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
