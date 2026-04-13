const PAD = {
  NULL: 0x00,
  SPACE: 0x20,
  DELETED: 0x2a,
  HEADER: 0x0d,
  EOF: 0x1a,
};

const RES = {
  W: "W",
  L: "L",
  D: "D",
  FW: "",
  FD: "Z",
  FL: "F",
  FB: "B",
  HB: "H",
  NP: "U",
};

class DBFField {
  constructor(name, type, length) {
    this.name = name;
    this.type = type;
    this.length = length;
  }
  encodeValue(value, size) {
    let buf = Buffer.alloc(size, PAD.NULL);
    if (typeof value === "number") {
      buf.writeUInt8(value, 0);
    } else {
      buf.write(value, 0, "utf8");
    }
    return buf;
  }
  toBuffer() {
    let buf = Buffer.concat([
      this.encodeValue(this.name, 11),
      this.encodeValue(this.type, 1),
      Buffer.alloc(4, PAD.NULL),
      this.encodeValue(this.length, 1),
      Buffer.alloc(15, PAD.NULL),
    ]);
    return buf;
  }
}
class DBF {
  constructor() {
    this.fields = [];
    this.records = [];
    this.lastUpdated = new Date();
  }
  addField(name, type, length) {
    this.fields.push(new DBFField(name, type, length));
    return this;
  }
  addRecord(data) {
    this.records.push(data);
    return this;
  }
  toBuffer() {
    return Buffer.concat([
      this.#buildFileHeader(),
      ...this.fields.map((f) => f.toBuffer()),
      Buffer.from([PAD.HEADER]),
      ...this.records.map((r) => this.#buildRecord(r)),
      Buffer.from([PAD.EOF]),
    ]);
  }
  #buildFileHeader() {
    let recordCountbuf = Buffer.alloc(4, PAD.NULL);
    let headerSizebuf = Buffer.alloc(2, PAD.NULL);
    let recordSizebuf = Buffer.alloc(2, PAD.NULL);
    recordCountbuf.writeUInt32LE(this.records.length);
    headerSizebuf.writeUInt16LE(this.fields.length * 32 + 33);
    //initialized as 1 to account for the isActive byte for each record
    let recordLength = 1;
    //finds the length of each record by tallying the length value of each field
    this.fields.forEach((f) => (recordLength += f.length));
    recordSizebuf.writeUInt16LE(recordLength);
    return Buffer.concat([
      Buffer.alloc(1, 0x03),
      Buffer.from([this.lastUpdated.getFullYear() - 1900]),
      Buffer.from([this.lastUpdated.getMonth() + 1]),
      Buffer.from([this.lastUpdated.getDate()]),
      recordCountbuf,
      headerSizebuf,
      recordSizebuf,
      Buffer.alloc(20, PAD.NULL),
    ]);
  }
  #buildRecord(r) {
    //all records start with a 0x20 or 0x2A depending on if the record is active
    let buf = Buffer.alloc(1, PAD.SPACE);
    for (let i = 0; i < this.fields.length; i++) {
      let tempbuf = Buffer.alloc(this.fields[i].length, PAD.SPACE);
      if (r[i] !== undefined) {
        tempbuf.write(String(r[i]), 0, "utf8");
      }
      buf = Buffer.concat([buf, tempbuf]);
    }
    return buf;
  }
}

