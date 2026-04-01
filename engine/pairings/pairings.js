// const { error } = require("console")
const Player = require("../player")

// TODO: implement a way for pairings to be generated that accomadates requested byes

function generatePairings(pl){
    let pairings = []
    let players = [...pl]
    players.sort((a, b)=> {
        const aRating = a.rating === 'unr' ? 0 : Number(a.rating)
        const bRating = b.rating === 'unr' ? 0 : Number(b.rating)
        return b.score - a.score ||
        b.rating - a.rating ||
        b.id - a.id
    })
    let sections = []
    let currSection = []
    let currScore = -1
    for(const player of players){
        //only runs on first pass, setting up the max score
        if(currScore < player.score){
            currScore = player.score
        }
        if(currScore === player.score){
            currSection.push(player)
        }
        else if(currScore > player.score){
            currScore = player.score
            sections.push(structuredClone(currSection))
            currSection.length = 0
            currSection.push(player)
        }
    }
    sections.push(structuredClone(currSection))
    //assigns a bye if # of players is odd
    let bye = null
    let attemptedByes = []
    let sortedPairings = []
    while(true){
        let remainingPlayers = structuredClone(sections)
        if(attemptedByes.length === players.length){
            return []
        }
        if(players.length%2 === 1){
            bye = assignBye(players, attemptedByes)
            attemptedByes.push(bye)
            remainingPlayers.forEach((p, index) => remainingPlayers[index] = p.filter(pl => pl.id !== bye.id))
        }
        pairings = calculatePairings(remainingPlayers)
        const expectedPairings = Math.floor(players.length / 2)
        console.log(`[pairings] players=${players.length} expected=${expectedPairings} got=${pairings.length} bye=${bye?.id ?? null}`)
        if(pairings.length === expectedPairings){
            if(bye !== null){
                pairings.push([structuredClone(bye), null])
            }
            break
        }
        // Even player count: no bye to reassign, no valid pairings possible
        if(players.length % 2 === 0){
            console.log('[pairings] even player count, incomplete pairings, giving up')
            return []
        }
    }
    remainingPlayers = structuredClone(players)
    while(remainingPlayers.length > 0){
        const pairing = pairings.find(p => p.some(p1 => p1 && p1.id === remainingPlayers[0].id))
        if(!pairing){
            remainingPlayers = remainingPlayers.filter(p1 => p1.id !== remainingPlayers[0].id)
            continue
        }
        sortedPairings.push(structuredClone(pairing))
        sortedPairings.at(-1).forEach(p => { if(p) remainingPlayers = remainingPlayers.filter(p1 => p1.id !== p.id) })
    }
    return sortedPairings
}

