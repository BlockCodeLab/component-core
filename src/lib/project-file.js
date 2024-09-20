import JSZip from 'jszip';
import { exportFile } from './export-file';

export async function saveFile(projectJson) {
  const zip = JSZip();

  if (projectJson.assetList) {
    projectJson.assetList = projectJson.assetList.map(({ data, ...asset }) => {
      if (data && asset.type.startsWith('image/')) {
        zip.file(`${asset.id}.png`, data, { base64: true });
      }
      return asset;
    });
  }
  // console.log(projectJson);
  zip.file('project.json', JSON.stringify(projectJson));

  const blob = await zip.generateAsync({ type: 'blob' });
  exportFile(blob, `${projectJson.name || 'project'}.bcp`);
}

export function openFile() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.bcp';
    fileInput.multiple = false;
    fileInput.click();
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const zip = await JSZip.loadAsync(file);
      const projectRaw = await zip.file('project.json').async('string');
      let projectJson;
      try {
        projectJson = JSON.parse(projectRaw);
      } catch (err) {
        reject(err);
      }
      for (const key in projectJson.assetList) {
        const asset = projectJson.assetList[key];
        const data = await zip.file(`${asset.id}.png`).async('base64');
        projectJson.assetList[key] = { data, ...asset };
      }
      resolve(projectJson);
    });
  });
}
