// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::blog-post.blog-post",
  ({ strapi }) => ({
    // Admin and content manager can see all posts
    // Public just see published posts
    async find(ctx) {
      const user = ctx.state.user;

      //Admin and content manager can see all posts
      if (user && ["admin", "content_manager"].includes(user.role?.type)) {
        return await super.find(ctx);
      }

      // Public just see published posts
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          post_status: "published",
        },
      };

      return await super.find(ctx);
    },
  }),
);