function calculatePairings(sections){
    let pairings = []
    let floaters = []
    let floatee = null
    for(const section of sections){
        let unpairedSection = [...section]
        let cFloaters = [...floaters]
        for(let i = 0; i < cFloaters.length; i++){
            for(const player of unpairedSection){
                floatee = player
                //verify the two floaters can pair
                let floatPairing = [structuredClone(cFloaters[i]), structuredClone(floatee)]
                if(!validatePairing(floatPairing)){
                    continue
                }
                floatPairing = setColors([floatPairing], 0, true)[0]
                pairings.push(structuredClone(floatPairing))
                unpairedSection = unpairedSection.filter(p => p.id !== floatee.id)
                floaters = floaters.filter(f => f.id !== cFloaters[i].id)
                break
            }
        }
        if(unpairedSection.length % 2 === 1){
            //checks all possible selection of players as floaters
            //selects the lowest rated player that has the fewest number of unpairable players
            let attemptedPairs = []
            for(let player of unpairedSection){
                let testUnpaired = [...unpairedSection].filter(p => p.id !== player.id)
                let { currPairings: _,unpairablePlayers: remainingPlayers } = pairSection(testUnpaired)
                attemptedPairs.push([player, remainingPlayers.length])
            }
            attemptedPairs.sort((a, b) => a[1] - b[1] ||
                                a[0].rating - b[0].rating)
            floaters.push(structuredClone(attemptedPairs[0][0]))
            unpairedSection = unpairedSection.filter(p => p.id !== attemptedPairs[0][0].id)
        }
        if(unpairedSection.length === 0){
            continue
        }
        let { currPairings: sectionPairings, unpairablePlayers: remainingPlayers } = pairSection(unpairedSection)
        //noPrioColor represents the color assignment of the higher rated player when both players do not have a prefered color
        //mainly only necessary for the first round, but could come into play in future rounds if multiple players take half-point byes for the first round
        //should be randomly generated for the first unknown pairing, then flipped every time it is used
        let noPrioColor = Math.floor(Math.random()*2)
        sectionPairings = setColors(sectionPairings, noPrioColor)
        sectionPairings.forEach(p => pairings.push(structuredClone(p)))
        remainingPlayers.forEach(p => floaters.push(structuredClone(p)))
    }
    // Try to pair remaining floaters with each other first
    for(let i = 0; i < floaters.length - 1; i++){
        for(let j = i + 1; j < floaters.length; j++){
            if(validatePairing([floaters[i], floaters[j]])){
                const pair = setColors([structuredClone([floaters[i], floaters[j]])], 0, true)[0]
                pairings.push(pair)
                floaters.splice(j, 1)
                floaters.splice(i, 1)
                i--
                break
            }
        }
    }
    // For any still-unresolved floaters, try swapping one into an existing pairing
    // so the displaced player pairs with another floater
    for(let fi = 0; fi < floaters.length; fi++){
        for(let fj = fi + 1; fj < floaters.length; fj++){
            let resolved = false
            for(let p = 0; p < pairings.length && !resolved; p++){
                for(let slot = 0; slot <= 1 && !resolved; slot++){
                    const testPairing = structuredClone(pairings[p])
                    const displaced = structuredClone(testPairing[slot])
                    testPairing[slot] = structuredClone(floaters[fi])
                    const displacedPair = [displaced, structuredClone(floaters[fj])]
                    if(validatePairing(testPairing) && validatePairing(displacedPair)){
                        pairings[p] = setColors([testPairing], 0, true)[0]
                        pairings.push(setColors([displacedPair], 0, true)[0])
                        floaters.splice(fj, 1)
                        floaters.splice(fi, 1)
                        resolved = true
                        fi--
                    }
                }
            }
        }
    }
    return pairings
}

function assignBye(sections, attemptedByes){
    const rsection = [...sections].sort((a, b) => {
    const aRating = a.rating === 'unr' ? Infinity : Number(a.rating)
    const bRating = b.rating === 'unr' ? Infinity : Number(b.rating)
    return a.hadBye - b.hadBye ||
    a.prevFW - b.prevFW ||
    a.prevHB - b.prevHB ||
    a.score - b.score ||
    aRating - bRating 
    })
    for(const player of rsection){
        if(!attemptedByes.some(p => p.id === player.id)){
            return player
        }
    }
}

