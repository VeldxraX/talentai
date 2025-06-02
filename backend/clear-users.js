const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./talentai.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// Clear all users to reset for testing
db.run("DELETE FROM users", (err) => {
    if (err) {
        console.error('Error clearing users:', err);
    } else {
        console.log('🧹 Cleared all existing users from database');
    }
    
    db.close(() => {
        console.log('Database connection closed');
    });
});
