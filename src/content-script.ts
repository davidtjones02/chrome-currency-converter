/* eslint-disable @typescript-eslint/no-unused-vars */
import XRegExp from "xregexp";
import axios from "axios";

let conversion_rate = 12200.95;

(async () => {
  const savedData = localStorage.getItem("exchangeData");
  if (savedData) {
    const { timestamp, exchange_rate } = JSON.parse(savedData);

    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      conversion_rate = exchange_rate;
      return;
    }
  }

  try {
    const result = await axios.get(`https://open.er-api.com/v6/latest/USD`);

    if (result.data.result === "success") {
      const exchange_rate = result.data.rates.UZS;
      localStorage.setItem(
        "exchangeData",
        JSON.stringify({ timestamp: Date.now(), exchange_rate })
      );
    }
  } catch (err) {
    console.error("Failed to fetch exchange rate:", err);
  }
})();

XRegExp.install({
  astral: true,
});

const pattern = XRegExp(
  `
  (\\d{1,3}(?:[ ,]\\d{3})*(?:[.,]\\d*)?)  # Match the number part
  \\s*                                    # Match any whitespace (including none)
  (?<currency>UZS|so'm|soum|som|сум|ЛВ|СУМ|лв)      # Match the currency and capture it in the "currency" group
`,
  "x"
);

function convertToUSD(_match: string, value: string, _currency: string) {
  const cleanValue = parseFloat(value.replace(/[ ,]/g, "").replace(",", "."));
  const usdValue = (cleanValue / conversion_rate).toFixed(2);
  return `${usdValue} USD`;
}

function replaceCurrencyValues() {
  const textNodes = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode;

  while ((currentNode = textNodes.nextNode())) {
    if (!currentNode.textContent) continue;

    const match = XRegExp.exec(currentNode.textContent, pattern);

    if (match) {
      const convertedValue = convertToUSD(match[0], match[1], match[2]);
      currentNode.textContent = currentNode.textContent.replace(
        pattern,
        convertedValue
      );
    }
  }
}

const observer = new MutationObserver(replaceCurrencyValues);

observer.observe(document.body, { childList: true, subtree: true });

replaceCurrencyValues();
