export class QuoteClient {
  /**
   *
   * Constructor
   *
   */

  constructor(baseUrl, accessToken = '') {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   *
   * Get Quotes
   *
   */

  async getQuotes() {
    const response = await fetch(this.baseUrl + '/quotes', {
      cache: 'no-store',
    });
    const data = await response.json();

    return data;
  }

  /**
   *
   * Create a Quote
   *
   */

  async createQuote(payload) {
    const response = await fetch(this.baseUrl + '/quotes', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Tip a Quote
   *
   */

  async tipQuote(payload) {
    const response = await fetch(this.baseUrl + '/quotes/tip', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Rate a Quote
   *
   */

  async rateQuote(payload) {
    const response = await fetch(this.baseUrl + '/quotes/rate', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Delete a Quote
   *
   */

  async deleteQuote(payload) {
    const response = await fetch(this.baseUrl + '/quotes/delete', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Auth - signup/login
   *
   */

  async auth(payload) {
    const response = await fetch(this.baseUrl + '/users/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Faucet
   *
   */

  async faucet() {
    const response = await fetch(this.baseUrl + '/wallet/faucet', {
      method: 'POST',
      headers: this.headers,
    });

    const data = await response.json();
    return data;
  }

  /**
   *
   * Faucet Analytics
   *
   */

  async getFaucetAnalytics(payload) {
    const response = await fetch(
      this.baseUrl + `/misc/analytics/faucet?address=${payload}`,
      {
        headers: this.headers,
        cache: 'no-store',
      }
    );

    const data = response.json();
    return data;
  }

  /**
   *
   * User Analytic
   *
   */

  async getUserAnalytics(payload) {
    const response = await fetch(
      this.baseUrl + `/misc/analytics/user?address=${payload}`,
      {
        headers: this.headers,
        cache: 'no-store',
      }
    );

    const data = response.json();
    return data;
  }

  /**
   *
   * Internals
   *
   */

  setAccessToken(accessToken) {
    if (!accessToken) {
      throw new Error('Access Token is required');
    }

    this.accessToken = accessToken;
  }

  setAuthHeader() {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
}
