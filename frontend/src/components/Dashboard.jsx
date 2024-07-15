import '../styles/Dashboard.css';

export function Dashboard({
  userAnalytics,
  faucetAnalytics,
  loading,
  handleFaucet,
  hanleLogout,
}) {
  console.log({ userAnalytics, faucetAnalytics });
  return (
    <>
      <div className="dashboard">
        <div className="faucets">
          <fieldset>
            <legend>
              <h2>Faucet</h2>
            </legend>

            <button disabled={loading} onClick={async (e) => handleFaucet(e)}>
              Faucet
            </button>
            <p>
              You have received a total of{' '}
              {Number.parseInt(faucetAnalytics.faucetAlgos)} ALGOs from faucets
            </p>
            <p>
              You have {10 - Number.parseInt(faucetAnalytics.faucetsDone)}{' '}
              faucets left. Each user can only make up to 10 faucets
            </p>
          </fieldset>
        </div>

        <div className="analytics">
          <fieldset>
            <legend>
              <h2>Analytics</h2>
            </legend>

            <p>
              You have added{' '}
              {userAnalytics.numOfQuotes ? userAnalytics.numOfQuotes : 0} quotes
            </p>
            <p>
              Your quotes have been rated{' '}
              {userAnalytics.timesRated ? userAnalytics.timesRated : 0} times
            </p>
            <p>
              Your quotes have a combined rating score of{' '}
              {userAnalytics.ratingScore ? userAnalytics.ratingScore : 0}
            </p>
            <p>
              Your quotes have been tipped{' '}
              {userAnalytics.timesTipped ? userAnalytics.timesTipped : 0} times
            </p>
            <p>
              You have received{' '}
              {userAnalytics.tipAlgos ? userAnalytics.tipAlgos : 0} ALGOs in
              tips from your quotes
            </p>
            <p>
              You have an overall balance of{' '}
              {userAnalytics.userBalance ? userAnalytics.userBalance : 0} ALGOs
            </p>
          </fieldset>
        </div>

        <div className="logout">
          <fieldset>
            <legend>
              <h2>Logout</h2>
            </legend>

            <button disabled={loading} onClick={hanleLogout}>
              Log out
            </button>
          </fieldset>
        </div>
      </div>
    </>
  );
}
