const Player = require('../player')
const scoreTiebreak = require('./scoreTiebreak')
const modifiedMedian = require('./modifiedMedian')
const solkoff = require('./solkoff')
const cumulative = require('./cumulative')
const standings = require('./standings')
const cumulativeOpponents = require('./cumulativeOpponents')

test("testing rating tiebreaks", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [2],
      results: ["W"],
      colors: ["W"],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [1],
      results: ["L"],
      colors: ["B"],
    }),
  );
  players = scoreTiebreak(players);
  expect(players.length).toBe(1);
  expect(players[0].name).toBe("Peyton");
});

test("testing multiple players with the highest score", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [2],
      results: ["W"],
      colors: ["W"],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [1],
      results: ["L"],
      colors: ["B"],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [],
      results: ["FB"],
      colors: [],
    }),
  );
  players = scoreTiebreak(players);
  expect(players.length).toBe(2);
  for (let i = 0; i < players.length; i++) {
    expect(players[i].name).not.toBe("David");
  }
});

test('testing modified median tiebreak', () => {
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [2,5],
        results: ['W', 'W'],
        colors: []
    }))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [1,4],
        results: ['L', 'W'],
        colors: []
    }))
    players.push(new Player({
        id: 3,
        name: 'Jeff',
        rating: 700,
        opponents: [4,6],
        results: ['W', 'L'],
        colors: []
    }))
    players.push(new Player({
        id: 4,
        name: 'Jim',
        rating: 2100,
        opponents: [3,2],
        results: ['W', 'W'],
        colors: []
    }))
    players.push(new Player({
        id: 5,
        name: 'John',
        rating: 1700,
        opponents: [6,1],
        results: ['W', 'W'],
        colors: []
    }))
    players.push(new Player({
        id: 6,
        name: 'League',
        rating: 700,
        opponents: [5,3],
        results: ['W', 'W'],
        colors: []
    }))
    candidates = scoreTiebreak(players)
    candidates = modifiedMedian(players, candidates)
    correctCandidates = []
    correctCandidates.push(players[0])
    correctCandidates.push(players[4])
    correctCandidates.push(players[5])
    checkedCandidates = []
    expect(candidates.length).toBe(3)
    for(let i = 0; i < candidates.length; i++){
        expect(correctCandidates.includes(candidates[i])).toBe(true)
        expect(checkedCandidates.includes(candidates[i])).toBe(false)
        checkedCandidates.push(candidates[i])
    }
})

test("testing solkoff tiebreak", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [2, 5],
      results: ["W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [1, 4],
      results: ["L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [4, 6],
      results: ["W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [3, 2],
      results: ["W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 5,
      name: "John",
      rating: 1700,
      opponents: [6, 5],
      results: ["W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 6,
      name: "League",
      rating: 700,
      opponents: [5, 3],
      results: ["W", "W"],
      colors: [],
    }),
  );
  candidates = scoreTiebreak(players);
  candidates = solkoff(players, candidates);
  expect(candidates.length).toBe(1);
  expect(candidates[0]).toBe(players[4]);
});
test("testing cumulative tiebreak", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [2, 4, 3],
      results: ["W", "W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [1, 3, 4],
      results: ["L", "W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [4, 2, 1],
      results: ["W", "L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [3, 1, 2],
      results: ["L", "L", "L"],
      colors: [],
    }),
  );
  candidates = scoreTiebreak(players);
  candidates = cumulativeOpponents(players, candidates);
  expect(candidates.length).toBe(1);
  expect(candidates[0].name).toBe('David');
});
test("testing cumulative opposition tiebreak", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [2, 4, 3],
      results: ["W", "W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [1, 3, 4],
      results: ["L", "W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [4, 2, 1],
      results: ["W", "L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [3, 1, 2],
      results: ["L", "L", "L"],
      colors: [],
    }),
  );
  candidates = scoreTiebreak(players);
  candidates = cumulative(players, candidates);
  expect(candidates.length).toBe(1);
  expect(candidates[0].name).toBe('Peyton');
});
test("testing full tiebreak functionality", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [5, 3, 2],
      results: ["W", "W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [6, 8, 1],
      results: ["W", "W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [7, 1, 6],
      results: ["W", "L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [8, 6, 7],
      results: ["L", "L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 5,
      name: "John",
      rating: 2100,
      opponents: [1, 7, 8],
      results: ["L", "W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 6,
      name: "Jeffery",
      rating: 1700,
      opponents: [2, 4, 3],
      results: ["L", "W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 7,
      name: "Geoff",
      rating: 700,
      opponents: [3, 5, 4],
      results: ["L", "L", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 8,
      name: "Johny",
      rating: 2100,
      opponents: [4, 2, 5],
      results: ["W", "L", "L"],
      colors: [],
    }),
  );
  playerStandings = standings(players);
  correctOrder = [1, 2, 3, 5, 8, 6, 4, 7];
  expect(correctOrder.length).toBe(playerStandings.length);
  for (let i = 0; i < playerStandings.length; i++) {
    expect(playerStandings[i].id).toBe(correctOrder[i]);
  }
});
test("testing draw tiebreaks", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [3, 2],
      results: ["W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [4, 1],
      results: ["D", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [1, 4],
      results: ["L", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [2, 3],
      results: ["D", "L"],
      colors: [],
    }),
  );
  playerStandings = standings(players);
  correctOrder = [1, 3, 2, 4];
  expect(correctOrder.length).toBe(playerStandings.length);
  for (let i = 0; i < playerStandings.length; i++) {
    expect(correctOrder[i]).toBe(playerStandings[i].id);
  }
});
test("testing byes", () => {
  players = [];
  players.push(
    new Player({
      id: 1,
      name: "Peyton",
      rating: 2100,
      opponents: [3, 2],
      results: ["W", "W"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 2,
      name: "David",
      rating: 1700,
      opponents: [4, 1],
      results: ["W", "L"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 3,
      name: "Jeff",
      rating: 700,
      opponents: [2],
      results: ["L", "D"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 4,
      name: "Jim",
      rating: 2100,
      opponents: [3],
      results: ["L", "FB"],
      colors: [],
    }),
  );
  players.push(
    new Player({
      id: 5,
      name: "Geoff",
      rating: 2100,
      opponents: [2, 3],
      results: ["FB", "D"],
      colors: [],
    }),
  );
  playerStandings = standings(players);
  correctOrder = [1, 5, 2, 4, 3];
  expect(correctOrder.length).toBe(playerStandings.length);
  for (let i = 0; i < playerStandings.length; i++) {
    expect(correctOrder[i]).toBe(playerStandings[i].id);
  }
});
