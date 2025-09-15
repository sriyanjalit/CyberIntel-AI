import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/database';
import { User, Feed } from '../models';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

    // Seed Users
    const users = [
      { email: 'admin@company.com', name: 'Admin User', role: 'admin', password: 'password' },
      { email: 'analyst@company.com', name: 'Security Analyst', role: 'analyst', password: 'password' }
    ];

    for (const u of users) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, rounds);
        await User.create({ email: u.email, name: u.name, role: u.role as any, password: hashed });
      }
    }

    // Seed Feeds
    const feeds = [
      { id: 'cve-mitre', name: 'CVE Database', url: 'https://cve.mitre.org/data/downloads/allitems.xml', type: 'xml', category: 'open_web', fetchInterval: '0 */6 * * *' },
      { id: 'nvd-nist', name: 'NVD Database', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml', type: 'rss', category: 'open_web', fetchInterval: '0 */4 * * *' },
      { id: 'us-cert', name: 'US-CERT Alerts', url: 'https://www.us-cert.gov/ncas/alerts.xml', type: 'rss', category: 'open_web', fetchInterval: '0 */2 * * *' }
    ];

    for (const f of feeds) {
      const existing = await Feed.findByPk(f.id);
      if (!existing) {
        await Feed.create({
          id: f.id,
          name: f.name,
          url: f.url,
          type: f.type as any,
          category: f.category as any,
          fetchInterval: f.fetchInterval,
          enabled: true
        });
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();


