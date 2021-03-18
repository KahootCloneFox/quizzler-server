console.log('haloo')
const axios = require('axios')
function fetchApi() {
  return axios
    .get(
      'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple',
    )
    .then(data => {
      let quiz = []
      data.data.results.forEach(element => {
        quiz.push({
          question: element.question,
          correct_answer: element.correct_answer,
          incorrect_answer: element.incorrect_answers,
        })
      })
      return quiz
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = fetchApi
