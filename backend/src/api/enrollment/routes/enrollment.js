"use strict";

module.exports = {
  routes: [
    // Custom routes
    {
      method: "GET",
      path: "/enrollments/my-courses",
      handler: "enrollment.getMyCourses",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/enrollments/enroll",
      handler: "enrollment.create",
      config: { policies: [] },
    },

    // Default routes
    {
      method: "GET",
      path: "/enrollments",
      handler: "enrollment.find",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/enrollments/:id",
      handler: "enrollment.findOne",
      config: { policies: [] },
    },
    {
      method: "DELETE",
      path: "/enrollments/:id",
      handler: "enrollment.delete",
      config: { policies: [] },
    },
    {
      method: "PUT",
      path: "/enrollments/:id/complete-lesson",
      handler: "enrollment.completeLesson",
      config: { policies: [] },
    },
  ],
};
