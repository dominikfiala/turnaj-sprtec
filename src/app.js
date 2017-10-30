Vue.config.devtools = true

var data = {
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
    category: 'Expres',
    numberOfRounds: 5,
    date: new Date().toISOString().slice(0, 10),
    categories: [
      'Expres', 'ČP12', 'ČP24', 'ČP36', 'Czech Open'
    ],
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
    data = Object.assign(data, JSON.parse(store.getItem('data')))
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
        this.$data = Object.assign(this.$data, JSON.parse(reader.result))
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
        bye: -1
      }

      // clone results array and filter unavailable players
      var availablePlayers = this.tournamentResults.slice().filter((player) => {
        return this.players[player.playerIndex].rounds.indexOf(roundIndex) !== -1
      })

      if (availablePlayers.length < 2) {
        alert('V kole není dostatek hráčů.')
        return
      }

      // assign a bye if round players count odd
      if (availablePlayers.length % 2 === 1) {
        // get bottom half of player results
        var byeCandidates = availablePlayers.slice(Math.floor(availablePlayers.length / 2), availablePlayers.length)

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

      // make pairs
      while (availablePlayers.length > 1) {
        var home = availablePlayers.shift()
        // console.log('volno', round.bye);
        // console.log('zapasy', round.matches);
        // console.log('domaci', home.playerIndex);
        var away = false
        var awayCandidateIndex = 0
        while (!away) {
          var awayCandidate = availablePlayers[awayCandidateIndex]
          // console.log('zkousim hosta ', awayCandidate.playerIndex);

          if (!awayCandidate) {
            alert('Nepodařilo se najít kombinace dostupných hráčů, prosím zkuste zápasy generovat znovu. Nejsou opravdu všechny kombinace vyčerpány?')
            return
          }

          if (!this.playersMutualMatch(home.playerIndex, awayCandidate.playerIndex)) {
            away = awayCandidate
            availablePlayers.splice(awayCandidateIndex, 1)
          }

          // console.log('uz spolu hrali');
          awayCandidateIndex++
        }

        var match = {
          home: home.playerIndex,
          away: away.playerIndex,
          home_score: '',
          away_score: '',
          referee: -1
        }
        round.matches.push(match)
      }

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
        this.config.date !== ''
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
          results[round.bye].points++
          results[round.bye].byes++
          results[round.bye].results[roundIndex] = {
            opponent: -1
          }
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
            goalsFor: match.home_score,
            goalsAgainst: match.away_score
          }
          awayPlayer.results[roundIndex] = {
            opponent: match.home,
            goalsFor: match.away_score,
            goalsAgainst: match.home_score
          }

          if (match.home_score > match.away_score) {
            homePlayer.points += 1
            homePlayer.wins += 1
            awayPlayer.losses += 1
          }
          else if (match.home_score < match.away_score) {
            awayPlayer.points += 1
            awayPlayer.wins += 1
            homePlayer.losses += 1
          }
          else {
            homePlayer.points += 0.5
            awayPlayer.points += 0.5
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
      results.forEach((result) =>  {
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
      })

      return results
    },
    tournamentDate: function() {
      return new Date(this.config.date).toLocaleDateString();
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

if ('serviceWorker' in navigator) {
  // Delay registration until after the page has loaded, to ensure that our
  // precaching requests don't degrade the first visit experience.
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', function() {
    // Your service-worker.js *must* be located at the top-level directory relative to your site.
    // It won't be able to control pages unless it's located at the same level or higher than them.
    // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
    // See https://github.com/slightlyoff/ServiceWorker/issues/468
    navigator.serviceWorker.register('service-worker.js').then(function(reg) {
      // updatefound is fired if service-worker.js changes.
      reg.onupdatefound = function() {
        // The updatefound event implies that reg.installing is set; see
        // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
        var installingWorker = reg.installing;

        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and the fresh content will
                // have been added to the cache.
                // It's the perfect time to display a "New content is available; please refresh."
                // message in the page's interface.
                console.log('New or updated content is available.');
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a "Content is cached for offline use." message.
                console.log('Content is now available offline!');
              }
              break;

            case 'redundant':
              console.error('The installing service worker became redundant.');
              break;
          }
        };
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  });
}
