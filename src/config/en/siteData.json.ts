import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "ZetaX",
  // Your website's title and description (meta fields)
  title: "ZetaX | Manufacturing Anomaly Detection — Let AI Watch. Let Humans Create.",
  description:
    "ZetaX, a deep-tech startup from the University of Tokyo. A manufacturing-focused anomaly detection system powered by a proprietary algorithm — GPU-free, cloud-free edge AI for predictive maintenance.",

  // used on contact page and footer
  contact: {
    address1: "1234 Example Street",
    address2: "Tokyo, Japan",
    phone: "(123) 456-7890",
    email: "info@zetax.jp",
  },

  // Your information for blog post purposes
  author: {
    name: "ZetaX Team",
    email: "info@zetax.jp",
    twitter: "ZetaX_JP",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/icon_image/ロゴ背景紺.png",
    alt: "ZetaX Logo",
  },
};

export default siteData;
