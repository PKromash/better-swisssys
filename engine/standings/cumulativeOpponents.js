/*
    Implements the cumulative opposition scoring tiebreak, where opponents cumulative scores are summed
    takes in a list of all players, and a list of current candidates for the next standing, 
    and returns a list of candidates with the beset cumulative score.
*/
function cumulativeOpponents(players, candidates){
    let newCandidates = []
    let maxCumScore = 0
    for(let i = 0; i < candidates.length; i++){
        let currCumScore = 0
        for(let j = 0; j < candidates[i].opponents.length; j++){
            currCumScore += players.find(player => player.id === candidates[i].opponents[j]).cumScore
        }
        if(currCumScore > maxCumScore){
            maxCumScore = currCumScore
            newCandidates.length = 0
            newCandidates.push(candidates[i])
        }
        else if(currCumScore === maxCumScore){
            newCandidates.push(candidates[i])
        }
    }
    return newCandidates
}
module.exports = cumulativeOpponents