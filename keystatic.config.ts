/**
 * * This is the Keystatic configuration file. It is used to define the collections and fields that will be used in the Keystatic CMS.
 *
 * ! This works in conjunction with Astro content collections. If you update one, you must update the other.
 *
 * Access keystatic interface at /admin or /keystatic
 * This works in local mode in dev, then cloud mode in prod
 * Cloud deployment is free to sign up (up to 3 users per team)
 * Docs: https://keystatic.com/docs/cloud
 * Create a Keystatic Cloud account here: https://keystatic.cloud/
 */

import Collections from "@components/KeystaticComponents/Collections";
import { config } from "@keystatic/core";

export default config({
  // local mode in dev, Keystatic Cloud in prod (auth handled by Keystatic Cloud)
  storage: import.meta.env.DEV === true ? { kind: "local" } : { kind: "cloud" },
  cloud: { project: "zeta-x/zetax-hp3" },
  ui: {
    brand: { name: "ZetaX" },
  },
  collections: {
    // ZetaX uses only the News collection in the CMS.
    // The theme's Blog / Authors / Other Pages collections are hidden from the
    // admin UI (their content files remain in src/data and are unaffected).
    // To re-enable, uncomment the lines below.
    // blogEN: Collections.Blog("en"),
    // authors: Collections.Authors(""),
    // otherPagesEN: Collections.OtherPages("en"),
    news: Collections.News(),
  },
});
