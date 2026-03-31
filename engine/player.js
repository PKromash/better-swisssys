//Player class used in engine for pairings/standings
//The results array should be populated with the following:
// W: Win, D: Draw, L: Loss, FW: Forefit Win, FD: Forefit Draw
// FL: Forefit Loss, HB: Half-Point Bye, FB: Full-Point Bye
// In the case that any game had a result that is not a win, loss, or draw, its equivalent
// color should be denoted as X
class Player {
    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.rating = data.rating
        this.opponents = data.opponents || []
        this.results = data.results || []
        this.colors = data.colors || []
        this.score = this.computeScore()
        this.hadBye = this.computeBye()
        this.cumScore = this.computeCumScore()
    }

    computeScore(){
        let sum = 0
        for(let i = 0; i < this.results.length; i++){
            if (["W", "FW", "FB"].includes(this.results[i])){
                sum += 1
            }
            else if(["D", "FD", "HB"].includes(this.results[i])){
                sum += 0.5
            }
        }
        return sum
    }

    computeBye(){
        for(let i = 0; i < this.results.length; i++){
            if(this.results[i] === "FB"){
                return 1
            }
        }
        return 0
    }

    get colorBalance() {
        return this.colors.filter(c => c === 'W').length -
               this.colors.filter(c => c === 'B').length
    }

    computeCumScore(){
        let sum = 0
        for(let i = 0; i < this.results.length; i++){
            if (["W", "FW", "FB"].includes(this.results[i])){
                sum += 1 * (this.results.length - i)
            }
            else if(["D", "FD", "HB"].includes(this.results[i])){
                sum += 0.5 * (this.results.length - i)
            }
        }
        return sum
    }
    // returns true if player has gotten a forefit win, returns false otherwise
    get prevFW(){
        for(let result of this.results){
            if (result === "FW"){
                return true
            }
        }
        return false
    }
    // returns true if player has taken a half point bye, returns false otherwise
    get prevHB(){
        for(let result of this.results){
            if (result === "HB"){
                return true
            }
        }
        return false
    }
}

module.exports = Player