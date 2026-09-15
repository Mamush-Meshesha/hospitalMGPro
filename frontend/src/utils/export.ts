/**
 * Converts an array of objects into a CSV string and triggers a browser download.
 * @param data Array of objects to export
 * @param filename Desired filename (e.g. 'report.csv')
 */
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert rows to CSV format
  const csvRows = data.map(row => {
    return headers.map(header => {
      let cell = row[header];
      if (cell === null || cell === undefined) {
        cell = '';
      } else if (typeof cell === 'object') {
        cell = JSON.stringify(cell);
      }
      
      cell = cell.toString();
      // Escape quotes
      cell = cell.replace(/"/g, '""');
      
      // Wrap in quotes if it contains comma, newline or quotes
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`;
      }
      return cell;
    }).join(',');
  });

  // Combine headers and rows
  const csvString = [headers.join(','), ...csvRows].join('\n');
  
  // Create blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
