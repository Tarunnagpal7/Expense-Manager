// services/currencyService.js
import axios from "axios";

export class CurrencyService {
  /**
   * Get exchange rate between two currencies
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<number>} - Exchange rate
   */
  static async getExchangeRate(fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return 1;
      }

      // Use exchangerate-api.com for free exchange rates
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        { timeout: 5000 }
      );

      const rate = response.data.rates[toCurrency];
      if (!rate) {
        throw new Error(
          `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
        );
      }

      return rate;
    } catch (error) {
      console.error("Currency service error:", error.message);

      // Fallback to a mock rate for development
      const mockRates = {
        USD: { EUR: 0.85, GBP: 0.73, INR: 83.0, JPY: 110.0 },
        EUR: { USD: 1.18, GBP: 0.86, INR: 97.0, JPY: 129.0 },
        GBP: { USD: 1.37, EUR: 1.16, INR: 113.0, JPY: 150.0 },
        INR: { USD: 0.012, EUR: 0.01, GBP: 0.009, JPY: 1.32 },
        JPY: { USD: 0.009, EUR: 0.008, GBP: 0.007, INR: 0.76 },
      };

      const fallbackRate = mockRates[fromCurrency]?.[toCurrency];
      if (fallbackRate) {
        console.warn(
          `Using fallback exchange rate: ${fromCurrency} to ${toCurrency} = ${fallbackRate}`
        );
        return fallbackRate;
      }

      throw new Error(
        `Unable to get exchange rate for ${fromCurrency} to ${toCurrency}`
      );
    }
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Promise<number>} - Converted amount
   */
  static async convertAmount(amount, fromCurrency, toCurrency) {
    try {
      const rate = await this.getExchangeRate(fromCurrency, toCurrency);
      return amount * rate;
    } catch (error) {
      console.error("Currency conversion error:", error.message);
      throw error;
    }
  }

  /**
   * Get supported currencies
   * @returns {Array<string>} - List of supported currency codes
   */
  static getSupportedCurrencies() {
    return [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "INR",
      "CAD",
      "AUD",
      "CHF",
      "CNY",
      "SEK",
      "NZD",
      "MXN",
      "SGD",
      "HKD",
      "NOK",
      "TRY",
      "RUB",
      "ZAR",
      "BRL",
      "KRW",
    ];
  }

  /**
   * Validate currency code
   * @param {string} currency - Currency code to validate
   * @returns {boolean} - Whether currency is supported
   */
  static isValidCurrency(currency) {
    return this.getSupportedCurrencies().includes(currency.toUpperCase());
  }

  /**
   * Get currency symbol
   * @param {string} currency - Currency code
   * @returns {string} - Currency symbol
   */
  static getCurrencySymbol(currency) {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      INR: "₹",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      SEK: "kr",
      NZD: "NZ$",
      MXN: "$",
      SGD: "S$",
      HKD: "HK$",
      NOK: "kr",
      TRY: "₺",
      RUB: "₽",
      ZAR: "R",
      BRL: "R$",
      KRW: "₩",
    };
    return symbols[currency.toUpperCase()] || currency;
  }

  /**
   * Format amount with currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted amount
   */
  static formatAmount(amount, currency, decimals = 2) {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

export default CurrencyService;
