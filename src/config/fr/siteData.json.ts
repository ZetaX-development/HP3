import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "ZetaX",
  // Your website's title and description (meta fields)
  title: "ZetaX | 製造業向け 異常検知システム ― 「見張る」はAIに。「創る」は人に。",
  description:
    "東大発ディープテックスタートアップZetaX。製造業に特化した独自アルゴリズムの異常検知システムで、GPU不要・クラウド不要のエッジAIによる予兆保全を実現します。",

  // used on contact page and footer
  contact: {
    address1: "1234 Main Street",
    address2: "New York, NY 10001",
    phone: "(123) 456-7890",
    email: "creator@cosmicthemes.com",
  },

  // Your information for blog post purposes
  author: {
    name: "Cosmic Themes",
    email: "creator@cosmicthemes.com",
    twitter: "Cosmic_Themes",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/cosmic-themes-logo.jpg",
    alt: "Cosmic Themes logo",
  },
};

export default siteData;
