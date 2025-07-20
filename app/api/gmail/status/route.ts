import { NextResponse } from 'next/server';

// This will be set to true when the server starts monitoring
let serverMonitoringActive = true;

export async function GET() {
  return NextResponse.json({
    serverMonitoring: serverMonitoringActive,
    message: 'Server-side email monitoring is active'
  });
}

// Export function to update status (used by init route)
export function setServerMonitoringStatus(status: boolean) {
  serverMonitoringActive = status;
}