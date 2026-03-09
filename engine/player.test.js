import Player from "./player";

test("test creating a sample player", () => {
  const samplePlayer = new Player({
    id: 1,
    name: "Test",
    rating: 1600,
    results: ["W", "D", "FW", "L", "FB"],
    colors: ["W", "B", "W"],
    opponents: [2, 3, 4],
  });

  expect(samplePlayer.score).toBe(3.5);
  expect(samplePlayer.hadBye).toBe(1);
});
