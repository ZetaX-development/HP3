import { type teamMember } from "@config/types/configDataTypes";

export const teamData: teamMember[] = [
  // CEOs
  {
    image: {
      src: "/people/team1.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "Kyosuke Yanagisawa",
    title: "Co-CEO",
    bio: `The University of Tokyo, Faculty of Engineering (Admitted via Selective Recommendation Track).
    
    Distinguished award winner in competitions such as the Nikkei Stock League, Mynavi Career Koshien, and Cyber Sakura. Leads the team as Product Manager while actively engineering at a UTokyo AI startup. Successfully drove operational efficiency improvements for major hotels and logistics warehouses.`,
  },
  {
    image: {
      src: "/people/team2.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "Yo Sato",
    title: "Co-CEO",
    bio: `The University of Tokyo, College of Arts and Sciences (Natural Sciences II).
    
    Recipient of the Excellence Award at Japan National Model United Nations and multiple awards in Mathematical Olympiads (Brazil and Japan). Brings extensive project management experience from a UTokyo startup and a VC firm. Spent over a decade living abroad and is fluent in four languages.`,
  },
  // Engineers
  {
    image: {
      src: "/people/team3.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "Yukito Gou",
    title: "Engineer",
    bio: `University of Tsukuba, College of Information Science.
    
    A full-stack engineer who began his development career at age 10. Possessing exceptional technical skills, he has extensive professional experience ranging from government initiatives to solutions for publicly listed companies.`,
  },
  {
    image: {
      src: "/people/team4.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "Taro Sakaguchi",
    title: "Engineer",
    bio: `Institute of Science Tokyo, School of Materials and Chemical Technology.
    
    Specializes in theoretical calculations for battery and semiconductor materials. Expert in leveraging supercomputers and deep learning for both academic research and practical applications. Currently engaged in national and industry projects.`,
  },
  {
    image: {
      src: "/people/team8.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "Hinaki Sugiura",
    title: "Engineer",
    bio: `Sophia University, Graduate School of Science and Technology.
    
    Specializes in semiconductors, nanophysics, and photonics, with strong expertise in data science. Proven track record in developing foundation models and LLMs, analyzing time-series data, and authoring academic papers. Leverages business insight to deliver technical solutions aligned with strategic goals.`,
  },
  {
    image: {
      src: "/people/team5.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "Kazuki Tsukamoto",
    title: "Engineer",
    bio: `The University of Tokyo, College of Arts and Sciences (Natural Sciences I).
    
    A full-stack engineer who built a fully functional E-commerce platform from scratch. Proficient in blockchain technologies with a tech stack that includes TypeScript, Go, Python, PyTorch, and Solidity.`,
  },
  {
    image: {
      src: "/people/team6.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "Yoshisei Matsumoto",
    title: "Engineer",
    bio: `Institute of Science Tokyo, School of Life Science and Technology.
    
    Researcher focused on developing gene structure annotation tools using deep learning. Possesses extensive practical experience as a full-stack engineer (Web, Frontend, and Backend) at major corporations.`,
  },
  {
    image: {
      src: "/people/team7.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "Takahiro Suzuki",
    title: "Engineer",
    bio: `International Professional University of Technology in Tokyo.
    
    Developed the Stable Diffusion extension library 'auto_diffusers' as a high school student, which was featured in the official Hugging Face documentation. Active open-source contributor and speaker on MediaPipe technology at DevFest 2025.`,
  },
];

export default teamData;