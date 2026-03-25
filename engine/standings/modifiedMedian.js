//calculates the list of candidates that have the highest modified Median
//parameters: players - the total list of players
//            candidates - the subset of players that are currently tied
//returns: a list of candidates with the highest modified median
function modifiedMedian(players, candidates){
    let newCandidates = []
    let rounds = candidates.length === 0 ? 0 : candidates[0].results.length
    let topScore = 0
    for(let i = 0; i < candidates.length; i++){
        let opponents = candidates[i].opponents
        let score = candidates[i].score
        let opponentScore = []
        let currScore = 0
        for(let j = 0; j < opponents.length; j++){
            opponentScore.push(players.find((player) => player.id === opponents[j]).score)
        }
        opponentScore = opponentScore.sort((a, b) => (a - b))
        if(opponentScore.length >= 1 || (rounds/2 === score && opponentScore.length >= 2)){
            if(rounds/2 <= score){
                opponentScore = opponentScore.slice(1)
            }
            if(rounds/2 >= score){
                opponentScore = opponentScore.slice(0, opponentScore.length - 1)
            }
            for(let j = 0; j < opponentScore.length; j++){
                currScore += opponentScore[j]
            }
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
module.exports = modifiedMedian