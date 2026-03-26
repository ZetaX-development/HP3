import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "ZetaX",
  // Your website's title and description (meta fields)
  title: "ZetaX - 東大発 DeepTechスタートアップ | Photonics Reservoir Computing",
  description:
    "東大発DeepTechスタートアップZetaX。Photonics Reservoir ComputingとAI技術で次世代のイノベーションを創出。",

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
