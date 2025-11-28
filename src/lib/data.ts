export interface ContributionOption {
  id: string;
  amount: number;
  title: string;
  description: string;
  includesMerch?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  contributionOptions: ContributionOption[];
}

export const campaigns: Campaign[] = [
  {
  id: "album-launch",
  title: "Debut Album Launch Campaign",
  description: "Support the launch of our debut album 'Midnight Echoes'. Help us bring this collection of 12 original tracks to life with professional production, studio time, and marketing.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    contributionOptions: [
    {
    id: "digital",
    amount: 2500,
    title: "Access Level",
    description: "Downloads + personal referral batch"
    },
    {
    id: "vinyl",
    amount: 7500,
    title: "VIP Contributor",
    description: "Exclusive content"
    },
    {
    id: "producer",
    amount: 15000,
    title: "Merch VIP",
    description: "Merch access + loyalty perks",
    includesMerch: true
    }
    ]
  },
  {
  id: "ep-release",
  title: "EP Release Campaign",
  description: "Launching our new 6-track EP 'Urban Dreams'. Your support will fund mixing, mastering, music videos, and promotional materials to get our sound heard worldwide.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    contributionOptions: [
    {
    id: "streaming",
    amount: 1500,
    title: "Access Level",
    description: "Downloads + personal referral batch"
    },
    {
    id: "limited-edition",
    amount: 5000,
    title: "VIP Contributor",
    description: "Exclusive content"
    },
    {
    id: "creative-director",
    amount: 10000,
    title: "Merch VIP",
    description: "Merch access + loyalty perks",
    includesMerch: true
    }
    ]
  },
  {
  id: "singles-launch",
  title: "Singles Collection Launch",
  description: "Celebrate our journey with a collection of 4 remastered singles plus 2 brand new tracks. Support the music video production and global distribution.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    contributionOptions: [
    {
    id: "download",
    amount: 1000,
    title: "Access Level",
    description: "Downloads + personal referral batch"
    },
    {
    id: "collector",
    amount: 3500,
    title: "VIP Contributor",
    description: "Exclusive content"
    },
    {
    id: "video-producer",
    amount: 8000,
    title: "Merch VIP",
    description: "Merch access + loyalty perks",
    includesMerch: true
    }
    ]
  }
];

export const contributionOptions: ContributionOption[] = [
  {
    id: "digital",
    amount: 1500,
    title: "Digital Fan",
    description: "Early digital access and updates"
  },
  {
    id: "collector",
    amount: 5000,
    title: "Collector",
    description: "Exclusive merchandise + digital access",
    includesMerch: true
  },
  {
    id: "producer",
    amount: 10000,
    title: "Executive Producer",
    description: "VIP credits + premium merch + exclusive experiences",
    includesMerch: true
  }
];

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find(campaign => campaign.id === id);
}

export function getDummyCampaign(id: string): Campaign {
return {
id,
title: `Music Release: ${id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
description: "Support this exciting new music release! Help bring fresh sounds to the world with professional production, stunning visuals, and global distribution.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    contributionOptions: [
    {
    id: "digital",
    amount: 1500,
    title: "Access Level",
    description: "Downloads + personal referral batch"
    },
    {
    id: "collector",
    amount: 5000,
    title: "VIP Contributor",
    description: "Exclusive content"
    },
    {
    id: "producer",
    amount: 10000,
    title: "Merch VIP",
    description: "Merch access + loyalty perks",
    includesMerch: true
    }
    ]
  };
}
