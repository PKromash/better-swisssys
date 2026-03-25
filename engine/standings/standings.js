const scoreTiebreak = require('./scoreTiebreak')
const modifiedMedian = require('./modifiedMedian')
const solkoff = require('./solkoff')
const cumulative = require('./cumulative')
const cumulativeOpponents = require('./cumulativeOpponents')
/*
    this function calculates the standings of the current round. It takes in a list of player objects,
    and returns a list of standings, which contain all of the player objects ordered by current standing
    this function follows the USCF recommended order for tiebreaks, which include the following:
    1. Score
    2. Modified Median
    3. Solkoff
    4. Cumulative Score
    5. Cumulative Score of Opposition
*/
function calculateStandings(players) {
    let standings = []
    let playersLeft = [...players]
    let currCandidates = []
    for(let i = 0; i < players.length; i++){
        currCandidates = scoreTiebreak(playersLeft)
        if(currCandidates.length === 1){
            standings.push(currCandidates[0])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[0].id), 1)
            continue
        }
        currCandidates = modifiedMedian(players, currCandidates)
        if(currCandidates.length === 1){
            standings.push(currCandidates[0])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[0].id), 1)
            continue
        }
        currCandidates = solkoff(players, currCandidates)
        if(currCandidates.length === 1){
            standings.push(currCandidates[0])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[0].id), 1)
            continue
        }
        currCandidates = cumulative(players, currCandidates)
        if(currCandidates.length === 1){
            standings.push(currCandidates[0])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[0].id), 1)
            continue
        }
        currCandidates = cumulativeOpponents(players, currCandidates)
        if(currCandidates.length === 1){
            standings.push(currCandidates[0])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[0].id), 1)
            continue
        }
        console.log('you shouldnt see this')
        for(let i = 0; i < currCandidates.length; i++){
            standings.push(currCandidates[i])
            playersLeft.splice(playersLeft.findIndex(p => p.id === currCandidates[i].id), 1)
        }
    }
    return standings;
}
module.exports = calculateStandings;