function scoreTiebreak(players){
    candidates = []
    score = 0
    for(let i = 0; i < players.length; i++){
        if(players[i].score > score){
            candidates.length = 0
            candidates.push(players[i])
            score = players[i].score
        }
        else if(players[i].score === score){
            candidates.push(players[i])
        }
    }
    return candidates;
}
module.exports = scoreTiebreak