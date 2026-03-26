/**
 * Navigation config - Home button + Pages dropdown with all sections
 */

import { type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  {
    text: "Top",
    link: "/",
  },
  {
    text: "Our Business",
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
    text: "Our Members",
    link: "/team",
  },
  {
    text: "News",
    link: "/#news-section",
  },
  {
    text: "Join Us",
    link: "/careers",
  },
];

export default navConfig;
