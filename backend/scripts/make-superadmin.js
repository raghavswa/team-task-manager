/**
 * Usage: node scripts/make-superadmin.js <email>
 * Promotes an existing user to superadmin by email.
 *
 * Example:
 *   node scripts/make-superadmin.js admin@example.com
 */

require('dotenv').config();
const { sequelize, User } = require('../src/models');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/make-superadmin.js <email>');
    process.exit(1);
  }

  await sequelize.authenticate();

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  await user.update({ systemRole: 'superadmin' });
  console.log(`✅ ${user.name} (${user.email}) is now a superadmin.`);
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
