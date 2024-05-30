export function exportFile(data, filename) {
  const link = document.createElement('a');
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
}
