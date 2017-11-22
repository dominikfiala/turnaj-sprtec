Vue.config.devtools = true

var dataInitial = {
  state: {
    activeTab: 'config',
    activeRound: 0,
    activePlayer: -1,
    playersSearch: ''
  },
  config: {
    name: 'Turnaj ve šprtci',
    venue: 'Lumpenkavárna',
    host: 'Domo',
    category: -1,
    numberOfRounds: 5,
    date: new Date().toISOString().slice(0, 10),
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
    pointsWin: 2,
    pointsDraw: 1,
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
      'THE Orel Bohunice',
    ]
  },
  players: [],
  rounds: []
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
      console.log(clubName, oldName)
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
      window.setTimeout(function() {
        document.querySelector('.players-list .players-list-item:last-child input:not([readonly])').focus()
      }, 100)
    },
    playerPlacementByIndex: function(playerIndex) {
      return this.tournamentResults.findIndex(function(player) {
        return playerIndex === player.playerIndex
      }) + 1
    },
    removePlayer: function(playerIndex) {
      $('[title]').tooltip('dispose') // otherwise tooltip stays displayed
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

    generateRound: function(roundIndex) {
      var round = {
        matches: [],
        bye: -1,
        refereeCheck: [-1, -1]
      }

      // clone results array and filter unavailable players
      var availablePlayers = this.playerStats.slice().filter((player) => {
        return this.players[player.playerIndex].rounds.indexOf(roundIndex) !== -1
      })

      if (availablePlayers.length < 2) {
        alert('V kole není dostatek hráčů.')
        return
      }

      // assign a bye if round players count odd
      if (availablePlayers.length % 2 === 1) {
        // get bottom half of player results
        var byeCandidates = this.tournamentResults.slice(Math.floor(availablePlayers.length / 2), availablePlayers.length)

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

      var maxDiff = (roundIndex + 1) * this.config.pointsWin

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
              match.push(maxDiff - Math.abs(player.points - opponent.points))
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

      var rawPairing = edmondsBlossom(possiblePairs)
      rawPairing.forEach((match, index) => {
        if (match !== -1 && match < index) {
          round.matches.push({
            home: match,
            home_score: '',
            away: index,
            away_score: '',
            referee: -1
          })
        }
      })

      this.$set(this.rounds, roundIndex, round)
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

    initTooltips: function() {
      $('[title]').tooltip({html: true, trigger: 'hover', removeOnDestroy: true})
    },
    print: function() {
      window.print()
    }
  },
  computed: {
    isTournamentReady: function() {
      return this.playersComplete && this.configComplete
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

    playersSorted: function() {
      return this.players.slice().map(function(item, index) {
        item.playerIndex = index
        return item
      }).sort(function(a, b) {
        return a.surname.localeCompare(b.surname)
      })
    },
    playerNames: function() {
      return this.players.map(function(player) {
        return `${player.surname.toUpperCase()} ${player.name}`
      })
    },
    playerCategories: function() {
      var currentYear = new Date(this.config.date).getFullYear();
      return this.players.map(function(player) {
        var age = currentYear - player.yearOfBirth

        if (age <= 11) {
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
        else if (age <= 14) {
          return {
            'shortcut': 'Z',
            'name': 'St. žáci'
          }
        }
        else if (age <= 17) {
          return {
            'shortcut': 'J',
            'name': 'Junioři'
          }
        }
        else {
          return {
            'shortcut': 'M',
            'name': 'Muži'
          }
        }
      })
    },
    playerStats: function() {
      var results = this.players.map(function(player, playerIndex) {
        return {
          playerIndex: playerIndex,
          points: 0,
          matches: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          referee: 0,
          goalsFor: 0,
          goalsForSort: 0,
          goalsAgainst: 0,
          byes: 0,
          opponents: [],
          opponentsPoints: 0,
          opponentsOpponentsPoints: 0,
          results: [],
          sharedPosition: false
        }
      })
      this.rounds.forEach((round, roundIndex) => {
        // round not complete yet
        if (!this.isRoundComplete(roundIndex)) { return }

        // bye match
        if (round.bye !== -1) {
          results[round.bye].matches++
          results[round.bye].wins++
          results[round.bye].points += this.config.pointsWin
          results[round.bye].byes++
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
          // sum referee
          if (match.referee !== -1) {
            results[match.referee].referee++
          }

          // sum points and score
          var homePlayer = results[match.home]
          var awayPlayer = results[match.away]
          homePlayer.opponents.push(match.away)
          awayPlayer.opponents.push(match.home)
          homePlayer.goalsFor += match.home_score
          homePlayer.goalsForSort += match.home_score > 5 ? 5 : match.home_score
          awayPlayer.goalsFor += match.away_score
          awayPlayer.goalsForSort += match.away_score > 5 ? 5 : match.away_score
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
      results.forEach(function(player) {
        player.opponentsPoints += results.reduce(function(accumulator, opponent) {
          if (player.opponents.indexOf(opponent.playerIndex) !== -1) {
            return accumulator + opponent.points
          }
          else {
            return accumulator
          }
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

      return results
    },

    tournamentResults: function() {
      var results = this.playerStats.slice()
      var categoryWinner = []

      // sort player stats
      results.sort(this.fieldSorter(['-points', '-oppontentsPoints', '-opponentsOpponentsPoints', '-goalsForSort']))

      var previousResult = null
      results.forEach((result, resultIndex) =>  {
        // check category winner
        var category = this.playerCategories[result.playerIndex]
        if (!categoryWinner[category.shortcut]) {
          categoryWinner[category.shortcut] = true
          result.categoryWinner = true
        }

        // check shared positions
        if (previousResult &&
          previousResult.points === result.points &&
          previousResult.oppontentsPoints === result.oppontentsPoints &&
          previousResult.opponentsOpponentsPoints === result.opponentsOpponentsPoints &&
          previousResult.goalsFor === result.goalsFor
        ) {
          result.sharedPosition = true
        }
        previousResult = result

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

      return results
    },
    tournamentDate: function() {
      return new Date(this.config.date).toLocaleDateString();
    },
    tournamentDateValid: function() {
      return /^(\d{4})-(\d{2})-(\d{2})$/.test(this.config.date)
    },

    roundsComplete: function() {
      complete = []
      this.rounds.forEach((round, roundIndex) => {
        if (this.isRoundComplete(roundIndex)) {
          complete.push(roundIndex)
        }
      })
      return complete
    },
    roundsPerPlayers: function() {
      if (this.players.length > 64) return 7
      else if (this.players.length > 32) return 6
      else return 5
    }
  },
  mounted: function() {
    this.initTooltips()
  },
  updated: function() {
    this.initTooltips()
  },
  watch: {
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
