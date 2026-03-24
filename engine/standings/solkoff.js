/*
    Implements the Solkoff tiebreak, where the opponent's scores are summed.
    takes in a list of all players, and a list of candidates, and returns 
    a list of candidates with the best solkoff score
*/
function solkoff(players, candidates){
    let newCandidates = []
    let topScore = 0
    for(let i = 0; i < candidates.length; i++){
        let opponents = candidates[i].opponents
        let opponentScore = []
        let currScore = 0
        for(let j = 0; j < opponents.length; j++){
            opponentScore.push(players.find((player) => player.id === opponents[j]).score)
        }
        opponentScore = opponentScore.sort((a, b) => (a - b))
            for(let j = 0; j < opponentScore.length; j++){
                currScore += opponentScore[j]
            }
        if(currScore > topScore){
            topScore = currScore
            newCandidates.length = 0
            newCandidates.push(candidates[i])
        }
        else if(currScore === topScore){
            newCandidates.push(candidates[i])
        }
    }
    return newCandidates
}
module.exports = solkoff