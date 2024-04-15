import '../styles/Quote.css';

export function Quote({
  author,
  body,
  id,
  image,
  owner,
  tipsReceived,
  timesTipped,
  totalRatings,
  timesRated,
  loading,
  tipAmount,
  rateScore,
  tipFunc,
  rateFunc,
  handleDelete,
  handleOnChange,
  senderAddress,
}) {
  let averageRating;

  if (totalRatings === 0 || timesRated === 0) {
    averageRating = totalRatings;
  } else {
    averageRating = Number(totalRatings / timesRated).toFixed(2);
  }
  const showDelete = senderAddress === owner;

  return (
    <>
      <div className="card">
        <div className="header">
          <img src={image} alt={author} />
        </div>
        <div className="body">
          <p>{body}</p>
          <p>- {author}</p>
        </div>

        <div className="details">
          <span>Details</span>
          <p>Times tipped: {timesTipped} </p>
          <p>Tips received: {tipsReceived} ALGOs</p>
          <p>Average rating: {averageRating}</p>
        </div>

        <div className="action">
          <div>
            <input
              type="number"
              name="tip"
              id="tip"
              min={1}
              value={tipAmount}
              onChange={(e) => handleOnChange(e, 'tip')}
            />
            <button
              disabled={loading}
              onClick={async (e) =>
                await tipFunc(e, senderAddress, id, tipAmount, owner)
              }
            >
              Tip
            </button>
          </div>
          <div>
            <input
              type="number"
              name="rate"
              id="rate"
              min={1}
              max={5}
              value={rateScore}
              onChange={(e) => handleOnChange(e, 'rate')}
            />
            <button
              disabled={loading}
              onClick={async (e) =>
                await rateFunc(e, senderAddress, id, rateScore, owner)
              }
            >
              Rate
            </button>
          </div>
          <div>
            <button
              disabled={loading}
              className={`${showDelete ? 'show' : 'hide'} delete-btn`}
              onClick={async (e) => handleDelete(e, id, senderAddress)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
