// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::course.course", ({ strapi }) => ({
  // All courses with instructor
  async find(ctx) {
    const courses = await strapi.documents("api::course.course").findMany({
      populate: ["instructor"],
    });

    const sanitized = courses.map((course) => {
      if (course.instructor) {
        delete course.instructor.password;
        delete course.instructor.resetPasswordToken;
        delete course.instructor.confirmationToken;
      }
      return course;
    });

    return { data: sanitized };
  },

  // Instructor's courses
  async findMyCourses(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const courses = await strapi.documents("api::course.course").findMany({
      filters: { instructor: { id: user.id } },
      populate: ["instructor"],
    });

    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const lessons = await strapi.documents("api::lesson.lesson").findMany({
          filters: { course: { documentId: course.documentId } },
        });
        if (course.instructor) {
          delete course.instructor.password;
          delete course.instructor.resetPasswordToken;
          delete course.instructor.confirmationToken;
        }
        return { ...course, lessonCount: lessons.length };
      }),
    );

    return { data: coursesWithCount };
  },
}));