class THDBF extends DBF {
  constructor(tournament, isTest = false) {
    super();
    //this is for testing purposes, sets the last updated field to be
    //equal to the test file's last updated date instead of the current date
    if (isTest) {
      this.lastUpdated = new Date(2026, 3, 1);
    }
    this.#defineFields();
    this.#addRecord(tournament);
  }
  #defineFields() {
    this.addField("H_FORMAT", "C", 5);
    this.addField("H_PROGRAM", "C", 10);
    this.addField("H_EVENT_ID", "C", 12);
    this.addField("H_NAME", "C", 35);
    this.addField("H_TOT_SECT", "C", 2);
    this.addField("H_BEG_DATE", "C", 8);
    this.addField("H_END_DATE", "C", 8);
    this.addField("H_AFF_ID", "C", 8);
    this.addField("H_CITY", "C", 21);
    this.addField("H_STATE", "C", 2);
    this.addField("H_ZIPCODE", "C", 10);
    this.addField("H_COUNTRY", "C", 21);
    this.addField("H_SENDCROS", "C", 1);
    this.addField("H_CTD_ID", "C", 8);
    this.addField("H_ATD_ID", "C", 8);
    this.addField("H_OTHER_TD", "C", 254);
  }
  #addRecord(tournament) {
    let record = [];
    record.push("2C");
    record.push("SENIORPROJ");
    record.push(undefined);
    record.push(tournament.name);
    record.push(tournament.sections.length);
    record.push(
      String(
        tournament.startDate.getFullYear() +
          String(tournament.startDate.getMonth() + 1).padStart(2, "0") +
          String(tournament.startDate.getDate()).padStart(2, "0"),
      ),
    );
    record.push(
      String(
        tournament.endDate.getFullYear() +
          String(tournament.endDate.getMonth() + 1).padStart(2, "0") +
          String(tournament.endDate.getDate()).padStart(2, "0"),
      ),
    );
    record.push(tournament.affiliateID);
    record.push(tournament.city);
    record.push(tournament.state);
    record.push(tournament.zipCode);
    record.push(tournament.country);
    record.push("N");
    record.push(tournament.chiefTD);
    record.push(tournament.assistantChiefTD);
    record.push(
      tournament.tournamentDirectors.map((td) => td.USCF_id).join(","),
    );
    this.records.push(record);
  }
}

class TSDBF extends DBF {
  constructor(sections, isTest = false) {
    super();
    //this is for testing purposes, sets the last updated field to be
    //equal to the test file's last updated date instead of the current date
    if (isTest) {
      this.lastUpdated = new Date(2026, 3, 1);
    }
    this.#defineFields();
    this.#addRecord(sections, isTest);
  }
  #defineFields() {
    this.addField("S_EVENT_ID", "C", 12);
    this.addField("S_SEC_NUM", "C", 2);
    this.addField("S_SEC_NAME", "C", 30);
    this.addField("S_R_SYSTEM", "C", 1);
    this.addField("S_TIMECTL", "C", 40);
    this.addField("S_CTD_ID", "C", 8);
    this.addField("S_ATD_ID", "C", 8);
    this.addField("S_TRN_TYPE", "C", 1);
    this.addField("S_TOT_RNDS", "C", 2);
    this.addField("S_LST_PAIR", "C", 4);
    this.addField("S_BEG_DATE", "C", 8);
    this.addField("S_END_DATE", "C", 8);
    this.addField("S_SCH_LVL", "C", 1);
    this.addField("S_GR_PRIX", "C", 1);
    this.addField("S_GP_PTS", "C", 3);
    this.addField("S_FIDE", "C", 1);
  }
  #addRecord(sections, isTest) {
    //pattern obtains the matching of all digits after a forward slash, then sums them to get
    //the total playing time for the section
    let pattern = /(?<=\/)(\d+)/;
    for (let i = 0; i < sections.length; i++) {
      let totalTime = 0;
      //timeRating is the ratable time control of the event
      //R: greater than 65 minutes
      //D: between 30 and 65 minutes
      //Q: between 10 and 30 minutes
      //B: under 10 minutes
      let timeRating;
      let result = sections[i].timeControl
        ? sections[i].timeControl.match(pattern)
        : null;
      if (result) {
        for (let num of result) {
          totalTime += Number(num);
        }
      }
      if (totalTime > 65) {
        timeRating = "R";
      } else if (totalTime >= 30) {
        timeRating = "D";
      } else if (totalTime >= 10) {
        timeRating = "Q";
      } else if (totalTime >= 5) {
        timeRating = "B";
      }
      let record = [];
      record.push(undefined);
      record.push(i + 1);
      record.push(sections[i].name);
      record.push(timeRating);
      if (!isTest) {
        record.push(sections[i].timeControl);
      } else {
        record.push(undefined);
      }
      record.push(sections[i].sectionChiefTD);
      record.push(sections[i].sectionAssistantChiefTD);
      record.push("S");
      record.push(sections[i].numberRounds);
      record.push(sections[i].players.length);
      record.push(
        String(
          sections[i].beginningDate.getFullYear() +
            String(sections[i].beginningDate.getMonth() + 1).padStart(2, "0") +
            String(sections[i].beginningDate.getDate()).padStart(2, "0"),
        ),
      );
      record.push(
        String(
          sections[i].endDate.getFullYear() +
            String(sections[i].endDate.getMonth() + 1).padStart(2, "0") +
            String(sections[i].endDate.getDate()).padStart(2, "0"),
        ),
      );
      //maps current set sectionType to sectionType expected by USCF
      let sectionType = ["N", "S", undefined, undefined];
      record.push(sectionType[sections[i].sectionType]);
      record.push(sections[i].grandPrixStatus);
      record.push(
        sections[i].grandPrixStatus === "N"
          ? undefined
          : sections[i].grandPrixPoints,
      );
      record.push("N");
      this.records.push(record);
    }
  }
}

