const { platform } = require('node:os')
const Player = require('../player')
const generatePairings = require('./pairings')

test('round 1 pairings', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [],
        results: [],
        colors: []
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [],
        results: [],
        colors: []
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [],
        results: [],
        colors: []
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [],
        results: [],
        colors: []
    }
    ))
    // should return a list of tuples [whitePlayer, blackPlayer], first color is randomly determined
    pairings = generatePairings(players)
    expect(pairings.length).toBe(2)
    // because the first color is randomly selected, there are 2 valid pairings
    if(pairings[0][0].id === 1){
        correctPairings = []
        for(let i = 0; i < 2; i++){
            tuple = []
            tuple.push(players[i], players[i+2])
            correctPairings.push(structuredClone(tuple))
        }
        for(let i = 0; i < pairings.length; i++){
            expect(pairings[i]).toBe(correctPairings[i])
        }
    }else{
        correctPairings = []
        for(let i = 0; i < 2; i++){
            tuple = []
            tuple.push(players[i+2], players[i])
            correctPairings.push(structuredClone(tuple))
        }
        for(let i = 0; i < pairings.length; i++){
            expect(pairings[i]).toBe(correctPairings[i])
        }
    }
})
test('round 2 pairings', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [3],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [4],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [1],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [2],
        results: ['L'],
        colors: ['B']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    for(let i = 0; i < 2; i++){
        tuple = [players[i+1], players[i]]
        correctPairings.push(structuredClone(tuple))
    }
    expect(pairings.length).toBe(2)
    for(let i = 0; i < 2; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('downfloating', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [3],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [4],
        results: ['D'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [1],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [2],
        results: ['D'],
        colors: ['B']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    for(let i = 0; i < 3; i += 2){
        tuple = [players[i+1], players[i]]
        correctPairings.push(structuredClone(tuple))
    }
    expect(pairings.length).toBe(2)
    for(let i = 0; i < 2; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('byes', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [3],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [4],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [1],
        results: ['L'],
        colors: ['W']
    }
    ))
        players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1200,
        opponents: [4],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 1100,
        opponents: [],
        results: ['B'],
        colors: ['X']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    tuple = [players[1], players[0]]
    correctPairings.push(structuredClone(tuple))
    tuple = [players[4], players[2]]
    correctPairings.push(structuredClone(tuple))
    tuple = [players[3], null]
    correctPairings.push(structuredClone(tuple))
    expect(pairings.length).toBe(3)
    for(let i = 0; i < 3; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
//TODO: run below pairing on SwissSys to determine pairing priority (color vs rank))
//Ans: swapping would be based on the 200-point rule (for equalization of colors, a swap of 200 points can occur, for alternation, a swap of 80)
//in this case, the lower score group will swap to equalize color, while the upper score group will not, as it exceeds 200 points
test('complex pairing', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [5],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [6],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [7],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [8],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 900,
        opponents: [1],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 6,
        name: 'Liam',
        rating: 800,
        opponents: [2],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 7,
        name: 'Nathan',
        rating: 700,
        opponents: [3],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 8,
        name: 'Trey',
        rating: 600,
        opponents: [4],
        results: ['L'],
        colors: ['W']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    correctPairings.push([players[2], players[0]])
    correctPairings.push([players[3], players[1]])
    //Edit: David gets white against Jhin
    correctPairings.push([players[4], players[7]])
    correctPairings.push([players[6], players[5]])
    expect(correctPairings.length).toBe(4)
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('complex pairing pt. 2', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2100,
        opponents: [5,3],
        results: ['W', 'W'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1700,
        opponents: [6, 4],
        results: ['W', 'W'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [7, 1],
        results: ['W', 'L'],
        colors: ['W', 'W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [8, 2],
        results: ['W', 'L'],
        colors: ['B', 'B']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 900,
        opponents: [1, 8],
        results: ['L', 'W'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 6,
        name: 'Liam',
        rating: 800,
        opponents: [2, 7],
        results: ['L', 'W'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 7,
        name: 'Nathan',
        rating: 700,
        opponents: [3, 6],
        results: ['L', 'L'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 8,
        name: 'Trey',
        rating: 600,
        opponents: [4, 5],
        results: ['L', 'L'],
        colors: ['W', 'B']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    correctPairings.push([players[0], players[1]])
    correctPairings.push([players[4], players[2]])
    correctPairings.push([players[3], players[5]])
    correctPairings.push([players[7], players[6]])
    expect(pairings.length).toBe(4)
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('byes w/ unrated players', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2000,
        opponents: [],
        results: [],
        colors: []
    }))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1950,
        opponents: [],
        results: [],
        colors: []
    }))
    players.push(new Player({
        id: 3,
        name: 'Connor',
        rating: 1800,
        opponents: [],
        results: [],
        colors: []
    }))
    players.push(new Player({
        id: 4,
        name: 'Liam',
        rating: 1780,
        opponents: [],
        results: [],
        colors: []
    }))
    players.push(new Player({
        id: 5,
        name: 'Unrated Andy',
        rating: 'unr',
        opponents: [],
        results: [],
        colors: []
    }))
    pairings = generatePairings(players)
    expect(pairings.length).toBe(3)
    correctPairings = []
    if(pairings[0][0] === players[0]){
        correctPairings.push([players[0], players[2]])
        correctPairings.push(players[4], players[1])
        correctPairings.push([players[3], null])
    }else{
        correctPairings.push([players[2], players[0]])
        correctPairings.push([players[1], players[4]])
        correctPairings.push([players[3], null])
    }
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe[correctPairings[i]]
    }
})
test('downfloat with multiple scores', () => {
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 1900,
        opponents: [6,3],
        results: ['W', 'W'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 1600,
        opponents: [7, 4],
        results: ['W', 'D'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 1300,
        opponents: [8, 1],
        results: ['W', 'L'],
        colors: ['W', 'W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1000,
        opponents: [9, 2],
        results: ['W', 'D'],
        colors: ['B', 'B']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 900,
        opponents: [10, 8],
        results: ['W', 'W'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 6,
        name: 'Liam',
        rating: 800,
        opponents: [1, 9],
        results: ['L', 'W'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 7,
        name: 'Nathan',
        rating: 700,
        opponents: [2, 10],
        results: ['L', 'L'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 8,
        name: 'Trey',
        rating: 600,
        opponents: [3, 5],
        results: ['L', 'L'],
        colors: ['B', 'W']
    }
    ))
    players.push(new Player({
        id: 9,
        name: 'Nine',
        rating: 500,
        opponents: [4, 6],
        results: ['L', 'L'],
        colors: ['W', 'B']
    }
    ))
    players.push(new Player({
        id: 10,
        name: 'Ten',
        rating: 400,
        opponents: [5, 7],
        results: ['L', 'W'],
        colors: ['B', 'W']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    correctPairings.push([players[0], players[4]])
    correctPairings.push([players[1], players[2]])
    //Edit: line was incorrectly "players[3], players[6]"
    correctPairings.push([players[3], players[5]])
    correctPairings.push([players[7], players[9]])
    correctPairings.push([players[6], players[8]])
    expect(pairings.length).toBe(5)
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('16 player pairing pt. 1', () => {
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2500,
        opponents: [9],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 2350,
        opponents: [10],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 2100,
        opponents: [11],
        results: ['D'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1950,
        opponents: [12],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 1800,
        opponents: [13],
        results: ['D'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 6,
        name: 'Liam',
        rating: 1650,
        opponents: [14],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 7,
        name: 'Nathan',
        rating: 1500,
        opponents: [15],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 8,
        name: 'Trey',
        rating: 1350,
        opponents: [16],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 9,
        name: 'Peyton',
        rating: 1200,
        opponents: [1],
        results: ['L'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 10,
        name: 'David',
        rating: 1050,
        opponents: [2],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 11,
        name: 'Nick',
        rating: 900,
        opponents: [3],
        results: ['D'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 12,
        name: 'Jhin',
        rating: 750,
        opponents: [4],
        results: ['L'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 13,
        name: 'Connor',
        rating: 600,
        opponents: [5],
        results: ['D'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 14,
        name: 'Liam',
        rating: 450,
        opponents: [6],
        results: ['W'],
        colors: ['W']
    }
    ))
    players.push(new Player({
        id: 15,
        name: 'Nathan',
        rating: 300,
        opponents: [7],
        results: ['W'],
        colors: ['B']
    }
    ))
    players.push(new Player({
        id: 16,
        name: 'Trey',
        rating: 150,
        opponents: [8],
        results: ['W'],
        colors: ['W']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    correctPairings.push([players[14], players[0]])
    correctPairings.push([players[1], players[13]])
    //Edit: swapped below two lines
    correctPairings.push([players[3], players[15]])
    correctPairings.push([players[12], players[2]])
    correctPairings.push([players[10], players[4]])
    correctPairings.push([players[5], players[9]])
    correctPairings.push([players[8], players[6]])
    correctPairings.push([players[7], players[11]])
    expect(pairings.length).toBe(8)
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})
test('16 player pairing pt. 2', () =>{
    players = []
    players.push(new Player({
        id: 1,
        name: 'Peyton',
        rating: 2500,
        opponents: [9,15],
        results: ['W','W'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 2,
        name: 'David',
        rating: 2350,
        opponents: [10,14],
        results: ['W','W'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 3,
        name: 'Nick',
        rating: 2100,
        opponents: [11,13],
        results: ['D','W'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 4,
        name: 'Jhin',
        rating: 1950,
        opponents: [12,16],
        results: ['W','W'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 5,
        name: 'Connor',
        rating: 1800,
        opponents: [13,11],
        results: ['D','D'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 6,
        name: 'Liam',
        rating: 1650,
        opponents: [14,10],
        results: ['L','L'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 7,
        name: 'Nathan',
        rating: 1500,
        opponents: [15,9],
        results: ['L','W'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 8,
        name: 'Trey',
        rating: 1350,
        opponents: [16,12],
        results: ['L','D'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 9,
        name: 'Peyton',
        rating: 1200,
        opponents: [1,7],
        results: ['L','L'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 10,
        name: 'David',
        rating: 1050,
        opponents: [2,6],
        results: ['L','W'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 11,
        name: 'Nick',
        rating: 900,
        opponents: [3,5],
        results: ['D','D'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 12,
        name: 'Jhin',
        rating: 750,
        opponents: [4,8],
        results: ['L','D'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 13,
        name: 'Connor',
        rating: 600,
        opponents: [5,3],
        results: ['D','L'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 14,
        name: 'Liam',
        rating: 450,
        opponents: [6,2],
        results: ['W','L'],
        colors: ['W','B']
    }
    ))
    players.push(new Player({
        id: 15,
        name: 'Nathan',
        rating: 300,
        opponents: [7,1],
        results: ['W','L'],
        colors: ['B','W']
    }
    ))
    players.push(new Player({
        id: 16,
        name: 'Trey',
        rating: 150,
        opponents: [8,4],
        results: ['W','L'],
        colors: ['W','B']
    }
    ))
    pairings = generatePairings(players)
    correctPairings = []
    correctPairings.push([players[0], players[1]])
    correctPairings.push([players[2], players[3]])
    correctPairings.push([players[4], players[13]])
    correctPairings.push([players[8], players[5]])
    correctPairings.push([players[6], players[10]])
    correctPairings.push([players[7], players[14]])
    correctPairings.push([players[9], players[15]])
    correctPairings.push([players[11], players[12]])
    /* 
        Edit: pairings should be
        0,1
        2,3
        4,13
        10,5
        6,15
        7,14
        11,12
        9,8
    */
    expect(pairings.length).toBe(8)
    for(let i = 0; i < correctPairings.length; i++){
        expect(pairings[i]).toBe(correctPairings[i])
    }
})