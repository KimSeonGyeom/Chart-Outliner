import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  // Get the URL to check for query parameters
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  
  // Read the CSV file
  const filePath = path.join(process.cwd(), 'backend/data/dummy_data.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // If raw format is requested, return the CSV as text
  if (format === 'raw') {
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  }
  
  // Otherwise parse CSV data using basic string operations
  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const records = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
  
  // Return the parsed data as JSON
  return NextResponse.json(records);
} 