console.log('haloo')
const axios = require('axios')
// https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple
function fetchApi() {
  // kerjain disini
  axios.get('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple')
  .then(data => {
    // console.log(data.data)
    let quiz = []
    data.data.results.forEach(element => {
      quiz.push({
        question: element.question,
        correct_answer: element.correct_answer,
        incorrect_answer: element.incorrect_answers
      })
    });
    // console.log(quiz)
    return quiz
  })
  .catch(err => {
    console.log(err)
  })
}

fetchApi()

module.exports = fetchApi
