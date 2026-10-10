import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes cells that need it, escapes formulas and ends rows with CRLF", () => {
    expect(
      toCsv([
        ["handle", "problem"],
        ["silk-saree", 'Row 2: price "abc" is not a valid amount'],
        ["=evil", "-5"],
        ["multi", "line\nbreak, comma"],
      ]),
    ).toBe(
      'handle,problem\r\nsilk-saree,"Row 2: price ""abc"" is not a valid amount"\r\n\'=evil,-5\r\nmulti,"line\nbreak, comma"\r\n',
    );
  });
});
