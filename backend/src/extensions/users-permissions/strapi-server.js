// @ts-nocheck
module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.body && ctx.body.id) {
      try {
        const user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: ctx.body.id },
            populate: ["role"],
          });

        if (user) {
          delete user.password;
          delete user.resetPasswordToken;
          delete user.confirmationToken;
          ctx.body = user;
        }
      } catch (err) {
        console.error("Role populate error:", err.message);
      }
    }
  };

  return plugin;
};
