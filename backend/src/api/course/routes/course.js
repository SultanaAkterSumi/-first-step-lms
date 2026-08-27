"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/courses/my-courses",
      handler: "course.findMyCourses",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/courses",
      handler: "course.find",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/courses/:id",
      handler: "course.findOne",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/courses",
      handler: "course.create",
      config: { policies: [] },
    },
    {
      method: "PUT",
      path: "/courses/:id",
      handler: "course.update",
      config: { policies: [] },
    },
    {
      method: "DELETE",
      path: "/courses/:id",
      handler: "course.delete",
      config: { policies: [] },
    },
  ],
};
