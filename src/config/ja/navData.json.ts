/**
 * Navigation config (Japanese) - Home button + Pages dropdown with all sections
 */

import { type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  {
    text: "事業内容",
    dropdown: [
      {
        text: "AI Solution",
        link: "/business/ai-solution",
      },
      {
        text: "PRC",
        link: "/business/prc",
      },
    ],
  },
  {
    text: "メンバー",
    link: "/team",
  },
  {
    text: "採用情報",
    link: "/careers",
  },
  {
    text: "ニュース",
    link: "/#news-section",
  },
];

export default navConfig;
