import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }

  const xmlText = await response.text();

  const parser = new XMLParser({
    processEntities: false,
    ignoreAttributes: false,
  });

  const parsed = parser.parse(xmlText);

  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error("Invalid RSS feed: missing channel field.");
  }

  const channel = parsed.rss.channel;
  const title = channel.title || "";
  const link = channel.link || "";
  const description = channel.description || "";

  let rawItems = channel.item;
  const items: RSSItem[] = [];

  if (rawItems) {
    const rawItemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
    for (const item of rawItemsArray) {
      if (item.title && item.link && item.description && item.pubDate) {
        items.push({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
        });
      }
    }
  }

  return {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
}
