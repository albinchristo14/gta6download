import { describe, expect, it } from "vitest";
import { adSlotFor, parseAdSlots } from "./ads";

describe("parseAdSlots", () => {
  it("returns no slots when the env var is absent", () => {
    expect(parseAdSlots(undefined)).toEqual({});
  });

  it("returns no slots when the value is not valid JSON", () => {
    expect(parseAdSlots("{article-top:123}")).toEqual({});
  });

  it("keeps numeric slot ids and drops everything else", () => {
    const raw = JSON.stringify({
      "article-top": "1234567890",
      "article-bottom": 9876543210,
      "bad": "abc",
      "empty": "   ",
    });
    expect(parseAdSlots(raw)).toEqual({ "article-top": "1234567890" });
  });

  it("trims surrounding whitespace from ids", () => {
    expect(parseAdSlots(JSON.stringify({ "article-top": " 1234567890 " }))).toEqual({
      "article-top": "1234567890",
    });
  });

  it("ignores prototype-polluting keys", () => {
    expect(parseAdSlots('{"__proto__":"1234567890","constructor":"1234567890"}')).toEqual({});
  });
});

describe("adSlotFor", () => {
  it("returns the configured slot for a known placement", () => {
    expect(adSlotFor("article-top", '{"article-top":"1234567890"}')).toBe("1234567890");
  });

  it("returns undefined for a placement with no unit", () => {
    expect(adSlotFor("home-after-facts", '{"article-top":"1234567890"}')).toBeUndefined();
  });
});
