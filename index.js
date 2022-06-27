const fs = require("fs");
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await page.goto("https://food.grab.com/sg/en/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("#location-input");
  //You can search places by replacing singapore on line 16 as second parameter in the type.
  await page.type("#location-input", "woodlands");
  await page.waitForSelector(
    "#page-content > div.sectionContainer___3GDBD.searchSectionContainer___3Lhkk.ant-layout > div > button"
  );
  await page.click(
    "#page-content > div.sectionContainer___3GDBD.searchSectionContainer___3Lhkk.ant-layout > div > button"
  );

  let longitudesAndLatitutdes = [];

  page.on("response", async (response) => {
    if (response.url() == "https://portal.grab.com/foodweb/v2/search") {
      try {
        const { searchResult } = await response.json();
        const latlang = searchResult.searchMerchants.map((a) => a.latlng);
        longitudesAndLatitutdes.push(...latlang);
      } catch (error) {}

      try {
        await page.click("div > button", { waitUntil: "load" });
        console.log(longitudesAndLatitutdes);
        fs.writeFile("./data", JSON.stringify(longitudesAndLatitutdes));
      } catch (error) {}
    }
  });
})();
