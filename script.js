const { _electron: electron } = require('playwright');
const { existsSync, rmdirSync, mkdirSync, writeFileSync } = require('fs');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

const obsidianRootPath = "/tmp/obsidian-root"
const vault_path = `${process.cwd()}/vault-test`;
const output_path = `${process.cwd()}/output`;

const pre_html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="app.css" type="text/css" rel="stylesheet">
  </head>

`
const writeCustomCss = async (window) => {

  const appCss = await window.evaluate(async () => {
    const fs = require('fs');
    const asarFilePath = `/tmp/obsidian-root/resources/obsidian.asar`;
    console.log(fs.readdirSync(asarFilePath));
    const appCss = fs.readFileSync(`${asarFilePath}/app.css`);
    console.log(appCss);
    const customizedCss = Array.from(document.querySelectorAll("style")).map(x => x.outerHTML).join("\n")
    return `${appCss}\n${customizedCss}`;
  });

  const fs = require('fs');
  fs.writeFileSync(`${output_path}/app.css`, appCss);
}

const setupConfig = () => {
  const config_folder = `${os.homedir()}/.config/obsidian`;
  if (existsSync(config_folder)) {
    console.log('exists')
    rmdirSync(config_folder, { recursive: true });
  }

  if (existsSync(output_path)) {
    console.log('exists', output_path)
    rmdirSync(output_path, { recursive: true });
  }

  mkdirSync(config_folder);
  mkdirSync(output_path);

  writeFileSync(`${config_folder}/obsidian.json`, `{"vaults":{"778689a4b2520d50":{"path":"${vault_path}","ts":1681676064550,"open":true}}}`);
}

const getInternalLinks = async (window) => {
  return await window.evaluate(async () => {
    const links = Array.from(document.querySelectorAll(".internal-link")).map(n => n.attributes["href"].value)
    return [...new Set(links)];
  })
}

const getBody = async (window) => {
  return await window.evaluate(async () => {
    console.log('inside window evaluate');
    const e = document.querySelector(".mod-root .mod-active .markdown-reading-view");
    const content = e.outerHTML
    const getAllParents = (element) => {
      console.log('get all parents...');
      if (element.tagName !== "BODY") {
        const a = getAllParents(element.parentElement);
        a.push(element.parentElement)
        return a;
      } else {
        return [];
      }
    }
    function getParentTagWithoutChildren(element) {
      const parent = element;
      const attrs = Array.from(parent.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');

      return `<${parent.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>`;
    }

    const parents = getAllParents(e)
    const body = parents.map(getParentTagWithoutChildren).join("\n")
      + content
      + parents.reverse().map(x => `</${x.tagName.toLowerCase()}>`).join('\n');

    return body;
  })
}


async function writeFileToPath(filePath, data) {
  try {
    const folderPath = path.dirname(filePath);
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, data, 'utf8');
    console.log('File has been written successfully.');
  } catch (error) {
    console.error('Error writing file:', error);
  }
}

(async () => {
  setupConfig();

  // Launch Electron app.
  const electronApp = await electron.launch({ executablePath: `${obsidianRootPath}/obsidian`, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    return app.getAppPath();
  });

  const window = await electronApp.firstWindow();
  console.log(await window.title());
  window.on('console', console.log);//

  await window.waitForTimeout(500);
  await window.click('text=trust author and enable plugins');

  // await window.click('text=Indexing complete');
  await window.waitForTimeout(1000);

  await window.keyboard.press("Escape");
  await window.waitForTimeout(500);
  await window.keyboard.press("Escape");


  // Close all tabs -- dirty for now
  await Array.from({ length: 10 }).forEach(async (_, i) => {
    await window.keyboard.press("Control+w")
  });

  await window.waitForTimeout(500);
  await writeCustomCss(window);


  // Open Publish page
  await window.keyboard.press("Control+o")
  await window.keyboard.type("Publish");
  await window.keyboard.press("Enter")
  await window.waitForTimeout(500);

  // Move to reading mode
  await window.keyboard.press("Control+e")
  await window.waitForTimeout(500);
  await window.keyboard.press("Escape")

  const body = await getBody(window);
  await writeFileToPath(`${output_path}/publish.html`, pre_html + body + "</html>");

  const links = await getInternalLinks(window);
  for (const link of links) {
    console.log(`Processing ${link}`);
    // Open Publish page
    await window.keyboard.press("Control+o")
    await window.keyboard.type(link);
    await window.waitForTimeout(100);
    await window.keyboard.press("Enter")
    await window.waitForTimeout(200);

    console.log('before get body');
    const body = await getBody(window);
    await writeFileToPath(`${output_path}/${link}`, pre_html + body + "</html>");
  };
  await electronApp.close();
})();
