// backup-script.js
const { exec } = require('child_process');
const cron = require('node-cron');

const backupDatabase = () => {
    const date = new Date().toISOString().split('T')[0];
    const command = `mongodump --uri="${process.env.MONGODB_URI}" --out=./backups/${date}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Backup failed:', error);
            return;
        }
        console.log('Backup completed:', stdout);
    });
};

// Schedule daily backups at 2 AM
cron.schedule('0 2 * * *', backupDatabase);