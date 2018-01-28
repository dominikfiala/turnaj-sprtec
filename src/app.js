const blossom = require('edmonds-blossom')
const faker = require('faker')
faker.locale = 'cz'
var Excel = require('exceljs');
var fs = require('fs');

var env = typeof(process) !== 'undefined' ? 'electron' : 'browser'

if (env === 'electron') {
  var electron = require('electron')
  var shell = electron.shell
}

Vue.config.devtools = true

var dataInitial = {
  state: {
    activeRound: 0,
    activePlayer: -1,
    playersSearch: '',
    debug: false,
    generatingRound: false
  },
  config: {
    name: 'Turnaj ve šprtci',
    venue: 'Lumpenkavárna',
    host: 'Domo',
    category: -1,
    numberOfRounds: 5,
    date: new Date().toISOString().slice(0, 10),
    season: new Date().getFullYear(),
    categories: [
      {
        title: 'Expres',
        points: [40, 34, 29, 25, 22, 20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      {
        title: 'ČP12',
        points: [160, 145, 133, 123, 114, 106, 99, 93, 88, 83, 79, 75, 71, 67, 64, 61, 58, 55, 52, 49, 46, 43, 41, 39, 37, 35, 33, 31, 29, 27, 25, 23, 21, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      {
        title: 'ČP24',
        points: [200, 185, 173, 163, 154, 146, 139, 133, 128, 123, 119, 115, 111, 107, 104, 101, 98, 95, 92, 89, 86, 83, 81, 79, 77, 75, 73, 71, 69, 67, 65, 63, 61, 59, 57, 55, 53, 51, 49, 47, 45, 43, 41, 39, 37, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
      },
      {
        title: 'ČP36',
        points: [340, 325, 313, 303, 294, 286, 279, 273, 268, 263, 259, 256, 253, 250, 247, 244, 241, 238, 235, 232, 229, 227, 225, 223, 221, 219, 217, 215, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 191, 188, 186, 184, 182, 180, 178, 176, 174, 172, 170, 168, 166, 164, 162, 160, 158, 156, 154, 152, 150, 148, 146, 144, 142, 140, 138, 136, 134, 132, 130, 128, 126, 124, 122, 120, 118, 116, 114, 112, 110, 108, 106, 104, 102, 100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41]
      },
      {
        title: 'Czech Open',
        points: [340, 325, 313, 303, 294, 286, 279, 273, 268, 263, 259, 256, 253, 250, 247, 244, 241, 238, 235, 232, 229, 227, 225, 223, 221, 219, 217, 215, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 191, 188, 186, 184, 182, 180, 178, 176, 174, 172, 170, 168, 166, 164, 162, 160, 158, 156, 154, 152, 150, 148, 146, 144, 142, 140, 138, 136, 134, 132, 130, 128, 126, 124, 122, 120, 118, 116, 114, 112, 110, 108, 106, 104, 102, 100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41]
      }
    ],
    pointsWin: 3,
    pointsDraw: 1,
    goalsForSortMax: 5,
    byeGoalsFor: 5,
    clubs: [
      'BHC Dragons Modřice',
      'BHC StarColor Most',
      'BHK Orel Boskovice',
      'Doudeen Team',
      'Fluke Kohoutovice',
      'Future Úsov',
      'Gunners Břeclav',
      'Old Friends Stochov',
      'Prague NHL',
      'SHC Bizoni Uherčice',
      'SHL Brno',
      'SHL WIP Reklama D. Voda',
      'Sokol Stochov',
      'Šprtmejkři Ostrava',
      'THE Orel Bohunice',
    ],
    contests: ['Český pohár', 'Žákovská tour']
  },
  players: [],
  rounds: [],
  results: []
}

if (window.localStorage) {
  var store = window.localStorage

  if (store.getItem('data')) {
    data = Object.assign(dataInitial, JSON.parse(store.getItem('data')))
  }
  else {
    data = dataInitial
  }
}

var app = new Vue({
  el: '#app',
  data: data,
  methods: {
    editClub: function(clubIndex) {
      var clubName = event.target.value
      var oldName = this.config.clubs[clubIndex]

      if (clubName !== oldName) {
        this.config.clubs.splice(clubIndex, 1)
      }
    },
    addClub: function(event) {
      var clubName = event.target.value
      if (clubName) {
        this.config.clubs.push(clubName)
      }
      event.target.value = ''
    },

    resetTournament: function() {
      store.clear()
      location.reload()
    },
    saveTournament: function() {
      var blob = new Blob([JSON.stringify(this.$data)], {type: "application/json;charset=utf-8"})
      saveAs(blob, `${this.config.date} ${this.config.name}.json`)
      $('#exportTournamentModal').modal('hide')
    },
    loadTournamentFromFile: function() {
      $('#fileChooser').click()
    },
    tournamentFileLoaded: function(event) {
      var input = event.target
      var reader = new FileReader()
      reader.onload = () => {
        this.$data = Object.assign(dataInitial, JSON.parse(reader.result))
        $('#importTournamentModal').modal('hide')
      };
      reader.readAsText(input.files[0])
    },
    tournamentResults: function() {
      var results = this.players.map(function(player, playerIndex) {
        return {
          playerIndex: playerIndex,
          points: 0,
          matches: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          referee: 0,
          refereeWarning: false,
          goalsFor: 0,
          goalsForSort: 0,
          goalsAgainst: 0,
          byes: 0,
          opponents: [],
          opponentsPoints: 0,
          opponentsOpponentsPoints: 0,
          results: [],
          categoryWinner: false,
          sharedPosition: false
        }
      })

      // return results
      this.rounds.forEach((round, roundIndex) => {
        // bye match
        if (round.bye !== -1) {
          if (this.roundsStatus[roundIndex] === 'complete') {
            results[round.bye].matches++
            results[round.bye].wins++
            results[round.bye].points += this.config.pointsWin
            results[round.bye].byes++
            results[round.bye].goalsFor += this.config.byeGoalsFor
            results[round.bye].goalsForSort += this.config.goalsForSortMax === 0 ?
              this.config.byeGoalsFor :
              Math.min(this.config.goalsForSortMax, this.config.byeGoalsFor)
          }
          results[round.bye].results[roundIndex] = {
            opponent: -1
          }
        }

        if (round.refereeCheck[0] !== -1) {
          results[round.refereeCheck[0]].referee++
        }
        if (round.refereeCheck[1] !== -1) {
          results[round.refereeCheck[1]].referee++
        }

        // calculate stats
        round.matches.forEach((match, matchIndex) => {
          // sum points and score
          var homePlayer = results[match.home]
          var awayPlayer = results[match.away]

          // match not complete yet, just get next opponent
          if (match.home_score === '' || match.away_score === '') {
            homePlayer.results[roundIndex] = {
              opponent: match.away,
              result: '?'
            }
            awayPlayer.results[roundIndex] = {
              opponent: match.home,
              result: '?'
            }
            return
          }

          // sum referee
          if (match.referee !== -1) {
            results[match.referee].referee++
          }

          homePlayer.opponents.push(match.away)
          awayPlayer.opponents.push(match.home)
          homePlayer.goalsFor += match.home_score
          homePlayer.goalsForSort += this.config.goalsForSortMax === 0 ?
            match.home_score :
            Math.min(match.home_score, this.config.goalsForSortMax)
          awayPlayer.goalsFor += match.away_score
          awayPlayer.goalsForSort +=  this.config.goalsForSortMax === 0 ?
            match.away_score :
            Math.min(match.away_score, this.config.goalsForSortMax)
          homePlayer.goalsAgainst += match.away_score
          awayPlayer.goalsAgainst += match.home_score
          homePlayer.matches++
          awayPlayer.matches++
          homePlayer.results[roundIndex] = {
            opponent: match.away,
            result:
              (match.home_score > match.away_score) ? '+' :
              (match.home_score < match.away_score) ? '-' :
              '=',
            goalsFor: match.home_score,
            goalsAgainst: match.away_score
          }
          awayPlayer.results[roundIndex] = {
            opponent: match.home,
            result:
              (match.away_score > match.home_score) ? '+' :
              (match.away_score < match.home_score) ? '-' :
              '=',
            goalsFor: match.away_score,
            goalsAgainst: match.home_score
          }

          if (match.home_score > match.away_score) {
            homePlayer.points += this.config.pointsWin
            homePlayer.wins += 1
            awayPlayer.losses += 1
          }
          else if (match.home_score < match.away_score) {
            awayPlayer.points += this.config.pointsWin
            awayPlayer.wins += 1
            homePlayer.losses += 1
          }
          else {
            homePlayer.points += this.config.pointsDraw
            awayPlayer.points += this.config.pointsDraw
            homePlayer.ties += 1
            awayPlayer.ties += 1
          }
        })
      })

      // sum opponents points
      results.forEach(player => {
        player.opponentsPoints += results.reduce((accumulator, opponent) => {
          if (player.opponents.indexOf(opponent.playerIndex) !== -1) {
            accumulator += opponent.points

            // opponents points compensation for opponents that didnt play all the rounds
            if (opponent.matches < this.roundsComplete.length) {
              accumulator += (this.roundsComplete.length - opponent.matches) * this.config.pointsDraw
            }
          }

          return accumulator
        }, 0)
      })

      // sum opponents opponents points
      results.forEach(function(player) {
        player.opponents.forEach(function(opponentIndex) {
          var opponent = results.find(function(searchedPlayer) {
            return searchedPlayer.playerIndex === opponentIndex
          })
          player.opponentsOpponentsPoints += opponent.opponentsPoints
        })
      })

      // sort player stats
      results.sort(this.fieldSorter(['-points', '-opponentsPoints', '-goalsForSort', '-opponentsOpponentsPoints']))

      // check shared positions and referee warning
      var previousResult = null
      results.forEach((result, resultIndex) =>  {
        if (previousResult &&
          previousResult.points === result.points &&
          previousResult.oppontentsPoints === result.oppontentsPoints &&
          previousResult.opponentsOpponentsPoints === result.opponentsOpponentsPoints &&
          previousResult.goalsForSort === result.goalsForSort
        ) {
          result.sharedPosition = true
          previousResult.sharedPosition = true
        }
        previousResult = result

        if (result.referee < Math.floor(result.matches / 2)) {
          result.refereeWarning = true
        }
      })

      // mutual match of two players with same points amount
      // cancels the sharedPosition flag
      var pairs = this.groupBy(results, 'points').filter(item => item.length === 2)
      pairs.forEach(players => {
        let firstPlayer = players[0]
        let secondPlayer = players[1]
        let mutualMatch = firstPlayer.results.find(item => item.opponent === secondPlayer.playerIndex)

        if (mutualMatch) {
          let firstPlayerIndex = results.findIndex(item => item.playerIndex === firstPlayer.playerIndex)
          let secondPlayerIndex = results.findIndex(item => item.playerIndex === secondPlayer.playerIndex)

          // clone player object to get rid of the var reference
          if (mutualMatch.result === "-") {
            results[firstPlayerIndex] = Object.assign({}, secondPlayer)
            results[secondPlayerIndex] = Object.assign({}, firstPlayer)
          }

          results[firstPlayerIndex].sharedPosition = false
          results[secondPlayerIndex].sharedPosition = false
        }
      })

      var categoryWinner = []
      // check category winner and assign CP points
      results.forEach((result, resultIndex) =>  {
        // check category winner
        var category = this.playerCategories[result.playerIndex]
        if (!categoryWinner[category.shortcut]) {
          categoryWinner[category.shortcut] = true
          result.categoryWinner = true
        }

        // assign CP points
        if (this.config.category !== -1) {
          var categoryPoints = this.config.categories[this.config.category].points

          var playersCount = this.players.length
          var playersCountBase = categoryPoints.length
          var playersDiff = playersCount - playersCountBase

          var pointsBase = categoryPoints[resultIndex]
          // pokud umisteni neni v bodovaci tabulce, vezmu posledni bodovane misto
          // a odectu od nej body za kazdeho ucastnika navic
          if (!pointsBase) {
            pointsBase = categoryPoints[playersCountBase-1] - resultIndex + playersCount - playersDiff - 1
          }
          result.cpPoints = pointsBase + playersDiff
        }
      })

      this.results = results
    },
    resultsExportExcel: function() {
      var workbook = new Excel.Workbook()
      var worksheet = workbook.addWorksheet('Výsledky')
      worksheet.columns = [
        { header: '', key: 'position', width: 5 },
        { header: 'Hráč', key: 'name', width: 25 },
        { header: 'Klub', key: 'club', width: 25 },
        { header: 'K', key: 'category', width: 4 },
        { header: 'Z', key: 'matches', width: 3 },
        { header: 'V', key: 'wins', width: 3 },
        { header: 'R', key: 'ties', width: 3 },
        { header: 'P', key: 'losses', width: 3 },
        { header: 'B', key: 'points', width: 5 },
        { header: 'BS', key: 'opponentsPoints', width: 5 },
        { header: 'VB', key: 'goalsForSort', width: 5 },
        { header: 'BSS', key: 'opponentsOpponentsPoints', width: 5 },
        { header: 'BV', key: 'goalsFor', width: 5 },
        { header: '', key: 'goalsSeparator', width: 1 },
        { header: 'BO', key: 'goalsAgainst', width: 5 },
        { header: 'ČP', key: 'cpPoints', width: 5 },
        { header: 'R', key: 'referee', width: 3 },
      ]

      worksheet.getColumn('position').alignment = { horizontal: 'right' }
      worksheet.getColumn('category').alignment = { horizontal: 'center' }
      worksheet.getColumn('matches').alignment = { horizontal: 'center' }
      worksheet.getColumn('wins').alignment = { horizontal: 'center' }
      worksheet.getColumn('ties').alignment = { horizontal: 'center' }
      worksheet.getColumn('losses').alignment = { horizontal: 'center' }
      worksheet.getColumn('points').alignment = { horizontal: 'center' }
      worksheet.getColumn('goalsForSort').alignment = { horizontal: 'center' }
      worksheet.getColumn('opponentsPoints').alignment = { horizontal: 'center' }
      worksheet.getColumn('opponentsOpponentsPoints').alignment = { horizontal: 'center' }
      worksheet.getColumn('goalsFor').alignment = { horizontal: 'right' }
      worksheet.getColumn('goalsSeparator').alignment = { horizontal: 'center' }
      worksheet.getColumn('goalsAgainst').alignment = { horizontal: 'left' }
      worksheet.getColumn('cpPoints').alignment = { horizontal: 'center' }
      worksheet.getColumn('referee').alignment = { horizontal: 'center' }

      this.results.forEach((result, resultIndex) => {
        var row = {
          position: `${resultIndex + 1}.`,
          name: this.playerNames[result.playerIndex],
          club: this.config.clubs[this.players[result.playerIndex].club],
          category: this.playerCategories[result.playerIndex].shortcut,
          matches: result.matches,
          wins: result.wins,
          ties: result.ties,
          losses: result.losses,
          points: result.points,
          goalsForSort: result.goalsForSort,
          opponentsPoints: result.opponentsPoints,
          opponentsOpponentsPoints: result.opponentsOpponentsPoints,
          goalsFor: result.goalsFor,
          goalsSeparator: ':',
          goalsAgainst: result.goalsAgainst,
          cpPoints: result.cpPoints ? result.cpPoints : 0,
          referee: result.referee,
        }
        if (result.categoryWinner) {
          row.category += '!'
        }
        if (result.refereeWarning) {
          row.referee += '!'
        }
        worksheet.addRow(row)
      })

      worksheet.spliceRows(1, 0,
        [
          this.config.name.toUpperCase()
        ],[

        ],[
          'Místo konání: ', '',
          this.config.venue, '', '', '', '', '', '',
          'Datum: ', '',
          this.tournamentDate, '', '', '', ''
        ],[
          'Soutěž: ', '',
          this.config.contests.join(` ${this.config.season}, `) + ` ${this.config.season}`, '', '', '', '', '', '',
          'Disciplína: ', '',
          'Billiard-hockey šprtec', '', '', '', ''
        ],[
          'Pořadatel: ', '',
          this.config.host, '', '', '', '', '', '',
          'Kategorie: ', '',
          this.config.category === -1 ? 'Nezařazeno do ČP' : this.config.categories[this.config.category].title, '', '', '', ''
        ],[

        ]
      )

      worksheet.mergeCells('A1:Q1')
      worksheet.getCell('A1').font = { size: 18, bold: true, name: 'Arial' }

      worksheet.mergeCells('A3:B3')
      worksheet.mergeCells('C3:I3')
      worksheet.mergeCells('J3:K3')
      worksheet.mergeCells('L3:Q3')

      worksheet.mergeCells('A4:B4')
      worksheet.mergeCells('C4:I4')
      worksheet.mergeCells('J4:K4')
      worksheet.mergeCells('L4:Q4')

      worksheet.mergeCells('A5:B5')
      worksheet.mergeCells('C5:I5')
      worksheet.mergeCells('J5:K5')
      worksheet.mergeCells('L5:Q5')

      worksheet.getRow(1).alignment = { horizontal: 'center' }
      worksheet.getRow(2).height = 10
      worksheet.getCell('A3').alignment = { horizontal: 'right' }
      worksheet.getCell('C3').alignment = { horizontal: 'left' }
      worksheet.getCell('J3').alignment = { horizontal: 'right' }
      worksheet.getCell('L3').alignment = { horizontal: 'left' }
      worksheet.getCell('A4').alignment = { horizontal: 'right' }
      worksheet.getCell('C4').alignment = { horizontal: 'left' }
      worksheet.getCell('J4').alignment = { horizontal: 'right' }
      worksheet.getCell('L4').alignment = { horizontal: 'left' }
      worksheet.getCell('A5').alignment = { horizontal: 'right' }
      worksheet.getCell('C5').alignment = { horizontal: 'left' }
      worksheet.getCell('J5').alignment = { horizontal: 'right' }
      worksheet.getCell('L5').alignment = { horizontal: 'left' }
      worksheet.getRow(6).height = 10

      // rounds
      this.rounds.forEach((round, roundIndex) => {
        var worksheet = workbook.addWorksheet(`${roundIndex + 1}. kolo`)
        worksheet.columns = [
          { header: 'Domácí', key: 'home', width: 25 },
          { header: 'Host', key: 'away', width: 25 },
          { header: 'Výsledek', key: 'homeScore', width: 4 },
          { header: '', key: 'scoreDivider', width: 1 },
          { header: '', key: 'awayScore', width: 4 },
          { header: 'Rozhodčí', key: 'referee', width: 25 },
        ]

        worksheet.getColumn('homeScore').alignment = { horizontal: 'right' }
        worksheet.getColumn('scoreDivider').alignment = { horizontal: 'center' }
        worksheet.getColumn('awayScore').alignment = { horizontal: 'left' }

        round.matches.forEach((match, matchIndex) => {
          var row = {
            home: this.playerNames[match.home],
            away: this.playerNames[match.away],
            homeScore: match.home_score,
            scoreDivider: ':',
            awayScore: match.away_score,
            referee: this.playerNames[match.referee],
          }
          worksheet.addRow(row)
        })

        worksheet.mergeCells('C1:E1')
        worksheet.getCell('C1').alignment = { horizontal: 'center' }

        worksheet.addRow()
        if (round.bye !== -1) {
          worksheet.addRow({
            home: 'Volné kolo:',
            away: this.playerNames[round.bye],
          })
        }
        if (round.refereeCheck[0] !== -1) {
          worksheet.addRow({
            home: 'Zapisovatel rozhodčích:',
            away: this.playerNames[round.refereeCheck[0]],
          })
        }
        if (round.refereeCheck[1] !== -1) {
          worksheet.addRow({
            home: 'Zapisovatel rozhodčích:',
            away: this.playerNames[round.refereeCheck[1]],
          })
        }
      })


      // export to file and force download
      var filename = 'results.xlsx'
      workbook.xlsx.writeFile(filename).then(() => {
        // console.log('done')
        var blob = new Blob([fs.readFileSync(filename)], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
        saveAs(blob, `${this.config.date} ${this.config.name}.xlsx`)
      })
    },

    playersMutualMatch: function(a, b) {
      return this.rounds.some(function(round) {
        return round.matches.some(function(match) {
          return match.home === a && match.away === b || match.home === b && match.away === a
        })
      })
    },
    addPlayer: function() {
      var player = {
        surname: '',
        name: '',
        club: -1,
        sex: 'male',
        yearOfBirth: '',
        feePaid: false,
        rounds: [],
        byes: 0
      }
      for (var i = 0; i < this.config.numberOfRounds; i++) {
        if (!this.rounds[i]) {
          player.rounds.push(i)
        }
      }
      this.players.push(player)
      window.setTimeout(() => {
        document.querySelector('.players-list .players-list-item:last-child input:not([readonly])').focus()
      }, 100)
    },
    addRandomPlayer: function() {
      var sexIndex = faker.random.number({max: 1})
      var player = {
        byes: 0,
        sex: ['male', 'female'][sexIndex],
        name: faker.name.firstName(sexIndex),
        surname: faker.name.lastName(sexIndex),
        feePaid: false,
        club: faker.random.number({max: this.config.clubs.length - 1}),
        rounds: [],
        yearOfBirth: faker.random.number({min: 1985, max: new Date().getFullYear() - 10})
      }

      for (var i = 0; i < this.config.numberOfRounds; i++) {
        if (!this.rounds[i]) {
          player.rounds.push(i)
        }
      }

      this.players.push(player)
    },
    playerPlacementByIndex: function(playerIndex) {
      return this.results.findIndex(function(player) {
        return playerIndex === player.playerIndex
      }) + 1
    },
    removePlayer: function(playerIndex) {
      this.players.splice(playerIndex, 1)
    },
    playerSetActive(playerIndex) {
      if (this.state.activePlayer === playerIndex) {
        this.state.activePlayer = -1
      }
      else {
        this.state.activePlayer = playerIndex
      }
    },
    playerRoundsAll: function(playerIndex) {
      this.players[playerIndex].rounds = this.players[playerIndex].rounds === true ? [] : true
    },
    playerInSearch: function(playerIndex) {
      var query = this.state.playersSearch.trim()
      if (!query) return true
      var words = query.split(' ')
      var regex = new RegExp(words.join('|'), 'i')
      return regex.test(this.playerNames[playerIndex])
    },

    randomRoundResults: function(roundIndex) {
      this.rounds[roundIndex].refereeCheck[0] = this.randomIndex(this.players)
      this.rounds[roundIndex].refereeCheck[1] = this.randomIndex(this.players)
      this.rounds[roundIndex].matches.forEach(match => {
        match.home_score = this.randomIndex([...Array(9).keys()])
        match.away_score = this.randomIndex([...Array(9).keys()])
        match.referee = this.randomIndex(this.players)
      })
    },
    makePairing: function(roundIndex) {
      var round = {
        matches: [],
        bye: -1,
        refereeCheck: [-1, -1]
      }

      // clone results array and filter unavailable players
      var availablePlayers = this.results.slice().filter((player) => {
        return this.players[player.playerIndex].rounds.indexOf(roundIndex) !== -1
      })

      if (availablePlayers.length < 2) {
        alert('V kole není dostatek hráčů.')
        return
      }

      // assign a bye if round players count odd
      if (availablePlayers.length % 2 === 1) {
        // get bottom half of player results
        var byeCandidates = this.results.slice(Math.floor(availablePlayers.length / 2), availablePlayers.length)

        // look for possible players
        while (round.bye === -1) {
          // if bye not available for player from bottom line
          if (byeCandidates.length === 0) {
            byeCandidates = availablePlayers.slice()
          }

          var byeCandidateIndex = this.randomIndex(byeCandidates)
          var byeCandidate = byeCandidates.splice(byeCandidateIndex, 1)[0]

          // assign a bye round
          if (byeCandidate.byes === 0) {
            round.bye = byeCandidate.playerIndex
            // and remove from round available players
            availablePlayers.splice(availablePlayers.findIndex(function(player) {
              return player.playerIndex === byeCandidate.playerIndex
            }), 1)
          }
        }
      }

      var maxDiff = this.players.length

      var possiblePairs = []
      availablePlayers.forEach(player => {
        availablePlayers.forEach(opponent => {
          if (
            player.playerIndex !== opponent.playerIndex // &&
            // player.opponents.indexOf(opponent.playerIndex) === -1
          ) {
            var match = [player.playerIndex, opponent.playerIndex]
            match.sort(function(a, b) {
              return a - b;
            })
            if (player.opponents.indexOf(opponent.playerIndex) === -1) {
              if (roundIndex === 0) {
                match.push(faker.random.number({max: maxDiff}))
              }
              else {
                match.push(maxDiff - Math.abs(this.playerPlacementByIndex(player.playerIndex) - this.playerPlacementByIndex(opponent.playerIndex)))
              }
            }
            else {
              match.push(0)
            }
            if (this.searchForArray(possiblePairs, match) === -1) {
              possiblePairs.push(match)
            }
          }
        })
      })

      possiblePairs = this.shuffle(possiblePairs)

      var rawPairing = blossom(possiblePairs)
      rawPairing.forEach((home, away) => {
        if (home !== -1 && home < away) {
          var match = {
            home_score: '',
            away_score: '',
            referee: -1
          }
          var homePosition = this.playerPlacementByIndex(home)
          var awayPosition = this.playerPlacementByIndex(away)

          if (homePosition < awayPosition) {
            match.home = home
            match.away = away
            match.matchPosition = homePosition
          }
          else {
            match.home = away
            match.away = home
            match.matchPosition = awayPosition
          }

          round.matches.push(match)
        }
      })

      round.matches.sort(this.fieldSorter(['matchPosition']))

      this.$set(this.rounds, roundIndex, round)
    },
    generateRound: function(roundIndex) {
      this.tournamentResults()
      this.makePairing(roundIndex)
      this.state.generatingRound = false
    },
    isRoundReady: function(roundIndex) {
      return roundIndex === 0 || (roundIndex > 0 && this.isRoundComplete(roundIndex - 1))
    },
    isRoundGenerated: function(roundIndex) {
      return this.rounds[roundIndex] && this.rounds[roundIndex].matches
    },
    isRoundComplete: function(roundIndex) {
      if (!this.isRoundGenerated(roundIndex)) { return false }
      var round = this.rounds[roundIndex]
      return round.matches.filter(function(match) {
        return match.home_score === '' || match.away_score === ''
      }).length === 0
    },
    isRoundStarted: function(roundIndex) {
      if (!this.isRoundGenerated(roundIndex)) { return false }
      var round = this.rounds[roundIndex]
      return round.matches.filter(function(match) {
        return match.home_score === '' || match.away_score === ''
      }).length !== round.matches.length
    },
    getRoundStatus: function(roundIndex) {
      if (!this.rounds[roundIndex]) {
        return 'none'
      }

      var round = this.rounds[roundIndex]
      var incompleteMatches = round.matches.filter(function(match) {
        return match.home_score === '' || match.away_score === ''
      }).length

      if (incompleteMatches === 0) {
        return 'complete'
      }
      else if (incompleteMatches === round.matches.length) {
        return 'empty'
      }
      else {
        return 'incomplete'
      }
    },
    dropRoundPairing: function(roundIndex) {
      this.rounds = this.rounds.slice(0, roundIndex)
      $('#dropPairingModal').modal('hide')
    },
    addRound: function() {
      this.config.numberOfRounds++
      this.players.forEach(player => {
        player.rounds.push(this.config.numberOfRounds - 1)
      })
    },
    removeRound: function() {
      this.config.numberOfRounds--
      this.players.forEach(player => {
        player.rounds.pop()
      })
    },

    fieldSorter: function(fields) {
      return function (a, b) {
        return fields.map(function (o) {
            var dir = 1;
            if (o[0] === '-') {
               dir = -1;
               o=o.substring(1);
            }
            if (a[o] > b[o]) return dir;
            if (a[o] < b[o]) return -(dir);
            return 0;
        }).reduce(function firstNonZeroValue (p,n) {
            return p ? p : n;
        }, 0);
      };
    },
    randomIndex: function(array) {
      return Math.floor(Math.random()*array.length)
    },
    searchForArray: function(haystack, needle) {
      var i, j, current;
      for (i = 0; i < haystack.length; ++i) {
        if (needle.length === haystack[i].length) {
          current = haystack[i];
          for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
          if (j === needle.length)
            return i;
        }
      }
      return -1;
    },
    shuffle: function(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    groupBy: function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, []);
    },

    print: function() {
      window.print()
    }
  },
  computed: {
    isTournamentReady: function() {
      return this.playersComplete && this.configComplete
    },
    isTournamentComplete: function() {
      return this.roundsStatus.filter((roundStatus) => {
        return roundStatus !== 'complete'
      }).length === 0
    },
    configComplete: function() {
      return this.config.name !== '' &&
        this.config.numberOfRounds > 0 &&
        this.config.venue !== '' &&
        this.config.host !== '' &&
        this.config.category !== '' &&
        this.tournamentDateValid
    },
    playersComplete: function() {
      return this.players.filter(function(player){
        return !player.name || !player.surname
      }).length === 0 && this.players.length > 0
    },

    playerNames: function() {
      return this.players.map(function(player) {
        return `${player.surname.toUpperCase()} ${player.name}`
      })
    },
    playersSorted: function() {
      return this.players.map((item, index) => {
        return {
          name: this.playerNames[index],
          playerIndex: index
        }
      }).sort(function(a, b) {
        return a.name.localeCompare(b.name)
      })
    },
    playerCategories: function() {
      var season = this.config.season
      return this.players.map(function(player) {
        var age = season - player.yearOfBirth

        if (age <= 12) {
          return {
            'shortcut': 'P',
            'name': 'Ml. žáci'
          }
        }
        else if (player.sex == 'female') {
          return {
            'shortcut': 'L',
            'name': 'Ženy'
          }
        }
        else if (age <= 15) {
          return {
            'shortcut': 'Z',
            'name': 'St. žáci'
          }
        }
        else if (age <= 18) {
          return {
            'shortcut': 'J',
            'name': 'Junioři'
          }
        }
        else if (player.yearOfBirth && age > 18) {
          return {
            'shortcut': 'M',
            'name': 'Muži'
          }
        }
        else {
          return {
            'shortcut': 'M?',
            'name': 'Muži?'
          }
        }
      })
    },

    clubsSorted: function() {
      return this.config.clubs.map((item, index) => {
        return {
          name: item,
          clubIndex: index
        }
      }).sort(function(a, b) {
        return a.name.localeCompare(b.name)
      })
    },

    tournamentDate: function() {
      return new Date(this.config.date).toLocaleDateString('cs-CZ');
    },
    tournamentDateValid: function() {
      return /^(\d{4})-(\d{2})-(\d{2})$/.test(this.config.date)
    },

    roundsStatus: function() {
      return [...Array(this.config.numberOfRounds).keys()].map(this.getRoundStatus)
    },
    roundsComplete: function() {
      return this.roundsStatus.filter(round => {
        return round === 'complete'
      }).length
    },
    roundsPerPlayers: function() {
      if (this.players.length > 64) return 7
      else if (this.players.length > 32) return 6
      else return 5
    }
  },
  mounted: function() {
    if (env === 'electron') {
      $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault()
        shell.openExternal(this.href)
      })
    }
  },
  watch: {
    // autosave application state
    '$data': {
      handler: function (dataToStore) {
        if (store) {
          store.setItem('data', JSON.stringify(dataToStore))
        }
      },
      deep: true
    }
  }
})
