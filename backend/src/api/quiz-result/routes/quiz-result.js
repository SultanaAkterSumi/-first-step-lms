"use strict";

module.exports = {
  routes: [
    // Default routes
    {
      method: "GET",
      path: "/quiz-results",
      handler: "quiz-result.find",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/quiz-results/:id",
      handler: "quiz-result.findOne",
      config: { policies: [] },
    },

    // Custom route — quiz submit
    {
      method: "POST",
      path: "/quiz-results/submit",
      handler: "quiz-result.submitQuiz",
      config: { policies: [] },
    },
  ],
};
