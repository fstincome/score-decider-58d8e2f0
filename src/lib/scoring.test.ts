import { describe, it, expect } from "vitest";
import { computeReveal } from "./scoring";
const ranked = ["A","B","C","D","E","F","G","H","I","J"];
const base = { reveal_order: "best_first", reveal_count: null, reveal_mode: "all", reveal_step: 0 };
describe("computeReveal", () => {
  it("proclaims only top 3 of 10", () => {
    expect(computeReveal(ranked, { ...base, reveal_count: 3 }).shown.map(x => x.row)).toEqual(["A","B","C"]);
  });
  it("starts from the last of the top 5", () => {
    expect(computeReveal(ranked, { ...base, reveal_count: 5, reveal_order: "last_first" }).shown.map(x => x.rank)).toEqual([5,4,3,2,1]);
  });
  it("one by one shows only revealed steps", () => {
    expect(computeReveal(ranked, { ...base, reveal_count: 3, reveal_order: "last_first", reveal_mode: "one", reveal_step: 1 }).shown.map(x => x.row)).toEqual(["C"]);
  });
});
