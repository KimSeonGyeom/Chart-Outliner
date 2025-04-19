import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Read the CSV file
  const filePath = path.join(process.cwd(), 'backend/data/dummy_data.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse CSV data using basic string operations
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