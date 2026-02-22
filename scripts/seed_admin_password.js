const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: '../backend/.env' });

const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433'),
    database: process.env.DATABASE_NAME || 'opssightai',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'OpsSightSecureDBPassword2026!',
});

async function updateAdminPassword() {
    const plainTextPassword = 'OpsSight2026!';
    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        console.log('Successfully hashed the new admin password.');

        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hashedPassword, 'admin@opssightai.com']
        );

        if (result.rows.length > 0) {
            console.log(`Updated password for user: ${result.rows[0].email}`);
        } else {
            console.log('User admin@opssightai.com not found. Password NOT updated.');
        }
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        pool.end();
    }
}

updateAdminPassword();
