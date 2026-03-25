/*
    Implements the cumulative scoring tiebreak, where earlier wins are weighted more
    takes in a list of all players, and a list of current candidates for the next standing, 
    and returns a list of candidates with the beset cumulative score.
*/
function cumulative(players, candidates){
    let newCandidates = []
    let maxCumScore = 0
    for(let i = 0; i < candidates.length; i++){
        let currCumScore = candidates[i].cumScore
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
module.exports = cumulative