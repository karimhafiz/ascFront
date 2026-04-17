import { formatDateRange, formatDate, generateRecurringEvents } from "../../src/util/util";

describe("Utility functions", () => {
  describe("formatDateRange", () => {
    it("should format a date as 'Month Day'", () => {
      const result = formatDateRange("2025-05-03T00:00:00.000Z");
      expect(result).toMatch(/May/);
      expect(result).toMatch(/03/);
    });

    it("should handle Date objects", () => {
      const result = formatDateRange(new Date("2025-12-25"));
      expect(result).toMatch(/December/);
      expect(result).toMatch(/25/);
    });
  });

  describe("formatDate", () => {
    it("should format a date string as YYYY-MM-DD", () => {
      const result = formatDate("2025-05-03T00:00:00.000Z");
      expect(result).toMatch(/2025-05-0[23]/); // timezone may shift day
    });

    it("should return empty string for falsy input", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });
  });

  describe("generateRecurringEvents", () => {
    it("should generate weekly occurrences", () => {
      const event = {
        _id: "1",
        title: "Football",
        isReoccurring: true,
        dayOfWeek: "friday",
        reoccurringStartDate: "2025-05-01",
        reoccurringEndDate: "2025-05-31",
      };

      const result = generateRecurringEvents(event);

      // May 2025: Fridays are 2, 9, 16, 23, 30
      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result.length).toBeLessThanOrEqual(5);

      // All results should be on Fridays
      result.forEach((occurrence) => {
        expect(new Date(occurrence.date).getDay()).toBe(5); // Friday
      });
    });

    it("should return empty array if not recurring", () => {
      const event = { isReoccurring: false };
      expect(generateRecurringEvents(event)).toEqual([]);
    });

    it("should return empty array if missing start date", () => {
      const event = {
        isReoccurring: true,
        dayOfWeek: "friday",
        reoccurringEndDate: "2025-05-31",
      };
      expect(generateRecurringEvents(event)).toEqual([]);
    });

    it("should return empty array if missing end date", () => {
      const event = {
        isReoccurring: true,
        dayOfWeek: "friday",
        reoccurringStartDate: "2025-05-01",
      };
      expect(generateRecurringEvents(event)).toEqual([]);
    });

    it("should return empty array if missing dayOfWeek", () => {
      const event = {
        isReoccurring: true,
        reoccurringStartDate: "2025-05-01",
        reoccurringEndDate: "2025-05-31",
      };
      expect(generateRecurringEvents(event)).toEqual([]);
    });

    it("should handle case-insensitive dayOfWeek", () => {
      const event = {
        _id: "1",
        title: "Football",
        isReoccurring: true,
        dayOfWeek: "Monday",
        reoccurringStartDate: "2025-05-01",
        reoccurringEndDate: "2025-05-14",
      };

      const result = generateRecurringEvents(event);
      expect(result.length).toBe(2); // May 5 and May 12
      result.forEach((occurrence) => {
        expect(new Date(occurrence.date).getDay()).toBe(1); // Monday
      });
    });

    it("should preserve original event properties", () => {
      const event = {
        _id: "1",
        title: "Football",
        ticketPrice: 10,
        isReoccurring: true,
        dayOfWeek: "friday",
        reoccurringStartDate: "2025-05-01",
        reoccurringEndDate: "2025-05-10",
      };

      const result = generateRecurringEvents(event);
      expect(result[0].title).toBe("Football");
      expect(result[0].ticketPrice).toBe(10);
    });

    it("should return empty when start is after end", () => {
      const event = {
        isReoccurring: true,
        dayOfWeek: "friday",
        reoccurringStartDate: "2025-06-01",
        reoccurringEndDate: "2025-05-01",
      };
      expect(generateRecurringEvents(event)).toEqual([]);
    });
  });
});
