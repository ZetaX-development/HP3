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