function pairSection(section){
    let unpairedSection = [...section]
    let unpairablePlayers = []
    let currPairings = []
    if(section.length%2 !== 0){
        return null
    }
    while(unpairedSection.length > 0){
        let pairingOccured = false
        let prePairing = [unpairedSection[0], unpairedSection[unpairedSection.length/2]]
        if(validatePairing(prePairing)){
            currPairings.push(structuredClone(prePairing))
            for(const player of prePairing){
                unpairedSection = unpairedSection.filter(p => p.id !== player.id)
            }
        }
        else{
            //disparity will be a list of the form [initialPlayer, [swappedPlayer, ratingDisparity]]
            let { p1DisparityList: p1Disparity, p2DisparityList: p2Disparity } = calculateDisparity(unpairedSection[0], unpairedSection[unpairedSection.length/2], section)
            let disparity = []
            p1Disparity.forEach(p => disparity.push([unpairedSection[0], p]))
            p2Disparity.forEach(p => disparity.push([unpairedSection[unpairedSection.length/2], p]))
            disparity.sort((a, b) => a[1][1] - b[1][1])
            for(const swap of disparity){
                let newPairing = []
                const index = prePairing.findIndex(p => p.id === swap[0].id)
                if(index !== -1){
                    newPairing = structuredClone(prePairing)
                    newPairing[index] = swap[1][0]
                    if(validatePairing(newPairing)){
                        const outerIndex = currPairings.findIndex(pairing => pairing.some(p => p.id === swap[1][0].id))
                        //if swapped player is already paired, verify the new pairing is valid
                        if(outerIndex !== -1){
                            const innerIndex = currPairings[outerIndex].findIndex(p => p.id === swap[1][0].id)
                            let existingPairing = structuredClone(currPairings[outerIndex])
                            existingPairing[innerIndex] = swap[1][0]
                            if(validatePairing(existingPairing)){
                                currPairings[outerIndex] = structuredClone(existingPairing)
                                currPairings.push(structuredClone(newPairing))
                                unpairedSection = unpairedSection.filter(p => p.id !== unpairedSection[0].id && p.id !== unpairedSection[unpairedSection.length/2].id)
                                pairingOccured = true
                                break
                            }
                            else{
                                continue
                            }
                        }else{
                            currPairings.push(newPairing)
                            newPairing.forEach(p => unpairedSection = unpairedSection.filter(player => player.id !== p.id))
                            pairingOccured = true
                            break
                        }
                    }else{
                        continue
                    }
                }else{
                    console.log("error: player was expected in pairing, but was not found")
                }
            }
            if(!pairingOccured){
                let unpairable = structuredClone([unpairedSection[0], unpairedSection[unpairedSection.length/2]])
                unpairable.forEach(p => unpairablePlayers.push(structuredClone(p)))
                unpairable.forEach(p => unpairedSection = unpairedSection.filter(player => p.id !== player.id))
            }
        }
    }
    return { currPairings, unpairablePlayers }
}
//attempts to repair to optimize color pairings, then selects the color for each player
//if isFloater is set to true, function will skip repairing
function setColors(pairs, noPrioColor, isFloater = false){
    let pairings = [...pairs]
    let section = []
    pairings.forEach(p => p.forEach(player => section.push(player)))
    let numExpectedWhite = 0
    let numExpectedBlack = 0
    if(!isFloater){
        for(let player of section){
            if(player.colors.filter(c => c !== 'X').length === 0){
                continue
            }
            if(colorBalance(player) !== 0){
                colorBalance(player) > 0 ? numExpectedWhite += 1 : numExpectedBlack += 1
            }else{
                player.colors.filter(c => c !== 'X').at(-1) === 'B' ? numExpectedWhite += 1 : numExpectedBlack += 1 
            }
        }
        for(let i = 0; i < pairings.length; i++){
            if(Math.sign(colorBalance(pairings[i][0])) * Math.sign(colorBalance(pairings[i][1])) === -1 || (Math.sign(colorBalance(pairings[i][0])) === 0 && 
            (Math.sign(colorBalance(pairings[i][1])) === 0 && pairings[i][0].colors.filter(c => c !== 'X') !== pairings[i][1].colors.filter(c => c !== 'X')))){
                continue
            }
            //this statement applies the lookahead method for USCF color swapping
            //if the number of players due white and the number of players due black are less
            //than or equal to half of the total number of players, any swap that improves the pairing is done
            //if more than half of the players are due white or black, only pairings where both players want the 
            //same due color, and the color is opposite the most common due color are considered for swaps
            if((numExpectedWhite <= pairings.length && numExpectedBlack <= pairings.length) 
                || ((numExpectedWhite > pairings.length && Math.sign(colorBalance(pairings[i][0])) === -1 && Math.sign(colorBalance(pairings[i][1])) === -1) 
                    || (numExpectedBlack > pairings.length && Math.sign(colorBalance(pairings[i][0])) === 1 && Math.sign(colorBalance(pairings[i][1])) === 1))){
                let {p1DisparityList, p2DisparityList} = calculateDisparity(pairings[i][0], pairings[i][1], section)
                let disparity = []
                p1DisparityList.forEach(p => disparity.push([pairings[i][0], p]))
                p2DisparityList.forEach(p => disparity.push([pairings[i][1], p]))
                if(Math.sign(colorBalance(pairings[i][0])) === 0 || Math.sign(colorBalance(pairings[i][1])) === 0){
                    disparity = disparity.filter(d => d[1][1] <= 80)
                }else if((Math.sign(colorBalance(pairings[i][0]))=== 1 && Math.sign(colorBalance(pairings[i][1])) === 1) || 
                        (Math.sign(colorBalance(pairings[i][1])) === -1 && Math.sign(colorBalance(pairings[i][0])) === -1)){
                        disparity = disparity.filter(d => d[1][1] <= 200)
                }
                    disparity.sort((a, b) => a[1][1] - b[1][1])
                for(let swap of disparity){
                    const index = pairings[i].findIndex(p => p.id === swap[0].id)
                    let testPairing = structuredClone(pairings[i])
                    testPairing[index] = swap[1][0]
                    if(balanceType(testPairing) < balanceType(pairings[i])){
                        const outerIndex = pairings.findIndex(pair => pair.some(p => p.id === swap[1][0].id))
                        let swappedPair = pairings[outerIndex]
                        const innerIndex = pairings[outerIndex].findIndex(p => p.id === swap[1][0].id)
                        let newSwappedPair = structuredClone(swappedPair)
                        newSwappedPair[innerIndex] = structuredClone(swap[0])
                        if(balanceType(swappedPair) >= balanceType(newSwappedPair)){
                            pairings[outerIndex] = newSwappedPair
                            pairings[i] = testPairing
                            break
                        }
                    }
                }
            }
        }
    }
    for(let i = 0; i < pairings.length; i++){
        let newPairing = []
        if(Math.abs(colorBalance(pairings[i][0])) !== Math.abs(colorBalance(pairings[i][1]))){
            let priorityPlayer = [...pairings[i]].sort((a, b) => Math.abs(colorBalance(a)) - Math.abs(colorBalance(b)))[1]
            let otherPlayer = [...pairings[i]].find(p => p.id !== priorityPlayer.id)
            newPairing = createPairing(priorityPlayer, otherPlayer)
            pairings[i] = structuredClone(newPairing)
            continue
        //in this case, both players get their due color, so it does not matter who the priority player is
        }else if(colorBalance(pairings[i][0]) !== colorBalance(pairings[i][1])){
            newPairing = createPairing(pairings[i][0], pairings[i][1])
            pairings[i] = structuredClone(newPairing)
            continue
        }else{
            let p1ColorFilter = pairings[i][0].colors.filter((p, index) => p !== pairings[i][1].colors[index])
            let p2ColorFilter = pairings[i][1].colors.filter((p, index) => p !== pairings[i][0].colors[index])
            if(p1ColorFilter.length > 0){
                if(p1ColorFilter[p1ColorFilter.length-1] === 'X'){
                    p2ColorFilter[p2ColorFilter.length-1] === 'W' ? newPairing = [structuredClone(pairings[i][0]), structuredClone(pairings[i][1])] : newPairing = [structuredClone(pairings[i][1]), structuredClone(pairings[i][0])]
                    pairings[i] = structuredClone(newPairing)
                    continue
                }else{
                    p1ColorFilter[p1ColorFilter.length-1] === 'B' ? newPairing = [structuredClone(pairings[i][0]), structuredClone(pairings[i][1])] : newPairing = [structuredClone(pairings[i][1]), structuredClone(pairings[i][0])]
                    pairings[i] = structuredClone(newPairing)
                    continue
                }
            //at this point, both players have the same color pairings
            }else{
                if(pairings[i][0].colors.filter(c => c !== 'X').length !== 0){
                    let priorityPlayer = [...pairings[i]].sort((a, b) => {
                        const aRating = a.rating === 'unr' ? 0 : a.rating
                        const bRating = b.rating === 'unr' ? 0 : b.rating
                        return a.score - b.score || aRating - bRating
                        })[1]
                    let otherPlayer = pairings[i].find(p => p.id !== priorityPlayer.id)
                    noPrioColor = 1 - noPrioColor;
                    newPairing = createPairing(priorityPlayer, otherPlayer, noPrioColor)
                    pairings[i] = structuredClone(newPairing)
                    continue
                } else {
        // ADD THIS BLOCK: Handle first round (no color history)
        let priorityPlayer = [...pairings[i]].sort((a, b) => {
            const aRating = a.rating === 'unr' ? 0 : a.rating
            const bRating = b.rating === 'unr' ? 0 : b.rating
            return a.score - b.score || aRating - bRating
            })[1]
        let otherPlayer = pairings[i].find(p => p.id !== priorityPlayer.id)
        newPairing = createPairing(priorityPlayer, otherPlayer, noPrioColor)
        noPrioColor = 1 - noPrioColor  // flip for next pairing
        pairings[i] = structuredClone(newPairing)
    }

            }
        }
    }  
    return pairings
}
// helper function for setColors, sets the pairings based on color priority
function createPairing(priorityPlayer, otherPlayer, noPrioColor = 0){
    let newPairing = []
    if(colorBalance(priorityPlayer) < 0){
        return [structuredClone(priorityPlayer), structuredClone(otherPlayer)]
    }else if (colorBalance(priorityPlayer) > 0){
        return [structuredClone(otherPlayer), structuredClone(priorityPlayer)]
    }else{
        if(priorityPlayer.colors.filter(c => c !== 'X').length > 0){
            return priorityPlayer.colors.filter(c => c !== 'X').at(-1) === 'W' 
            ? [structuredClone(otherPlayer), structuredClone(priorityPlayer)]
            : [structuredClone(priorityPlayer), structuredClone(otherPlayer)]
        }else{
            return noPrioColor === 0 
            ? [structuredClone(otherPlayer), structuredClone(priorityPlayer)] 
            : [structuredClone(priorityPlayer), structuredClone(otherPlayer)]
        }
    }
}
//disparity will be a list of the form [swappedPlayer, ratingDisparity]
//first returned list will correspond to the first player passed, the second returned list will
//correspond to the second player passed
function calculateDisparity(player1, player2, section){
    let filteredSection = section.filter(p => p.id !== player1.id && p.id !== player2.id)
    let p1DisparityList = []
    let p2DisparityList = []
    for(const player of filteredSection){
        p1DisparityList.push([player, Math.abs(player.rating - player1.rating)])
    }
    for(const player of filteredSection){
        p2DisparityList.push([player, Math.abs(player.rating - player2.rating)])
    }
    
    return { p1DisparityList, p2DisparityList }
}
//checks if a pairing is valid
//a pairing is considered valid if the two opponents have not played eachother before, and pairing them 
//would force one of the players to receive the same color more than twice 
function validatePairing(pairing){
    let p1 = pairing[0]
    let p2 = pairing[1]
    if(p2.opponents.some(o => o === p1.id) || p1.opponents.some(o => o === p2.id)){
        return false
    }
    if(((colorBalance(p1) > 0 && colorBalance(p2) > 0) || (colorBalance(p1) < 0 && colorBalance(p2) < 0)) && (Math.abs(colorBalance(p1)) >= 2 && Math.abs(colorBalance(p2)) >= 2)){
        return false
    }
    return true
}
//checks the balance type of a pairing, a higher number means a worse balance
//0 is a perfect color pairing where both players get their prefered colors
//1 is a pairing where one of the players has to break alternation to get their color
//2 is a pairing where one of the players has to break equalization to get their color
//3 is a pairing where one of the players has to reach a color balance > 2
function balanceType(pairing){
    if(Math.sign(colorBalance(pairing[0])) * Math.sign(colorBalance(pairing[1])) === -1 || (Math.sign(colorBalance(pairing[0])) === 0 && 
            (Math.sign(colorBalance(pairing[1])) === 0 && pairing[0].colors.filter(c => c !== 'X') !== pairing[1].colors.filter(c => c !== 'X')))){
                return 0
    }
    else if(Math.sign(colorBalance(pairing[0])) === 0 && Math.sign(colorBalance(pairing[1])) === 0){
                return 1
    }
    else if((Math.sign(colorBalance(pairing[0])) === 1 && Math.sign(colorBalance(pairing[1])) >= 1) || 
            Math.sign(colorBalance(pairing[1])) === 1 && Math.sign(colorBalance(pairing[0])) >= 1){
                return 2
    }else{
        return 3
    }
}

function colorBalance(player){
    return player.colors.filter(c => c === 'W').length -
    player.colors.filter(c => c === 'B').length
}
module.exports = generatePairings