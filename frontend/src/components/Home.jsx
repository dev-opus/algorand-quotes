import '../styles/Home.css';

export function Home({
  isLoggedIn,
  loading,
  email,
  password,
  handleOnChange,
  handleAuth,
}) {
  /**
   *
   * Helpers
   *
   */

  return (
    <>
      <div className={`${isLoggedIn ? 'hide' : 'show'} auth`}>
        <form>
          <fieldset>
            <legend>
              <h2>Authentication Form</h2>
            </legend>

            <div className="form-control">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => handleOnChange(e, 'email')}
              />
            </div>

            <div className="form-control">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => handleOnChange(e, 'password')}
              />
            </div>

            <div className="form-control">
              <button
                disabled={loading}
                onClick={async (e) => handleAuth(e, email, password)}
              >
                Submit
              </button>
            </div>
          </fieldset>
        </form>
      </div>
      <section className="home">
        <h2 className="title">Welcome to the Algorand Quotes DApp!</h2>

        <p>
          On this DApp, you can browse through a collection of awe-inspiring
          quotes, tipping <br />
          your favourites. And when you are ready, you can add your own quote as
          well!
        </p>
      </section>
    </>
  );
}
