const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./talentai.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// Check table structure
db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
        console.error('Error fetching table info:', err);
        return;
    }
    
    console.log('\n📋 Users Table Structure:');
    columns.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} (nullable: ${col.notnull ? 'NO' : 'YES'})`);
    });
    
    // Try to insert a test user manually
    console.log('\n🧪 Testing user insertion...');
    db.run(
        'INSERT INTO users (email, password, firstName) VALUES (?, ?, ?)',
        ['test@example.com', 'hashedpassword', 'Test User'],
        function(err) {
            if (err) {
                console.error('❌ Insert failed:', err);
            } else {
                console.log('✅ Insert successful, ID:', this.lastID);
                
                // Clean up test user
                db.run('DELETE FROM users WHERE email = ?', ['test@example.com'], (err) => {
                    if (err) {
                        console.error('Error deleting test user:', err);
                    } else {
                        console.log('🧹 Cleaned up test user');
                    }
                    db.close();
                });
            }
        }
    );
});
