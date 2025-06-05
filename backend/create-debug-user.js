const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

async function createDebugUser() {
    const db = new sqlite3.Database('./talentai.db');
    
    try {
        const hashedPassword = await bcrypt.hash('debugpass123', 10);
        
        // Delete existing debug user if exists
        db.run('DELETE FROM users WHERE email = ?', ['debug2@test.com'], (err) => {
            if (err) console.error('Delete error:', err);
        });
        
        // Create new debug user
        db.run(
            'INSERT INTO users (email, password, firstName) VALUES (?, ?, ?)',
            ['debug2@test.com', hashedPassword, 'Debug User'],
            function(err) {
                if (err) {
                    console.error('Error creating debug user:', err);
                } else {
                    console.log('✅ Debug user created successfully with ID:', this.lastID);
                    console.log('Email: debug2@test.com');
                    console.log('Password: debugpass123');
                }
                db.close();
            }
        );
    } catch (error) {
        console.error('Error:', error);
        db.close();
    }
}

createDebugUser();
