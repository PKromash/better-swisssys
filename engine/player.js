//Player class used in engine for pairings/standings
//The results array should be populated with the following:
// W: Win, D: Draw, L: Loss, FW: Forefit Win, FD: Forefit Draw
// FL: Forefit Loss, HB: Half-Point Bye, FB: Full-Point Bye

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

}

module.exports = Player