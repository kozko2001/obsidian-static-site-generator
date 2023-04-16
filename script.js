const { _electron: electron } = require('playwright');
const { existsSync, rmdirSync, mkdirSync, writeFileSync } = require('fs');

const setupConfig = () => {
  const vault_path = '/home/kozko/vault-test/obsidian-notes'
  const config_folder = '/home/kozko/.config/obsidian';
  if(existsSync(config_folder)){
    console.log('exists')
    rmdirSync(config_folder, { recursive: true });
  }

  mkdirSync(config_folder);
  writeFileSync(`${config_folder}/obsidian.json`, `{"vaults":{"778689a4b2520d50":{"path":"${vault_path}","ts":1681676064550,"open":true}}}`);
}

(async () => {
  setupConfig();

  // Launch Electron app.
  const electronApp = await electron.launch({ executablePath: '/tmp/obsidian-root/obsidian' });

  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    return app.getAppPath();
  });

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();
  // Print the title.
  console.log(await window.title());
  // Capture a screenshot.
  // Direct Electron console to Node terminal.
  window.on('console', console.log);//
  
  const p = await window.content();
  console.log(p)
  await window.waitForTimeout(500);
  await window.click('text=trust author and enable plugins');

  await window.click('text=Indexing complete');
  await window.keyboard.press("Escape");
  await window.waitForTimeout(500);
  await window.keyboard.press("Escape");


  await window.waitForTimeout(500);

  await window.keyboard.press("Control+e")
  await window.evaluate(async () => {
    const e = document.querySelectorAll(".mod-root .mod-active .markdown-reading-view");
    console.log(e);
    e.forEach(x => {
    const content = x.outerHTML
    console.log(x.outerHTML, x.outerText);
    })
    return 'heeeloooo';
  })

  await window.waitForTimeout(500000);
  // Exit app.
  await electronApp.close();
})();
