import { parse } from 'csv-parse';

/**
 * Parse CSV content asynchronously
 * @param csvContent - CSV file content as string
 * @returns Promise resolving to array of records
 */
export const parseCSV = async (csvContent: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on('readable', function () {
      let record;
      while ((record = parser.read()) !== null) {
        results.push(record);
      }
    });

    parser.on('end', () => {
      resolve(results);
    });

    parser.on('error', (err: Error) => {
      reject(err);
    });

    parser.write(csvContent);
    parser.end();
  });
};
