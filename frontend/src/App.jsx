import './App.css';
import { useState, useEffect } from 'react';
import { Home, Navbar, Quotes, Dashboard } from './components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuoteClient } from './utils/quoteClient';

const quoteClient = new QuoteClient('http://localhost:3000');

function App() {
  const [senderAddress, setSenderAddress] = useState(
    sessionStorage.getItem('senderAddress')
  );
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem('accessToken')
  );

  const [isLoggedIn, setIsLoggedIn] = useState(accessToken ? 'true' : false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [body, setBody] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [tipAmount, setTipAmount] = useState(1);
  const [rateScore, setRateScore] = useState(4);

  const [quotes, setQuotes] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState({});
  const [faucetAnalytics, setFaucetAnalytics] = useState({});

  /**
   *
   * Effects
   *
   */

  useEffect(() => {
    if (!accessToken) {
      alert('Please go home and log in');
    }
  }, [accessToken]);

  useEffect(() => {
    async function getQuotes() {
      try {
        const { data } = await quoteClient.getQuotes();
        setQuotes(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }

    async function setAnalytics() {
      try {
        const baseUser = {
          numOfQuotes: 0,
          timesRated: 0,
          timesTipped: 0,
          tipAlgos: 0,
          ratingScore: 0,
          userBalance: 0,
        };
        const baseFaucet = {
          faucetAlgos: 0,
          faucetsDone: 0,
        };

        if (!accessToken) {
          setUserAnalytics(baseUser);
          setFaucetAnalytics(baseFaucet);
          return;
        }

        if (!senderAddress) {
          setUserAnalytics(baseUser);
          setFaucetAnalytics(baseFaucet);
          return;
        }

        quoteClient.setAccessToken(accessToken);
        quoteClient.setAuthHeader();

        const quoteData = await quoteClient.getQuotes();
        setQuotes(quoteData.data);

        const userAnalyticsData = await quoteClient.getUserAnalytics(
          senderAddress
        );
        const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
          senderAddress
        );

        setUserAnalytics(userAnalyticsData.data);
        setFaucetAnalytics(faucetAnalyticsData.data);
      } catch (error) {
        console.error(error);
      }
    }

    getQuotes();
    setAnalytics();
  }, [accessToken, senderAddress]);

  /**
   *
   * Helper Functions
   *
   */

  // signup/signin
  async function handleAuth(e, email, password) {
    try {
      e.preventDefault();
      setLoading(true);

      const { data } = await quoteClient.auth({ email, password });
      const { user, accessToken } = data;

      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('senderAddress', user.address);

      setAccessToken(accessToken);
      setSenderAddress(user.address);

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        user.address
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        user.address
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      setIsLoggedIn(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  }

  // handle input change

  function handleOnChange(e, field) {
    switch (field) {
      case 'email':
        setEmail(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      case 'author':
        setAuthor(e.target.value);
        break;
      case 'image':
        setImage(e.target.value);
        break;
      case 'body':
        setBody(e.target.value);
        break;
    }
  }

  function handleShowForm() {
    setShowForm(!showForm);
  }

  /**
   *
   * Add Quote
   *
   */

  async function handleQuoteAdd(e, author, body, image, senderAddress) {
    try {
      e.preventDefault();
      setLoading(true);

      if (!(author || body || image)) {
        alert('All fields are required!');
      }
      const payload = { author, body, image, senderAddress };

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const { msg, data } = await quoteClient.createQuote(payload);

      const quoteData = await quoteClient.getQuotes();
      console.log({ quoteData });
      setQuotes(quoteData.data);

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        senderAddress
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        senderAddress
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      alert(msg + ' ' + data.appId);
      location.reload();
    } catch (error) {
      alert('An error occurred while adding a quote' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
      setAuthor('');
      setBody('');
      setImage('');
    }
  }

  /**
   *
   * Tip Quote
   *
   */

  async function handleTipQuote(e, senderAddress, appId, amount, owner) {
    try {
      e.preventDefault();
      setLoading(true);

      if (senderAddress === owner) {
        alert('Cannot tip your own quote!');
        return;
      }

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const payload = { senderAddress, appId, amount, owner };
      const { msg } = await quoteClient.tipQuote(payload);

      const { data } = await quoteClient.getQuotes();
      setQuotes(data);

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        senderAddress
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        senderAddress
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      alert(msg);
      location.reload();
    } catch (error) {
      alert('An error occurred while tipping a quote: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
      setTipAmount(1);
    }
  }

  /**
   *
   * Rate Quote
   *
   */

  async function handleRateQuote(e, senderAddress, appId, rating, owner) {
    try {
      e.preventDefault();
      setLoading(true);

      if (senderAddress === owner) {
        alert('Cannot rate your own quote!');
        return;
      }

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const payload = { senderAddress, appId, rating };
      const { msg } = await quoteClient.rateQuote(payload);

      const { data } = await quoteClient.getQuotes();
      setQuotes(data);

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        senderAddress
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        senderAddress
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      alert(msg);
      location.reload();
    } catch (error) {
      alert('An error occurred while rating a quote: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
      setRateScore(4);
    }
  }

  /**
   *
   * Delete Quote
   *
   */

  async function handleDeleteQuote(e, index, owner) {
    try {
      e.preventDefault();
      setLoading(true);

      if (owner !== senderAddress) {
        alert('Cannot delete a quote you do not own');
        return;
      }

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const payload = { senderAddress: owner, index };
      const { msg } = await quoteClient.deleteQuote(payload);

      const { data } = await quoteClient.getQuotes();
      console.log({ data });
      setQuotes(data);

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        senderAddress
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        senderAddress
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      alert(msg);
      location.reload();
    } catch (error) {
      alert('An error occurred while deleting a quote');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // handle faucet
  async function handleFaucet(e) {
    try {
      e.preventDefault();
      setLoading(true);

      if (!(senderAddress || accessToken)) {
        alert('Please log in to continue');
        return;
      }

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const { msg } = await quoteClient.faucet();

      quoteClient.setAccessToken(accessToken);
      quoteClient.setAuthHeader();

      const userAnalyticsData = await quoteClient.getUserAnalytics(
        senderAddress
      );
      const faucetAnalyticsData = await quoteClient.getFaucetAnalytics(
        senderAddress
      );

      setUserAnalytics(userAnalyticsData.data);
      setFaucetAnalytics(faucetAnalyticsData.data);

      alert(msg);
      location.reload();
    } catch (error) {
      alert('An error occurred while attempting to faucet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // handle Logout

  async function handleLogout(e) {
    try {
      e.preventDefault();

      if (!(senderAddress || accessToken)) {
        alert('Please log in to continue');
        return;
      }

      setLoading(true);
      setAccessToken('');

      setSenderAddress('');
      sessionStorage.clear();

      location.reload();
    } catch (error) {
      alert('An error occurred while logging out');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <hr />
                <Home
                  email={email}
                  password={password}
                  loading={loading}
                  isLoggedIn={isLoggedIn}
                  handleOnChange={handleOnChange}
                  handleAuth={handleAuth}
                />
              </>
            }
          />

          <Route
            path="/quotes"
            element={
              <>
                <Navbar />
                <hr />
                <Quotes
                  author={author}
                  image={image}
                  body={body}
                  showForm={showForm}
                  senderAddress={senderAddress}
                  handleShowForm={handleShowForm}
                  handleOnChange={handleOnChange}
                  addQuote={handleQuoteAdd}
                  tipAmount={tipAmount}
                  rateScore={rateScore}
                  tipFunc={handleTipQuote}
                  rateFunc={handleRateQuote}
                  handleDelete={handleDeleteQuote}
                  quoteArray={quotes}
                  loading={loading}
                />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <hr />
                <Dashboard
                  userAnalytics={userAnalytics}
                  faucetAnalytics={faucetAnalytics}
                  loading={loading}
                  handleFaucet={handleFaucet}
                  hanleLogout={handleLogout}
                />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
