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
        this.hadBye = this.hadBye()
        this.cumScore = this.computeCumScore()
    }

    computeScore(){
        sum = 0
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

    hadBye(){
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
        sum = 0
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

}

module.exports = Player