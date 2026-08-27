// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      const { courseId } = ctx.request.body.data;
      if (!courseId) return ctx.badRequest("courseId is required");

      // Already enrolled check
      const existing = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: {
            student: { id: user.id },
            course: { documentId: courseId },
          },
        });

      if (existing.length > 0) {
        return ctx.badRequest("Already enrolled in this course");
      }

      // Enroll
      const enrollment = await strapi
        .documents("api::enrollment.enrollment")
        .create({
          data: {
            student: user.id,
            course: courseId,
            enrolled_at: new Date(),
          },
          populate: ["course", "student", "completed_lessons"],
        });

      return { data: enrollment };
    },

    async getMyCourses(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const enrollments = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: {
            student: { id: user.id },
          },
          populate: ["course", "completed_lessons"],
        });

      return { data: enrollments };
    },
    // Instructor এর course এর students
    async getCourseStudents(ctx) {
      const { courseId } = ctx.params;

      const enrollments = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: { course: { documentId: courseId } },
          populate: ["student", "completed_lessons"],
        });

      const sanitized = enrollments.map((enrollment) => {
        if (enrollment.student) {
          delete enrollment.student.password;
          delete enrollment.student.resetPasswordToken;
          delete enrollment.student.confirmationToken;
        }
        return enrollment;
      });

      return { data: sanitized };
    },
    async completeLesson(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const { id } = ctx.params;
      const { lessonId } = ctx.request.body;

      const enrollment = await strapi
        .documents("api::enrollment.enrollment")
        .findOne({
          documentId: id,
          populate: ["completed_lessons", "student"],
        });

      if (!enrollment) return ctx.notFound("Enrollment not found");

      const student = enrollment.student;
      if (!student || student.id !== user.id) return ctx.forbidden();

      const completedLessons = enrollment.completed_lessons || [];
      const alreadyDone = completedLessons.some(
        (l) => l.documentId === lessonId,
      );
      if (alreadyDone) return { data: enrollment };

      const updated = await strapi
        .documents("api::enrollment.enrollment")
        .update({
          documentId: id,
          data: {
            completed_lessons: {
              connect: [{ documentId: lessonId }],
            },
          },
          populate: ["completed_lessons"],
        });

      return { data: updated };
    },
  }),
);
