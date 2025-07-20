export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('Server starting - email monitoring will be initialized automatically');
    
    // Note: The Vercel cron job will handle periodic email fetching
    // The server-side monitoring is always active through the cron configuration
    console.log('Email monitoring is configured via Vercel cron (hourly checks)');
    
    // Additional server-side monitoring can be initialized here if needed
    // For now, we rely on the Vercel cron job configuration
  }
}