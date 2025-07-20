import { NextResponse } from 'next/server';

// Global state for email monitoring
let monitoringInterval: NodeJS.Timeout | null = null;
const MONITORING_INTERVAL = 30 * 60 * 1000; // 30 minutes

export async function POST() {
  try {
    // Clear any existing interval
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    // Start monitoring interval
    monitoringInterval = setInterval(async () => {
      try {
        console.log('Automatic email check triggered');
        
        // Call the fetch endpoint internally
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/gmail/fetch`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Automatic email check completed: ${data.newEmails || 0} new emails`);
        } else {
          console.error('Automatic email check failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error during automatic email check:', error);
      }
    }, MONITORING_INTERVAL);

    // Run the first check immediately
    setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/gmail/fetch`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Initial email check completed: ${data.newEmails || 0} new emails`);
        }
      } catch (error) {
        console.error('Error during initial email check:', error);
      }
    }, 5000); // Wait 5 seconds for server to fully initialize

    return NextResponse.json({ 
      success: true, 
      message: 'Email monitoring initialized',
      interval: MONITORING_INTERVAL / 1000 / 60 // Return interval in minutes
    });
  } catch (error) {
    console.error('Failed to initialize email monitoring:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize monitoring' },
      { status: 500 }
    );
  }
}