// @ts-nocheck
module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.body && ctx.body.id) {
      try {
        const users = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({
            where: { id: ctx.body.id },
            populate: ["role"],
          });

        if (users && users[0]) {
          const user = users[0];
          delete user.password;
          delete user.resetPasswordToken;
          delete user.confirmationToken;
          ctx.body = user;
        }
      } catch (err) {
        console.error("Error populating role:", err);
      }
    }
  };

  return plugin;
};
