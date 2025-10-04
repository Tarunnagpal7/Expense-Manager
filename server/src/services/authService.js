import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthService {
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  static generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }
    return jwt.sign({ userId }, secret, { expiresIn: "7d" });
  }

  static async getCountryCurrency(countryName) {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,currencies"
      );
      const countries = await response.json();

      const country = countries.find(
        (c) =>
          c.name.common.toLowerCase() === countryName.toLowerCase() ||
          c.name.official.toLowerCase() === countryName.toLowerCase()
      );

      if (country && country.currencies) {
        const currencyCode = Object.keys(country.currencies)[0];
        return currencyCode;
      }

      return "USD"; // Default fallback
    } catch (error) {
      console.error("Error fetching country currency:", error);
      return "USD";
    }
  }
}

export { AuthService };
