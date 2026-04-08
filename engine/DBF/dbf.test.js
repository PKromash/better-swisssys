const generateDBFFiles = require('./dbfFormat')
const fs = require('fs')

test('Simple DBF File', () =>{
    const THExpected = fs.readFileSync('engine/DBF/test1/THEXPORT.DBF')
    const TSExpected = fs.readFileSync('engine/DBF/test1/TSEXPORT.DBF')
    const TDExpected = fs.readFileSync('engine/DBF/test1/TDEXPORT.DBF')

    const tournament = {
        name: 'dbf_test',
        startDate: new Date(2026,2,30),
        endDate: new Date(2026,2,30),
        affiliateID: "G7647935",
        city: "Gainesville",
        state: "FL",
        country: "United States",
        zipCode: "32603",
        chiefTD: "15120906",
        assistantChiefTD: "30833045",
        tournamentDirectors: [],
        sections: [1],
        owner: []
    }
    const sections = [{
        name: "open",
        timeControl: "G/50 SD/30 inc/30",
        sectionChiefTD: "15120906",
        sectionAssistantChiefTD: "30833045",
        numberRounds: 1,
        beginningDate: new Date(2026,2,30),
        endDate: new Date(2026,2,30),
        sectionType: 2,
        grandPrixStatus: 'N',
        grandPrixPoints: 0,
        players: [{
            name: "Peyton",
            USCF_id: "12345",
            pairingNumber: 1,
            opponents: [2],
            results: ['W'],
            byes: [],
            colors: ['W'],
            rating: 2000
        }, {
            name: "David",
            USCF_id: "54321",
            pairingNumber: 2,
            opponents: [1],
            results: ['L'],
            byes: [],
            colors: ['B'],
            rating: 1999
        }],
        //I use sections.rounds.length to determine # of rounds
        rounds: [1],
    }]

    const { THExport, TSExport, TDExport } = generateDBFFiles(tournament, sections, true)
    expect(THExport).toEqual(THExpected)
    expect(TSExport).toEqual(TSExpected)
    expect(TDExport).toEqual(TDExpected)
})