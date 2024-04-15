import '../styles/Quotes.css';
import { Quote } from './Quote';

export function Quotes({
  quoteArray,
  addQuote,
  author,
  image,
  body,
  loading,
  showForm,
  senderAddress,
  tipAmount,
  rateScore,
  tipFunc,
  rateFunc,
  handleDelete,
  handleShowForm,
  handleOnChange,
}) {
  return (
    <>
      {!quoteArray && (
        <p className="no-quotes">
          Oops! Looks like there are no quotes yet, consider adding yours...
        </p>
      )}

      {quoteArray && quoteArray.length < 1 && (
        <p className="no-quotes">
          Oops! Looks like there are no quotes yet, consider adding yours...
        </p>
      )}

      <div className="show-form">
        <button className="toggle-form" onClick={handleShowForm}>
          {showForm ? 'Close form' : 'Create Quote'}
        </button>
      </div>

      <section className="quotes">
        <div className={`${showForm ? 'show' : 'hide'} add`}>
          <form>
            <fieldset>
              <legend>
                <h2>Add Quote</h2>
              </legend>

              <div className="form-control">
                <label htmlFor="author">Author:</label>
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={author}
                  onChange={(e) => handleOnChange(e, 'author')}
                />
              </div>

              <div className="form-control">
                <label htmlFor="image">Image:</label>
                <input
                  type="text"
                  name="image"
                  id="image"
                  value={image}
                  onChange={(e) => handleOnChange(e, 'image')}
                />
              </div>

              <div className="form-control">
                <label htmlFor="quote">Quote:</label>
                <textarea
                  name="quote"
                  id="quote"
                  cols={30}
                  rows={10}
                  value={body}
                  onChange={(e) => handleOnChange(e, 'body')}
                ></textarea>
              </div>

              <div className="form-control">
                <button
                  disabled={loading}
                  onClick={async (e) =>
                    await addQuote(e, author, body, image, senderAddress)
                  }
                >
                  Add Quote
                </button>
              </div>
            </fieldset>
          </form>
        </div>

        <div className="contents">
          {quoteArray.map((quoteData) => {
            return (
              <Quote
                id={quoteData.appId}
                author={quoteData.author}
                image={quoteData.image}
                body={quoteData.body}
                owner={quoteData.owner}
                timesRated={quoteData.times_rated}
                timesTipped={quoteData.times_tipped}
                totalRatings={quoteData.total_rating}
                tipsReceived={quoteData.tip_received}
                key={quoteData.appId}
                tipAmount={tipAmount}
                rateScore={rateScore}
                handleOnChange={handleOnChange}
                tipFunc={tipFunc}
                rateFunc={rateFunc}
                handleDelete={handleDelete}
                loading={loading}
                senderAddress={senderAddress}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
