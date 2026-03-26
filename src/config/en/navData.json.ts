/**
 * Navigation config - Home button + Pages dropdown with all sections (English)
 */

import { type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  {
    text: "Our Business",
    dropdown: [
      {
        text: "AI Solution",
        link: "/en/business/ai-solution",
      },
      {
        text: "PRC",
        link: "/en/business/prc",
      },
    ],
  },
  {
    text: "Our Members",
    link: "/en/team",
  },
  {
    text: "Join Us",
    link: "/en/careers",
  },
  {
    text: "News",
    link: "/en/#news-section",
  },
];

export default navConfig;