class TDDBF extends DBF {
  constructor(sections, isTest = false) {
    super();
    //this is for testing purposes, sets the last updated field to be
    //equal to the test file's last updated date instead of the current date
    if (isTest) {
      this.lastUpdated = new Date(2026, 3, 1);
    }
    this.#defineFields(sections);
    this.#addRecord(sections);
  }
  #defineFields(sections) {
    this.addField("D_EVENT_ID", "C", 12);
    this.addField("D_SEC_NUM", "C", 2);
    this.addField("D_PAIR_NUM", "C", 4);
    this.addField("D_MEM_ID", "C", 8);
    this.addField("D_NAME", "C", 30);
    this.addField("D_STATE", "C", 2);
    this.addField("D_RATING", "C", 4);
    for (let i = 0; i < sections[0].numberRounds; i++) {
      this.addField(`D_RND${String(i + 1).padStart(2, 0)}`, "C", 7);
    }
  }
  #addRecord(sections) {
    let players = [];
    for (let section of sections) {
      section.players.forEach((p) => players.push(p));
    }
    for (let player of players) {
      let section = undefined;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].players.some((p) => p.USCF_id === player.USCF_id)) {
          section = i + 1;
          break;
        }
      }
      let record = [];
      record.push(undefined);
      record.push(section);
      record.push(player.pairingNumber);
      record.push(player.USCF_id);
      record.push(player.name);
      record.push(player.state);
      record.push(player.rating !== 'unr' ? player.rating : 0);
      let iter = 0;
      for (let i = 0; i < sections[section - 1].rounds.length; i++) {
        if (
          player.byes.length !== 0 &&
          player.byes.some((b) => b.round === i + 1)
        ) {
          let res = "";
          switch (player.byes.find((b) => b.round === i + 1).points) {
            case 1:
              res = "FB";
              break;
            case 0.5:
              res = "HB";
              break;
            default:
              res = "NB";
          }
          record.push(res);
          continue;
        } else {
          let res = "";
          //the results and opponents fields do not contain bye information, so they
          //must use a different iterator, while color does contain bye information
          res += RES[player.results[iter]];
          res += String(player.opponents[iter]);
          res += player.colors[i];
          record.push(res);
          iter++;
        }
      }
      this.records.push(record);
    }
  }
}

//generates the dbf files for the given tournament and sections
//takes in a tournament object, and a list of section objects
//returns 3 buffers corresponding to each file's expected export
function generateDBFFiles(tournament, sections, isTest = false) {
  const THExport = new THDBF(tournament, isTest).toBuffer();
  const TSExport = new TSDBF(sections, isTest).toBuffer();
  const TDExport = new TDDBF(sections, isTest).toBuffer();
  return {THExport, TSExport, TDExport};
}

module.exports = generateDBFFiles;
