// @ts-nocheck
module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.body && ctx.body.id) {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        ctx.body.id,
        { populate: ["role"] },
      );

      // Password and sensitive data hide
      delete user.password;
      delete user.resetPasswordToken;
      delete user.confirmationToken;

      ctx.body = user;
    }
  };

  return plugin;
};
