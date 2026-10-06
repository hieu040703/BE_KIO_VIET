describe("BaseQueue Bull runtime compatibility", () => {
  it("uses Bull 3 because BaseQueue relies on named jobs and named processors", () => {
    const { version } = require("bull/package.json") as { version: string };
    const major = Number(version.split(".")[0]);

    expect(major).toBe(3);
  });
});
