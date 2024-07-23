// withAuthorization.js
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { VotingContext } from "../context/Voter";

const withAuthorization = (WrappedComponent, requiredRole) => {
  return (props) => {
    const router = useRouter();
    const { currentAccount, CONTRACT_OWNER } = useContext(VotingContext);

    useEffect(() => {
      if (currentAccount !== CONTRACT_OWNER) {
        router.push('/'); // Redirect to home or any other page if not authorized
      }
    }, [currentAccount, requiredRole, router]);

    if (currentAccount !== CONTRACT_OWNER) {
      return <p>Loading...</p>; // Optionally, display a loading indicator while checking
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthorization;
//HOC used