// @ts-nocheck
module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.body && ctx.body.id) {
      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: ctx.body.documentId,
          populate: ["role"],
        });

      if (user) {
        delete user.password;
        delete user.resetPasswordToken;
        delete user.confirmationToken;
        ctx.body = user;
      }
    }
  };

  return plugin;
};
