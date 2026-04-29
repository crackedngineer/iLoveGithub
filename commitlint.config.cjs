module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 150], // Increase subject line to 100 chars
    "body-max-line-length": [2, "always", 100], // Increase body line length
  },
};
