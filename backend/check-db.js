const sqlite3 = require('sqlite3').verbose();

console.log('🔍 Checking TalentAI Database...\n');

const db = new sqlite3.Database('./talentai.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// Check users table
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('Error fetching tables:', err);
        return;
    }
    
    console.log('\n📋 Database Tables:');
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });
});

// Check existing users
db.all("SELECT id, email, firstName FROM users", (err, users) => {
    if (err) {
        console.error('Error fetching users:', err);
        return;
    }
    
    console.log('\n👥 Existing Users:');
    if (users.length === 0) {
        console.log('  No users found');
    } else {
        users.forEach(user => {
            console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName || 'N/A'}`);
        });
    }
    
    db.close();
});
