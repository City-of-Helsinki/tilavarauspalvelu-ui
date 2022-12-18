module.exports = {
  i18n: {
    defaultLocale: "fi",
    locales: ["fi", "en", "sv"],
  },
  localePath:
    typeof window === "undefined"
      ? require("path").resolve("./public/locales")
      : "/public/locales",
};
