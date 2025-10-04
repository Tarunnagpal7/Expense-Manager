// services/ocrService.js
import axios from "axios";

export class OCRService {
  /**
   * Extract text from receipt image using OCR API
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} filename - Original filename
   * @returns {Promise<Object>} - Extracted text and structured data
   */
  static async extractReceiptData(imageBuffer, filename) {
    try {
      // For production, you would use a real OCR service like:
      // - Google Vision API
      // - AWS Textract
      // - Azure Computer Vision
      // - Tesseract.js (for local processing)

      // This is a mock implementation that simulates OCR processing
      const mockReceiptData = {
        merchant: "Sample Store",
        date: new Date().toISOString().split("T")[0],
        total: "25.50",
        currency: "USD",
        items: [
          { description: "Coffee", amount: "3.50" },
          { description: "Sandwich", amount: "8.95" },
          { description: "Tax", amount: "1.05" },
        ],
        rawText:
          "Sample Store\n123 Main St\nCoffee: $3.50\nSandwich: $8.95\nTax: $1.05\nTotal: $25.50",
        confidence: 0.85,
      };

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        data: mockReceiptData,
        message: "Receipt data extracted successfully",
      };
    } catch (error) {
      console.error("OCR processing error:", error);
      return {
        success: false,
        error: "Failed to process receipt image",
        message: error.message,
      };
    }
  }

  /**
   * Validate extracted receipt data
   * @param {Object} receiptData - Extracted receipt data
   * @returns {Object} - Validation result
   */
  static validateReceiptData(receiptData) {
    const errors = [];

    if (!receiptData.merchant) {
      errors.push("Merchant name not found");
    }

    if (!receiptData.total || isNaN(parseFloat(receiptData.total))) {
      errors.push("Valid total amount not found");
    }

    if (!receiptData.date) {
      errors.push("Date not found");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse receipt data into expense format
   * @param {Object} receiptData - Extracted receipt data
   * @returns {Object} - Parsed expense data
   */
  static parseReceiptToExpense(receiptData) {
    return {
      title: `Receipt from ${receiptData.merchant}`,
      description: receiptData.rawText,
      amountOriginal: parseFloat(receiptData.total),
      currencyOriginal: receiptData.currency || "USD",
      dateOfExpense: new Date(receiptData.date),
      category: "Business Expense",
      merchant: receiptData.merchant,
      items: receiptData.items,
    };
  }
}

export default OCRService;
