/* ================================================================
   Dialling codes for the enquiry form's phone field.

   Adapted from the source component's country table, with its
   validation replaced. The original stores a regex per country and
   tests it against the number AFTER stripping spaces, dashes and
   brackets — but the US and Canada patterns REQUIRE brackets:

     /^(\([0-9]{3}\))\s?[0-9]{3}-?[0-9]{4}$/

   Cleaning "(555) 123-4567" gives "5551234567", which that pattern can
   never match, so the two countries the component defaults to could
   never be valid. Several others disagree with their own maxLength as
   well — France allows 12 characters but demands exactly 10 digits.

   So: no regexes. Every entry carries the number of national digits it
   accepts, and validation counts digits. That is all these patterns
   were ever really checking, and it cannot contradict itself.

   `min`/`max` are national digits, excluding the dialling code.
   ================================================================ */

export const COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54", eg: "9 11 1234-5678", min: 10, max: 11 },
  { code: "AU", name: "Australia", flag: "🇦🇺", dial: "+61", eg: "412 345 678", min: 9, max: 10 },
  { code: "AT", name: "Austria", flag: "🇦🇹", dial: "+43", eg: "664 123456", min: 10, max: 11 },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dial: "+880", eg: "1712-345678", min: 10, max: 11 },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dial: "+32", eg: "470 12 34 56", min: 9, max: 9 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dial: "+55", eg: "(11) 91234-5678", min: 10, max: 11 },
  { code: "CA", name: "Canada", flag: "🇨🇦", dial: "+1", eg: "(555) 123-4567", min: 10, max: 10 },
  { code: "CL", name: "Chile", flag: "🇨🇱", dial: "+56", eg: "9 8765 4321", min: 9, max: 9 },
  { code: "CN", name: "China", flag: "🇨🇳", dial: "+86", eg: "138 0013 8000", min: 11, max: 11 },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dial: "+57", eg: "321 1234567", min: 10, max: 10 },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", dial: "+420", eg: "601 123 456", min: 9, max: 9 },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dial: "+45", eg: "20 12 34 56", min: 8, max: 8 },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dial: "+20", eg: "10 1234 5678", min: 10, max: 10 },
  { code: "FI", name: "Finland", flag: "🇫🇮", dial: "+358", eg: "50 123 4567", min: 9, max: 10 },
  { code: "FR", name: "France", flag: "🇫🇷", dial: "+33", eg: "6 12 34 56 78", min: 9, max: 10 },
  { code: "DE", name: "Germany", flag: "🇩🇪", dial: "+49", eg: "151 12345678", min: 10, max: 12 },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dial: "+233", eg: "23 123 4567", min: 9, max: 9 },
  { code: "GR", name: "Greece", flag: "🇬🇷", dial: "+30", eg: "694 123 4567", min: 10, max: 10 },
  { code: "HU", name: "Hungary", flag: "🇭🇺", dial: "+36", eg: "20 123 4567", min: 8, max: 9 },
  { code: "IN", name: "India", flag: "🇮🇳", dial: "+91", eg: "98765 43210", min: 10, max: 10 },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62", eg: "812-3456-789", min: 9, max: 13 },
  { code: "IL", name: "Israel", flag: "🇮🇱", dial: "+972", eg: "50-123-4567", min: 9, max: 9 },
  { code: "IT", name: "Italy", flag: "🇮🇹", dial: "+39", eg: "312 345 6789", min: 9, max: 10 },
  { code: "JP", name: "Japan", flag: "🇯🇵", dial: "+81", eg: "90 1234 5678", min: 10, max: 11 },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dial: "+254", eg: "712 123456", min: 9, max: 9 },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60", eg: "12-345 6789", min: 9, max: 10 },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dial: "+52", eg: "55 1234 5678", min: 10, max: 10 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dial: "+31", eg: "6 12345678", min: 9, max: 9 },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dial: "+234", eg: "802 123 4567", min: 10, max: 10 },
  { code: "NO", name: "Norway", flag: "🇳🇴", dial: "+47", eg: "412 34 567", min: 8, max: 8 },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dial: "+92", eg: "301 2345678", min: 10, max: 10 },
  { code: "PE", name: "Peru", flag: "🇵🇪", dial: "+51", eg: "987 654 321", min: 9, max: 9 },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63", eg: "917 123 4567", min: 10, max: 10 },
  { code: "PL", name: "Poland", flag: "🇵🇱", dial: "+48", eg: "512 123 456", min: 9, max: 9 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351", eg: "912 345 678", min: 9, max: 9 },
  { code: "RU", name: "Russia", flag: "🇷🇺", dial: "+7", eg: "912 123-45-67", min: 10, max: 10 },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966", eg: "50 123 4567", min: 9, max: 9 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65", eg: "8123 4567", min: 8, max: 8 },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dial: "+27", eg: "82 123 4567", min: 9, max: 9 },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dial: "+82", eg: "10 1234 5678", min: 9, max: 11 },
  { code: "ES", name: "Spain", flag: "🇪🇸", dial: "+34", eg: "612 34 56 78", min: 9, max: 9 },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dial: "+94", eg: "71 234 5678", min: 9, max: 9 },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dial: "+46", eg: "70 123 45 67", min: 9, max: 9 },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dial: "+41", eg: "78 123 45 67", min: 9, max: 9 },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66", eg: "81 234 5678", min: 9, max: 9 },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dial: "+90", eg: "532 123 45 67", min: 10, max: 10 },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971", eg: "50 123 4567", min: 9, max: 9 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44", eg: "7911 123456", min: 10, max: 10 },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1", eg: "(555) 123-4567", min: 10, max: 10 },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dial: "+598", eg: "91 123 456", min: 8, max: 8 },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dial: "+58", eg: "412-1234567", min: 10, max: 10 },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84", eg: "91 234 56 78", min: 9, max: 10 },
];

export const digitsOf = (s) => (s || "").replace(/\D/g, "");

export function findCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

/** Counts national digits. Empty is not invalid — it is empty. */
export function checkPhone(national, country) {
  const n = digitsOf(national).length;
  if (n === 0) return "empty";
  if (n < country.min) return "short";
  if (n > country.max) return "long";
  return "ok";
}
