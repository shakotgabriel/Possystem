const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pos');

function createFilesInFolder(folderPath, folderName) {
  const files = [
    `${folderName}.controller.ts`,
    `${folderName}.service.ts`,
    `${folderName}.module.ts`
  ];

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `// ${file}\n\nexport class ${capitalize(folderName)} {}`);
      console.log(`✅ Created: ${filePath}`);
    } else {
      console.log(`⚠️  Already exists: ${filePath}`);
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Read all folders in src
fs.readdirSync(srcPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .forEach(dirent => {
    const folderName = dirent.name;
    const folderPath = path.join(srcPath, folderName);
    createFilesInFolder(folderPath, folderName);
  });
