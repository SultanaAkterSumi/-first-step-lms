// @ts-nocheck
"use strict";
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::quiz-result.quiz-result",
  ({ strapi }) => ({
    // Student submit  quiz, automatically grade calculed
    async submitQuiz(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const { quizId, answers } = ctx.request.body;
      // answers = [{ questionId: "abc123", selectedOption: "b" }, ...]

      // Fetch all questions for the quiz
      const questions = await strapi
        .documents("api::quiz-question.quiz-question")
        .findMany({
          filters: { quiz: { documentId: quizId } },
        });

      if (!questions.length) return ctx.notFound("No questions found");

      // Auto-grading — Check each answer
      let correct = 0;
      questions.forEach((question) => {
        const userAnswer = answers.find(
          (a) => a.questionId === question.documentId,
        );
        if (
          userAnswer &&
          userAnswer.selectedOption === question.correct_answer
        ) {
          correct++;
        }
      });

      // Score calculation
      const score = Math.round((correct / questions.length) * 100);

      // Check if the student has already attempted the quiz
      const existing = await strapi
        .documents("api::quiz-result.quiz-result")
        .findMany({
          filters: {
            student: user.id,
            quiz: { documentId: quizId },
          },
        });

      let result;
      if (existing.length > 0) {
        // update the existing quiz result if the student has already attempted the quiz
        result = await strapi.documents("api::quiz-result.quiz-result").update({
          documentId: existing[0].documentId,
          data: {
            score,
            correct_answers: correct,
            total_questions: questions.length,
            attempted_at: new Date(),
            publishedAt: new Date(),
          },
        });
      } else {
        // create the quiz result if the student is attempting the quiz for the first time
        result = await strapi.documents("api::quiz-result.quiz-result").create({
          data: {
            student: user.id,
            quiz: quizId,
            score,
            correct_answers: correct,
            total_questions: questions.length,
            attempted_at: new Date(),
            publishedAt: new Date(),
          },
        });
      }

      return {
        data: result,
        score,
        correct,
        total: questions.length,
      };
    },
  }),
);
